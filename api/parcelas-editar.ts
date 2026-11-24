import { eq } from "drizzle-orm";
import { db, schema, metodoNaoPermitido, erroServidor } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return metodoNaoPermitido(res);

    const { parcelaId, valorDevido } = req.body as { parcelaId: string; valorDevido: number };
    if (!parcelaId || valorDevido === undefined) {
      return res.status(400).json({ erro: "dados incompletos" });
    }

    const [parcela] = await db
      .select()
      .from(schema.parcelas)
      .where(eq(schema.parcelas.id, parcelaId));
    if (!parcela) return res.status(404).json({ erro: "parcela não encontrada" });

    if (parcela.status === "pago") {
      return res.status(400).json({ erro: "Essa parcela já está paga, não dá pra mudar o valor dela." });
    }
    if (valorDevido < Number(parcela.valorPago)) {
      return res.status(400).json({
        erro: `O novo valor não pode ser menor que o que já foi pago dessa parcela (${parcela.valorPago}).`,
      });
    }

    const status = Number(parcela.valorPago) > 0 ? "parcial" : "pendente";
    await db
      .update(schema.parcelas)
      .set({ valorDevido, status })
      .where(eq(schema.parcelas.id, parcelaId));

    return res.status(200).json({ ok: true });
  } catch (e) {
    return erroServidor(res, e);
  }
}
