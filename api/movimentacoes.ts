import { eq } from "drizzle-orm";
import { db, schema, metodoNaoPermitido, erroServidor } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const rows = await db.select().from(schema.movimentacoes);
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const m = req.body;
      await db
        .insert(schema.movimentacoes)
        .values(m)
        .onConflictDoUpdate({ target: schema.movimentacoes.id, set: m });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const id = String(req.query.id ?? "");
      if (!id) return res.status(400).json({ erro: "id obrigatório" });
      await db.delete(schema.movimentacoes).where(eq(schema.movimentacoes.id, id));
      return res.status(200).json({ ok: true });
    }

    return metodoNaoPermitido(res);
  } catch (e) {
    return erroServidor(res, e);
  }
}
