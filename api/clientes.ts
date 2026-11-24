import { eq } from "drizzle-orm";
import { db, schema, metodoNaoPermitido, erroServidor } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const rows = await db.select().from(schema.clientes);
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const c = req.body;
      await db
        .insert(schema.clientes)
        .values(c)
        .onConflictDoUpdate({ target: schema.clientes.id, set: c });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const id = String(req.query.id ?? "");
      if (!id) return res.status(400).json({ erro: "id obrigatório" });

      const vendasVinculadas = await db
        .select({ id: schema.vendas.id })
        .from(schema.vendas)
        .where(eq(schema.vendas.clienteId, id));
      if (vendasVinculadas.length > 0) {
        return res.status(400).json({
          erro:
            "Esse cliente já tem uma venda registrada. Exclua a venda (na aba Vendas & Parcelas) antes de excluir o cliente.",
        });
      }

      await db.delete(schema.clientes).where(eq(schema.clientes.id, id));
      return res.status(200).json({ ok: true });
    }

    return metodoNaoPermitido(res);
  } catch (e) {
    return erroServidor(res, e);
  }
}
