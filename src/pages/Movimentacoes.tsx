import { useState, useMemo } from "react";
import { useDados } from "@/context/DataContext";
import { uid } from "@/lib/api";
import { resumoMensalMovimentacoes } from "@/lib/metrics";
import type { Movimentacao, TipoMovimentacao } from "@/types";
import { Card, Badge, Modal } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Field } from "@/components/ui/Input";
import { formatMoeda, formatData, hojeISO } from "@/lib/format";
import { Plus, Trash2, ChevronDown, ChevronUp, Car } from "lucide-react";

function vazio(): Movimentacao {
  return { id: uid(), tipo: "entrada", valor: 0, descricao: "", categoria: "", data: hojeISO(), veiculoId: null };
}

export function Movimentacoes() {
  const { veiculos, movimentacoes, salvarMovimentacao, excluirMovimentacao } = useDados();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Movimentacao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mesFiltro, setMesFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [veiculoExpandido, setVeiculoExpandido] = useState<string | null>(null);

  const resumoMensal = useMemo(() => resumoMensalMovimentacoes(movimentacoes), [movimentacoes]);

  const listaDoMes = mesFiltro ? movimentacoes.filter((m) => m.data.slice(0, 7) === mesFiltro) : movimentacoes;

  const saldo = useMemo(() => {
    return listaDoMes.reduce((s, m) => s + (m.tipo === "entrada" ? m.valor : -m.valor), 0);
  }, [listaDoMes]);

  // Separa o que é ligado a um veículo (despesas/recebimentos de venda) do
  // resto (lançamentos manuais tipo aluguel, combustível etc), pra não
  // encher a lista com um monte de despesa de carro
  const semVeiculo = listaDoMes.filter((m) => !m.veiculoId);
  const comVeiculo = listaDoMes.filter((m) => m.veiculoId);

  const categorias = useMemo(
    () => [...new Set(semVeiculo.map((m) => m.categoria).filter(Boolean))],
    [semVeiculo]
  );
  const semVeiculoFiltrada = categoriaFiltro
    ? semVeiculo.filter((m) => m.categoria === categoriaFiltro)
    : semVeiculo;

  const gruposPorVeiculo = useMemo(() => {
    const mapa = new Map<string, Movimentacao[]>();
    for (const m of comVeiculo) {
      if (!m.veiculoId) continue;
      const arr = mapa.get(m.veiculoId) ?? [];
      arr.push(m);
      mapa.set(m.veiculoId, arr);
    }
    return [...mapa.entries()]
      .map(([veiculoId, itens]) => {
        const veic = veiculos.find((v) => v.id === veiculoId);
        const totalSaida = itens.filter((m) => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
        const totalEntrada = itens.filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
        return { veiculoId, veiculo: veic, itens: itens.sort((a, b) => +new Date(b.data) - +new Date(a.data)), totalSaida, totalEntrada };
      })
      .sort((a, b) => b.totalSaida - a.totalSaida);
  }, [comVeiculo, veiculos]);

  async function salvar() {
    if (!editando || !editando.descricao || editando.valor <= 0) return;
    setSalvando(true);
    try {
      await salvarMovimentacao(editando);
      setModalAberto(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível salvar esse lançamento.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await excluirMovimentacao(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível excluir esse lançamento.");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrada & Saída</h1>
          <p className="text-gray-500">Fluxo de caixa</p>
        </div>
        <Button onClick={() => { setEditando(vazio()); setModalAberto(true); }} className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={16} /> Novo lançamento
        </Button>
      </div>

      <Card className="p-5 mb-6 max-w-xs">
        <p className="text-sm text-gray-500">Saldo em caixa {mesFiltro && "(mês selecionado)"}</p>
        <p className={`text-2xl font-bold ${saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatMoeda(saldo)}</p>
      </Card>

      {resumoMensal.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setMesFiltro("")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${mesFiltro === "" ? "bg-brand-red text-white" : "bg-gray-100 text-gray-600"}`}
          >
            Todos os meses
          </button>
          {resumoMensal.map((r) => (
            <button
              key={r.mes}
              onClick={() => setMesFiltro(r.mes)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${mesFiltro === r.mes ? "bg-brand-red text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {r.label} · {formatMoeda(r.saldo)}
            </button>
          ))}
        </div>
      )}

      {gruposPorVeiculo.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-800 text-sm mb-2">Despesas e recebimentos por veículo</h2>
          <div className="space-y-2">
            {gruposPorVeiculo.map((g) => (
              <Card key={g.veiculoId} className="overflow-hidden">
                <div
                  className="flex items-center justify-between gap-3 p-3 cursor-pointer"
                  onClick={() => setVeiculoExpandido(veiculoExpandido === g.veiculoId ? null : g.veiculoId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                      <Car size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {g.veiculo ? `${g.veiculo.marca} ${g.veiculo.modelo}` : "Veículo removido"}
                      </p>
                      <p className="text-xs text-gray-400">{g.veiculo?.placa} · {g.itens.length} lançamento(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {g.totalSaida > 0 && <span className="text-sm text-red-600">-{formatMoeda(g.totalSaida)}</span>}
                    {g.totalEntrada > 0 && <span className="text-sm text-emerald-600">+{formatMoeda(g.totalEntrada)}</span>}
                    {veiculoExpandido === g.veiculoId ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>
                {veiculoExpandido === g.veiculoId && (
                  <div className="border-t border-gray-100 bg-gray-50 divide-y divide-gray-100">
                    {g.itens.map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                        <div>
                          <p className="text-sm">{m.descricao}</p>
                          <p className="text-xs text-gray-400">{formatData(m.data)} {m.categoria && `· ${m.categoria}`}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${m.tipo === "entrada" ? "text-emerald-600" : "text-red-600"}`}>
                            {m.tipo === "entrada" ? "+" : "-"}{formatMoeda(m.valor)}
                          </span>
                          <button onClick={() => excluir(m.id)} className="text-gray-300 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-800 text-sm">Outros lançamentos</h2>
        </div>
        {categorias.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => setCategoriaFiltro("")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${categoriaFiltro === "" ? "bg-brand-red text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Todas categorias
            </button>
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setCategoriaFiltro(c)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${categoriaFiltro === c ? "bg-brand-red text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-2">
          {semVeiculoFiltrada.map((m) => (
            <Card key={m.id} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <Badge value={m.tipo} />
                <div>
                  <p className="text-sm font-medium">{m.descricao}</p>
                  <p className="text-xs text-gray-400">
                    {formatData(m.data)} {m.categoria && `· ${m.categoria}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <span className={`font-medium ${m.tipo === "entrada" ? "text-emerald-600" : "text-red-600"}`}>
                  {m.tipo === "entrada" ? "+" : "-"}{formatMoeda(m.valor)}
                </span>
                <button onClick={() => excluir(m.id)} className="text-gray-300 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
          {semVeiculoFiltrada.length === 0 && <Card className="p-8 text-center text-gray-400">Nenhum lançamento aqui.</Card>}
        </div>
      </div>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title="Novo lançamento">
        {editando && (
          <div className="space-y-4">
            <Field label="Tipo">
              <Select value={editando.tipo} onChange={(e) => setEditando({ ...editando, tipo: e.target.value as TipoMovimentacao })}>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </Select>
            </Field>
            <Field label="Descrição">
              <Input value={editando.descricao} onChange={(e) => setEditando({ ...editando, descricao: e.target.value })} />
            </Field>
            <Field label="Categoria">
              <Input placeholder="Ex: aluguel, combustível, comissão..." value={editando.categoria} onChange={(e) => setEditando({ ...editando, categoria: e.target.value })} />
            </Field>
            <Field label="Valor">
              <Input type="number" step="0.01" value={editando.valor} onChange={(e) => setEditando({ ...editando, valor: Number(e.target.value) })} />
            </Field>
            <Field label="Data">
              <Input type="date" value={editando.data} onChange={(e) => setEditando({ ...editando, data: e.target.value })} />
            </Field>
            <Field label="Veículo relacionado (opcional)">
              <Select value={editando.veiculoId ?? ""} onChange={(e) => setEditando({ ...editando, veiculoId: e.target.value || null })}>
                <option value="">Nenhum</option>
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.placa}</option>
                ))}
              </Select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalAberto(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
