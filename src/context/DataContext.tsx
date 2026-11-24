import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
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
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface DataContextType {
  veiculos: Veiculo[];
  despesas: Despesa[];
  clientes: Cliente[];
  vendas: Venda[];
  parcelas: Parcela[];
  movimentacoes: Movimentacao[];
  templates: TemplateMensagem[];
  usuarios: Omit<Usuario, "senha">[];
  loading: boolean;
  erro: string | null;
  refresh: () => Promise<void>;

  salvarVeiculo: (v: Veiculo) => Promise<void>;
  excluirVeiculo: (id: string) => Promise<void>;
  salvarDespesa: (d: Despesa) => Promise<void>;
  excluirDespesa: (id: string) => Promise<void>;
  salvarCliente: (c: Cliente) => Promise<void>;
  excluirCliente: (id: string) => Promise<void>;
  salvarVenda: (v: Venda) => Promise<void>;
  excluirVenda: (id: string) => Promise<void>;
  darBaixaParcela: (parcelaId: string, valorPago: number, dataPagamento: string) => Promise<void>;
  editarValorParcela: (parcelaId: string, valorDevido: number) => Promise<void>;
  salvarMovimentacao: (m: Movimentacao) => Promise<void>;
  excluirMovimentacao: (id: string) => Promise<void>;
  salvarTemplate: (t: TemplateMensagem) => Promise<void>;
  salvarUsuario: (u: Pick<Usuario, "id" | "nome" | "cor" | "whatsapp">) => Promise<void>;
  excluirTemplate: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [templates, setTemplates] = useState<TemplateMensagem[]>([]);
  const [usuarios, setUsuarios] = useState<Omit<Usuario, "senha">[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const [v, d, c, ve, p, m, t, u] = await Promise.all([
        api.veiculos.listar(),
        api.despesas.listar(),
        api.clientes.listar(),
        api.vendas.listar(),
        api.parcelas.listar(),
        api.movimentacoes.listar(),
        api.templates.listar(),
        api.usuarios.listar(),
      ]);
      setVeiculos(v);
      setDespesas(d);
      setClientes(c);
      setVendas(ve);
      setParcelas(p);
      setMovimentacoes(m);
      setTemplates(t);
      setUsuarios(u);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usuario) refresh();
  }, [usuario, refresh]);

  async function salvarVeiculo(v: Veiculo) {
    await api.veiculos.salvar(v);
    await refresh();
  }
  async function excluirVeiculo(id: string) {
    await api.veiculos.excluir(id);
    await refresh();
  }
  async function salvarDespesa(d: Despesa) {
    await api.despesas.salvar(d);
    await refresh();
  }
  async function excluirDespesa(id: string) {
    await api.despesas.excluir(id);
    await refresh();
  }
  async function salvarCliente(c: Cliente) {
    await api.clientes.salvar(c);
    await refresh();
  }
  async function excluirCliente(id: string) {
    await api.clientes.excluir(id);
    await refresh();
  }
  async function salvarVenda(v: Venda) {
    await api.vendas.salvar(v);
    await refresh();
  }
  async function excluirVenda(id: string) {
    await api.vendas.excluir(id);
    await refresh();
  }
  async function darBaixaParcela(parcelaId: string, valorPago: number, dataPagamento: string) {
    await api.parcelas.darBaixa(parcelaId, valorPago, dataPagamento);
    await refresh();
  }
  async function editarValorParcela(parcelaId: string, valorDevido: number) {
    await api.parcelas.editarValor(parcelaId, valorDevido);
    await refresh();
  }
  async function salvarMovimentacao(m: Movimentacao) {
    await api.movimentacoes.salvar(m);
    await refresh();
  }
  async function excluirMovimentacao(id: string) {
    await api.movimentacoes.excluir(id);
    await refresh();
  }
  async function salvarTemplate(t: TemplateMensagem) {
    await api.templates.salvar(t);
    await refresh();
  }
  async function salvarUsuario(u: Pick<Usuario, "id" | "nome" | "cor" | "whatsapp">) {
    await api.usuarios.salvar(u);
    await refresh();
  }
  async function excluirTemplate(id: string) {
    await api.templates.excluir(id);
    await refresh();
  }

  return (
    <DataContext.Provider
      value={{
        veiculos, despesas, clientes, vendas, parcelas, movimentacoes, templates, usuarios,
        loading, erro, refresh,
        salvarVeiculo, excluirVeiculo,
        salvarDespesa, excluirDespesa,
        salvarCliente, excluirCliente,
        salvarVenda, excluirVenda,
        darBaixaParcela,
        editarValorParcela,
        salvarMovimentacao, excluirMovimentacao,
        salvarTemplate, excluirTemplate,
        salvarUsuario,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDados() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useDados precisa estar dentro de DataProvider");
  return ctx;
}
