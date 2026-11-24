import { eq } from "drizzle-orm";
import { db, schema, metodoNaoPermitido, erroServidor } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

// Toda despesa lançada num veículo também vira uma "saída" no caixa
// automaticamente, usando um id derivado do id da despesa — assim dá pra
// atualizar/excluir a movimentação junto quando a despesa muda, sem
// precisar de uma coluna extra de vínculo.
function idMovimentacao(despesaId: string) {
  return `desp_${despesaId}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const veiculoId = req.query.veiculoId ? String(req.query.veiculoId) : null;
      const rows = veiculoId
        ? await db.select().from(schema.despesas).where(eq(schema.despesas.veiculoId, veiculoId))
        : await db.select().from(schema.despesas);
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const d = req.body;
      await db
        .insert(schema.despesas)
        .values(d)
        .onConflictDoUpdate({ target: schema.despesas.id, set: d });

      const movimentacao = {
        id: idMovimentacao(d.id),
        tipo: "saida" as const,
        valor: d.valor,
        descricao: `Despesa: ${d.descricao}`,
        categoria: "Despesa de veículo",
        data: d.data,
        veiculoId: d.veiculoId,
      };
      await db
        .insert(schema.movimentacoes)
        .values(movimentacao)
        .onConflictDoUpdate({ target: schema.movimentacoes.id, set: movimentacao });

      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const id = String(req.query.id ?? "");
      if (!id) return res.status(400).json({ erro: "id obrigatório" });
      await db.delete(schema.despesas).where(eq(schema.despesas.id, id));
      await db.delete(schema.movimentacoes).where(eq(schema.movimentacoes.id, idMovimentacao(id)));
      return res.status(200).json({ ok: true });
    }

    return metodoNaoPermitido(res);
  } catch (e) {
    return erroServidor(res, e);
  }
}

