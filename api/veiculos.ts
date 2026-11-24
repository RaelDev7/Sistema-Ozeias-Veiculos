import { eq } from "drizzle-orm";
import { db, schema, metodoNaoPermitido, erroServidor } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

function rowParaVeiculo(row: any) {
  const { investidores, ...resto } = row;
  return { ...resto, investidores: investidores ? JSON.parse(investidores) : [] };
}

function veiculoParaRow(veiculo: any) {
  const { investidores, ...resto } = veiculo;
  return { ...resto, investidores: investidores ? JSON.stringify(investidores) : null };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const rows = await db.select().from(schema.veiculos);
      return res.status(200).json(rows.map(rowParaVeiculo));
    }

    if (req.method === "POST") {
      const v = veiculoParaRow(req.body);
      await db
        .insert(schema.veiculos)
        .values(v)
        .onConflictDoUpdate({ target: schema.veiculos.id, set: v });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const id = String(req.query.id ?? "");
      if (!id) return res.status(400).json({ erro: "id obrigatório" });

      const vendasVinculadas = await db
        .select({ id: schema.vendas.id })
        .from(schema.vendas)
        .where(eq(schema.vendas.veiculoId, id));
      if (vendasVinculadas.length > 0) {
        return res.status(400).json({
          erro:
            "Esse veículo já tem uma venda registrada. Exclua a venda (na aba Vendas & Parcelas) antes de excluir o veículo.",
        });
      }

      await db.delete(schema.despesas).where(eq(schema.despesas.veiculoId, id));
      // Remove também as saídas de caixa lançadas automaticamente pelas
      // despesas desse veículo (e qualquer movimentação manual vinculada a ele)
      await db.delete(schema.movimentacoes).where(eq(schema.movimentacoes.veiculoId, id));
      await db.delete(schema.veiculos).where(eq(schema.veiculos.id, id));
      return res.status(200).json({ ok: true });
    }

    return metodoNaoPermitido(res);
  } catch (e) {
    return erroServidor(res, e);
  }
}
