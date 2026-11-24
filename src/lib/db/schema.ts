// Schema Drizzle ORM pra Postgres (Neon via aba Storage da Vercel).
// Usado pelas funções serverless em /api (ver api/_lib/db.ts) e pelo
// script de seed (scripts/seed.ts). Rode as migrations com `npm run
// db:push` depois de configurar o DATABASE_URL, e `npm run seed` pra
// criar os usuários iniciais.
// O formato das tabelas já reflete exatamente os tipos de src/types/index.ts.

import {
  pgTable,
  text,
  integer,
  numeric,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const statusVeiculoEnum = pgEnum("status_veiculo", [
  "disponivel",
  "vendido",
  "oficina",
  "em_uso",
  "reservado",
]);

export const tipoOperacaoEnum = pgEnum("tipo_operacao", ["repasse", "venda"]);
export const formaPagamentoEnum = pgEnum("forma_pagamento", [
  "avista",
  "parcelado",
]);
export const statusParcelaEnum = pgEnum("status_parcela", [
  "pendente",
  "pago",
  "atrasado",
  "parcial",
]);
export const tipoMovimentacaoEnum = pgEnum("tipo_movimentacao", [
  "entrada",
  "saida",
]);

export const usuarios = pgTable("usuarios", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  login: text("login").notNull().unique(),
  senha: text("senha").notNull(), // hash, nunca texto puro em produção
  cor: text("cor").notNull().default("#1c1c1e"),
  whatsapp: text("whatsapp").default(""),
});

export const veiculos = pgTable("veiculos", {
  id: text("id").primaryKey(),
  marca: text("marca").notNull(),
  modelo: text("modelo").notNull(),
  anoFab: text("ano_fab").notNull(),
  anoMod: text("ano_mod").notNull(),
  cor: text("cor").default(""),
  combustivel: text("combustivel").default(""),
  motor: text("motor").default(""),
  acessorios: text("acessorios").default(""),
  placa: text("placa").notNull(),
  renavam: text("renavam"),
  chassi: text("chassi"),
  km: integer("km").default(0),
  tipoOperacao: tipoOperacaoEnum("tipo_operacao").notNull(),
  status: statusVeiculoEnum("status").notNull().default("disponivel"),
  dataEntrada: date("data_entrada").notNull(),
  valorCompra: numeric("valor_compra", { precision: 12, scale: 2, mode: "number" }).notNull(),
  precoVenda: numeric("preco_venda", { precision: 12, scale: 2, mode: "number" }).default(0),
  documentacao: text("documentacao").default(""),
  observacoes: text("observacoes").default(""),
  cadastradoPor: text("cadastrado_por").references(() => usuarios.id),
  investidores: text("investidores"), // JSON: [{ usuarioId, percentual }]
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const despesas = pgTable("despesas", {
  id: text("id").primaryKey(),
  veiculoId: text("veiculo_id")
    .references(() => veiculos.id)
    .notNull(),
  descricao: text("descricao").notNull(),
  valor: numeric("valor", { precision: 12, scale: 2, mode: "number" }).notNull(),
  responsavelId: text("responsavel_id").references(() => usuarios.id),
  data: date("data").notNull(),
});

export const clientes = pgTable("clientes", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  cpf: text("cpf"),
  rg: text("rg").default(""),
  nacionalidade: text("nacionalidade").default(""),
  estadoCivil: text("estado_civil").default(""),
  telefone: text("telefone").notNull(),
  email: text("email").default(""),
  endereco: text("endereco").default(""),
  bairro: text("bairro").default(""),
  cidade: text("cidade").default(""),
  uf: text("uf").default(""),
  cep: text("cep").default(""),
  observacoes: text("observacoes").default(""),
});

export const vendas = pgTable("vendas", {
  id: text("id").primaryKey(),
  veiculoId: text("veiculo_id")
    .references(() => veiculos.id)
    .notNull(),
  clienteId: text("cliente_id")
    .references(() => clientes.id)
    .notNull(),
  vendidoPor: text("vendido_por").references(() => usuarios.id),
  tipoContrato: tipoOperacaoEnum("tipo_contrato").notNull(),
  valorVenda: numeric("valor_venda", { precision: 12, scale: 2, mode: "number" }).notNull(),
  valorEntrada: numeric("valor_entrada", { precision: 12, scale: 2, mode: "number" }).default(0),
  formaPagamento: formaPagamentoEnum("forma_pagamento").notNull(),
  numeroParcelas: integer("numero_parcelas").default(1),
  data: date("data").notNull(),
  observacoes: text("observacoes").default(""),
  // Dados específicos pra geração do contrato (repasse ou garantia 3 meses),
  // guardados como JSON pra não precisar de uma tabela extra pra cada anexo.
  dadosContrato: text("dados_contrato"),
});

export const parcelas = pgTable("parcelas", {
  id: text("id").primaryKey(),
  vendaId: text("venda_id")
    .references(() => vendas.id)
    .notNull(),
  numero: integer("numero").notNull(),
  valorDevido: numeric("valor_devido", { precision: 12, scale: 2, mode: "number" }).notNull(),
  valorPago: numeric("valor_pago", { precision: 12, scale: 2, mode: "number" })
    .notNull()
    .default(0),
  dataVencimento: date("data_vencimento").notNull(),
  dataPagamento: date("data_pagamento"),
  status: statusParcelaEnum("status").notNull().default("pendente"),
});

export const movimentacoes = pgTable("movimentacoes", {
  id: text("id").primaryKey(),
  tipo: tipoMovimentacaoEnum("tipo").notNull(),
  valor: numeric("valor", { precision: 12, scale: 2, mode: "number" }).notNull(),
  descricao: text("descricao").notNull(),
  categoria: text("categoria").default(""),
  data: date("data").notNull(),
  veiculoId: text("veiculo_id").references(() => veiculos.id),
});

export const templatesMensagem = pgTable("templates_mensagem", {
  id: text("id").primaryKey(),
  titulo: text("titulo").notNull(),
  texto: text("texto").notNull(),
});
