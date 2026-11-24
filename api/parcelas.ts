import { eq } from "drizzle-orm";
import { db, schema, metodoNaoPermitido, erroServidor } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const vendaId = req.query.vendaId ? String(req.query.vendaId) : null;
      const rows = vendaId
        ? await db.select().from(schema.parcelas).where(eq(schema.parcelas.vendaId, vendaId))
        : await db.select().from(schema.parcelas);
      return res.status(200).json(rows);
    }
    return metodoNaoPermitido(res);
  } catch (e) {
    return erroServidor(res, e);
  }
}
