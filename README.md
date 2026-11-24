# Ozeias Veículos — Controle de Estoque e Vendas

Sistema da Ozeias Veículos, revenda que trabalha com compra, venda, troca e financiamento de veículos.

## Dados da empresa

Nome, CNPJ, endereço, cidade e CPF do proprietário (usados nos contratos) ficam em `src/config/empresa.ts`. Campo vazio sai como linha em branco no contrato impresso.

## Stack

- Frontend: Vite + React + TypeScript + Tailwind, deploy na Vercel
- Backend: funções serverless da própria Vercel (pasta `/api`)
- Banco: Postgres via Neon (aba Storage da Vercel), acessado com Drizzle ORM pelo driver HTTP (sem pool — não tem risco de estourar conexões)

## Rodando localmente

```bash
npm install
```

### 1. Configurar o banco

1. Na Vercel, abra o projeto → aba **Storage** → crie um banco Postgres (Neon). A variável `DATABASE_URL` já entra sozinha no ambiente da Vercel.
2. Pra rodar localmente (migrations e seed), copie `.env.example` pra `.env` e cole a connection string do Neon (pegue em Vercel → Settings → Environment Variables, ou direto no painel do Neon).
3. Rode as migrations:
   ```bash
   npm run db:push
   ```
4. Crie o usuário do proprietário e o template de cobrança padrão:
   ```bash
   npm run seed
   ```
   Isso cria o login `ozeias` com senha `ozeias2026` — troque depois.

### 2. Rodar o frontend + funções serverless

```bash
npm run dev
```

Isso sobe só o Vite (frontend). Como as rotas `/api/*` são funções serverless da Vercel, pra testá-las localmente com dados reais é melhor usar a CLI da Vercel:

```bash
npm install -g vercel
vercel dev
```

Isso sobe o frontend E as funções `/api` juntos, exatamente como vai rodar em produção.

## O que já está funcionando

- **Login** com usuário próprio (senha com hash bcrypt, nunca texto puro no banco)
- **Estoque**: cadastro de veículo (repasse ou venda), status, documentação, despesas lançadas por veículo (com quem fez cada gasto/reparo), custo total, lucro e markup calculados automaticamente
- **Clientes**: cadastro completo (CPF, RG, endereço, etc. — usado também pra gerar contrato)
- **Vendas & Parcelas**: gera as parcelas automaticamente, dá baixa com valor parcial ou antecipado, e tem botão "Cobrar" que abre o WhatsApp do cliente com a mensagem personalizada
- **Contratos**: gera os dois modelos exatamente como os originais — repasse e venda com garantia de 3 meses — com busca por cliente/veículo/placa e botão de imprimir/salvar em PDF
- **Entrada & Saída** (fluxo de caixa)
- **Configurações**: usuários e templates de mensagem de cobrança
- **Dashboard** com os totais principais

## Estrutura do banco

O schema completo está em `src/lib/db/schema.ts` (Drizzle). As funções serverless que leem/escrevem nele estão em `/api` — um arquivo por recurso (veiculos, clientes, vendas, parcelas, etc). O frontend nunca acessa o banco diretamente; tudo passa pelas rotas `/api/*` (ver `src/lib/api.ts` e `src/context/DataContext.tsx`).

## Sobre os contratos

Os dois modelos (`ContratoRepasse.tsx` e `ContratoGarantia.tsx`, em `src/components/contracts/`) reproduzem o texto exatamente como nos arquivos Word originais enviados. Os campos que já existem no sistema (cliente, veículo, valor da venda) são preenchidos automaticamente; os campos que só existem no contrato (forma de pagamento detalhada, itens de vistoria, prazo de garantia etc.) ficam num formulário rápido antes de gerar/imprimir, e o preenchido fica salvo na venda pra não precisar redigitar depois.
