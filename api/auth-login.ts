import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema, metodoNaoPermitido, erroServidor } from "./_lib/db.js";
import type { VercelRequest, VercelResponse } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return metodoNaoPermitido(res);

    const { login, senha } = req.body as { login: string; senha: string };
    if (!login || !senha) return res.status(400).json({ erro: "login e senha obrigatórios" });

    const [usuario] = await db
      .select()
      .from(schema.usuarios)
      .where(eq(schema.usuarios.login, login));

    if (!usuario) return res.status(401).json({ erro: "Login ou senha inválidos" });

    const ok = await bcrypt.compare(senha, usuario.senha);
    if (!ok) return res.status(401).json({ erro: "Login ou senha inválidos" });

    return res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login,
      cor: usuario.cor,
      whatsapp: usuario.whatsapp,
    });
  } catch (e) {
    return erroServidor(res, e);
  }
}
