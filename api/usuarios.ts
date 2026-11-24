import { eq } from "drizzle-orm";
import { db, schema, metodoNaoPermitido, erroServidor } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const rows = await db
        .select({
          id: schema.usuarios.id,
          nome: schema.usuarios.nome,
          login: schema.usuarios.login,
          cor: schema.usuarios.cor,
          whatsapp: schema.usuarios.whatsapp,
        })
        .from(schema.usuarios);
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      // Só permite atualizar nome, cor e whatsapp — login/senha nunca mudam por aqui
      const { id, nome, cor, whatsapp } = req.body as {
        id: string;
        nome: string;
        cor: string;
        whatsapp: string;
      };
      if (!id) return res.status(400).json({ erro: "id obrigatório" });
      await db.update(schema.usuarios).set({ nome, cor, whatsapp }).where(eq(schema.usuarios.id, id));
      return res.status(200).json({ ok: true });
    }

    return metodoNaoPermitido(res);
  } catch (e) {
    return erroServidor(res, e);
  }
}
