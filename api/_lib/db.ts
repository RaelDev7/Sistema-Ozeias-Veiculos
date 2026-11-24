import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../src/lib/db/schema.js";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error(
    "Nenhuma variável de conexão com o banco encontrada (DATABASE_URL / POSTGRES_URL)."
  );
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
export { schema };

export function metodoNaoPermitido(res: VercelResponse) {
  res.status(405).json({ erro: "Método não permitido" });
}

export function erroServidor(res: VercelResponse, e: unknown) {
  console.error(e);
  res.status(500).json({ erro: e instanceof Error ? e.message : "Erro interno" });
}

export function uid() {
  return crypto.randomUUID();
}

export type { VercelRequest, VercelResponse };
