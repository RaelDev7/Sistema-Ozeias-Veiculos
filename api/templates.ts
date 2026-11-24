import { eq } from "drizzle-orm";
import { db, schema, metodoNaoPermitido, erroServidor } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const rows = await db.select().from(schema.templatesMensagem);
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const t = req.body;
      await db
        .insert(schema.templatesMensagem)
        .values(t)
        .onConflictDoUpdate({ target: schema.templatesMensagem.id, set: t });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const id = String(req.query.id ?? "");
      if (!id) return res.status(400).json({ erro: "id obrigatório" });
      await db.delete(schema.templatesMensagem).where(eq(schema.templatesMensagem.id, id));
      return res.status(200).json({ ok: true });
    }

    return metodoNaoPermitido(res);
  } catch (e) {
    return erroServidor(res, e);
  }
}
