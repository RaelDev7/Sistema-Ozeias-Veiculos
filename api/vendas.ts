import { eq } from "drizzle-orm";
import { db, schema, metodoNaoPermitido, erroServidor, uid } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

function rowParaVenda(row: any) {
  const { dadosContrato, ...resto } = row;
  return { ...resto, contrato: dadosContrato ? JSON.parse(dadosContrato) : undefined };
}

function vendaParaRow(venda: any) {
  const { contrato, ...resto } = venda;
  return { ...resto, dadosContrato: contrato ? JSON.stringify(contrato) : null };
}

async function gerarParcelas(venda: any) {
  await db.delete(schema.parcelas).where(eq(schema.parcelas.vendaId, venda.id));
  const valorAParcelar = venda.valorVenda - (venda.valorEntrada || 0);
  const valorParcela = valorAParcelar / venda.numeroParcelas;
  const dataBase = new Date(venda.data);
  const linhas = [];
  for (let i = 1; i <= venda.numeroParcelas; i++) {
    const venc = new Date(dataBase);
    venc.setMonth(venc.getMonth() + i);
    linhas.push({
      id: uid(),
      vendaId: venda.id,
      numero: i,
      valorDevido: Math.round(valorParcela * 100) / 100,
      valorPago: 0,
      dataVencimento: venc.toISOString().slice(0, 10),
      dataPagamento: null,
      status: "pendente" as const,
    });
  }
  if (linhas.length > 0) await db.insert(schema.parcelas).values(linhas);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const rows = await db.select().from(schema.vendas);
      return res.status(200).json(rows.map(rowParaVenda));
    }

    if (req.method === "POST") {
      const venda = req.body;
      const row = vendaParaRow(venda);

      const existente = await db
        .select()
        .from(schema.vendas)
        .where(eq(schema.vendas.id, venda.id));

      if (existente.length === 0) {
        // Nova venda: cria o registro, gera as parcelas e marca o veículo como vendido
        await db.insert(schema.vendas).values(row);
        await gerarParcelas(venda);
        await db
          .update(schema.veiculos)
          .set({ status: "vendido" })
          .where(eq(schema.veiculos.id, venda.veiculoId));

        // Valor de entrada já é dinheiro recebido na hora — lança direto como
        // entrada no caixa (mesmo vínculo de id usado na baixa de parcela)
        if (venda.valorEntrada > 0) {
          await db.insert(schema.movimentacoes).values({
            id: `entrada_${venda.id}`,
            tipo: "entrada",
            valor: venda.valorEntrada,
            descricao: "Entrada recebida na venda",
            categoria: "Entrada de venda",
            data: venda.data,
            veiculoId: venda.veiculoId,
          });
        }
      } else {
        // Venda existente: se nada foi pago ainda, pode reajustar valor/entrada/
        // parcelas e regenerar tudo. Se já tem pagamento registrado, bloqueia
        // mudança nesses campos financeiros pra não bagunçar o que já foi pago.
        const anterior = existente[0];
        const parcelasAtuais = await db
          .select()
          .from(schema.parcelas)
          .where(eq(schema.parcelas.vendaId, venda.id));
        const jaTemPagamento = parcelasAtuais.some((p) => Number(p.valorPago) > 0);

        const mudouFinanceiro =
          Number(anterior.valorVenda) !== Number(venda.valorVenda) ||
          Number(anterior.valorEntrada) !== Number(venda.valorEntrada) ||
          anterior.numeroParcelas !== venda.numeroParcelas ||
          anterior.formaPagamento !== venda.formaPagamento;

        if (mudouFinanceiro && jaTemPagamento) {
          return res.status(400).json({
            erro:
              "Essa venda já tem pagamento registrado — não dá pra mudar valor, entrada, forma de pagamento ou número de parcelas. Só edite esses campos se nenhuma parcela tiver sido paga ainda.",
          });
        }

        await db.update(schema.vendas).set(row).where(eq(schema.vendas.id, venda.id));

        if (mudouFinanceiro) {
          await gerarParcelas(venda);
        }

        // Se trocou o veículo da venda, devolve o carro antigo pro estoque
        // disponível e marca o novo como vendido
        if (anterior.veiculoId !== venda.veiculoId) {
          await db
            .update(schema.veiculos)
            .set({ status: "disponivel" })
            .where(eq(schema.veiculos.id, anterior.veiculoId));
          await db
            .update(schema.veiculos)
            .set({ status: "vendido" })
            .where(eq(schema.veiculos.id, venda.veiculoId));
        }
      }

      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const id = String(req.query.id ?? "");
      if (!id) return res.status(400).json({ erro: "id obrigatório" });
      await db.delete(schema.parcelas).where(eq(schema.parcelas.vendaId, id));
      await db.delete(schema.movimentacoes).where(eq(schema.movimentacoes.id, `entrada_${id}`));
      await db.delete(schema.vendas).where(eq(schema.vendas.id, id));
      return res.status(200).json({ ok: true });
    }

    return metodoNaoPermitido(res);
  } catch (e) {
    return erroServidor(res, e);
  }
}
