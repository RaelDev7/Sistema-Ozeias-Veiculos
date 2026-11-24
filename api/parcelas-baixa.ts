import { eq } from "drizzle-orm";
import { db, schema, metodoNaoPermitido, erroServidor, uid } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return metodoNaoPermitido(res);

    const { parcelaId, valorPago, dataPagamento } = req.body as {
      parcelaId: string;
      valorPago: number;
      dataPagamento: string;
    };
    if (!parcelaId || !valorPago) return res.status(400).json({ erro: "dados incompletos" });

    const [parcela] = await db
      .select()
      .from(schema.parcelas)
      .where(eq(schema.parcelas.id, parcelaId));
    if (!parcela) return res.status(404).json({ erro: "parcela não encontrada" });

    const novoValorPago = Number(parcela.valorPago) + Number(valorPago);
    const status = novoValorPago >= Number(parcela.valorDevido) ? "pago" : "parcial";

    await db
      .update(schema.parcelas)
      .set({
        valorPago: novoValorPago,
        dataPagamento,
        status,
      })
      .where(eq(schema.parcelas.id, parcelaId));

    // Registra automaticamente essa entrada no caixa (Entrada & Saída / saldo do Dashboard),
    // vinculada ao veículo da venda, pra não precisar lançar isso duas vezes na mão.
    const [venda] = await db
      .select({ veiculoId: schema.vendas.veiculoId, numeroParcelas: schema.vendas.numeroParcelas })
      .from(schema.vendas)
      .where(eq(schema.vendas.id, parcela.vendaId));

    await db.insert(schema.movimentacoes).values({
      id: uid(),
      tipo: "entrada",
      valor: Number(valorPago),
      descricao: `Pagamento de parcela ${parcela.numero}/${venda?.numeroParcelas ?? "?"}`,
      categoria: "Recebimento de venda",
      data: dataPagamento,
      veiculoId: venda?.veiculoId ?? null,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return erroServidor(res, e);
  }
}

