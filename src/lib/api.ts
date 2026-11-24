import type {
  Veiculo,
  Despesa,
  Cliente,
  Venda,
  Parcela,
  Movimentacao,
  TemplateMensagem,
  Usuario,
} from "@/types";

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.erro || `Erro ${res.status} em ${url}`);
  }
  return res.json();
}

export const api = {
  usuarios: {
    listar: () => req<Omit<Usuario, "senha">[]>("/api/usuarios"),
    salvar: (u: Pick<Usuario, "id" | "nome" | "cor" | "whatsapp">) =>
      req("/api/usuarios", { method: "POST", body: JSON.stringify(u) }),
  },
  auth: {
    login: (login: string, senha: string) =>
      req<Omit<Usuario, "senha"> | null>("/api/auth-login", {
        method: "POST",
        body: JSON.stringify({ login, senha }),
      }).catch(() => null),
  },
  veiculos: {
    listar: () => req<Veiculo[]>("/api/veiculos"),
    salvar: (v: Veiculo) => req("/api/veiculos", { method: "POST", body: JSON.stringify(v) }),
    excluir: (id: string) => req(`/api/veiculos?id=${id}`, { method: "DELETE" }),
  },
  despesas: {
    listar: () => req<Despesa[]>("/api/despesas"),
    salvar: (d: Despesa) => req("/api/despesas", { method: "POST", body: JSON.stringify(d) }),
    excluir: (id: string) => req(`/api/despesas?id=${id}`, { method: "DELETE" }),
  },
  clientes: {
    listar: () => req<Cliente[]>("/api/clientes"),
    salvar: (c: Cliente) => req("/api/clientes", { method: "POST", body: JSON.stringify(c) }),
    excluir: (id: string) => req(`/api/clientes?id=${id}`, { method: "DELETE" }),
  },
  vendas: {
    listar: () => req<Venda[]>("/api/vendas"),
    salvar: (v: Venda) => req("/api/vendas", { method: "POST", body: JSON.stringify(v) }),
    excluir: (id: string) => req(`/api/vendas?id=${id}`, { method: "DELETE" }),
  },
  parcelas: {
    listar: () => req<Parcela[]>("/api/parcelas"),
    darBaixa: (parcelaId: string, valorPago: number, dataPagamento: string) =>
      req("/api/parcelas-baixa", {
        method: "POST",
        body: JSON.stringify({ parcelaId, valorPago, dataPagamento }),
      }),
    editarValor: (parcelaId: string, valorDevido: number) =>
      req("/api/parcelas-editar", {
        method: "POST",
        body: JSON.stringify({ parcelaId, valorDevido }),
      }),
  },
  movimentacoes: {
    listar: () => req<Movimentacao[]>("/api/movimentacoes"),
    salvar: (m: Movimentacao) => req("/api/movimentacoes", { method: "POST", body: JSON.stringify(m) }),
    excluir: (id: string) => req(`/api/movimentacoes?id=${id}`, { method: "DELETE" }),
  },
  templates: {
    listar: () => req<TemplateMensagem[]>("/api/templates"),
    salvar: (t: TemplateMensagem) => req("/api/templates", { method: "POST", body: JSON.stringify(t) }),
    excluir: (id: string) => req(`/api/templates?id=${id}`, { method: "DELETE" }),
  },
};

export function uid() {
  return crypto.randomUUID();
}
