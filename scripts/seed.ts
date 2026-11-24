// Roda uma única vez, localmente, depois de configurar o DATABASE_URL no
// seu .env (ou .env.local) e de rodar as migrations.
//
//   npm run seed
//
// Cria (ou atualiza a senha de) o usuário do proprietário: ozeiasveiculos / ozeiasveiculos2026
// — troque a senha depois, editando essa lista e rodando o seed de novo.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("Defina DATABASE_URL no seu .env antes de rodar o seed.");
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

const usuarios = [
  { id: "u1", nome: "Ozeias", login: "ozeiasveiculos", senha: "ozeiasveiculos2026", cor: "#1c1c1e" },
];

async function main() {
  for (const u of usuarios) {
    const senhaHash = await bcrypt.hash(u.senha, 10);
    const existente = await db
      .select({ id: schema.usuarios.id })
      .from(schema.usuarios)
      .where(eq(schema.usuarios.login, u.login));

    if (existente.length > 0) {
      await db
        .update(schema.usuarios)
        .set({ nome: u.nome, senha: senhaHash, cor: u.cor })
        .where(eq(schema.usuarios.login, u.login));
      console.log(`Atualizado: ${u.login}`);
    } else {
      await db.insert(schema.usuarios).values({ ...u, senha: senhaHash });
      console.log(`Criado: ${u.login}`);
    }
  }

  const [t] = await db
    .select({ id: schema.templatesMensagem.id })
    .from(schema.templatesMensagem);
  if (!t) {
    await db.insert(schema.templatesMensagem).values({
      id: "t1",
      titulo: "Cobrança padrão",
      texto:
        "Olá {nome}, tudo bem? Passando pra lembrar que a parcela {parcela} no valor de {valor} venceu em {vencimento}. Qualquer coisa é só chamar!",
    });
    console.log("Template de cobrança padrão criado.");
  }

  console.log("\nPronto! Login inicial: ozeiasveiculos / ozeiasveiculos2026.");
  console.log("Troque as senhas assim que possível.");
}

main().then(() => process.exit(0));
