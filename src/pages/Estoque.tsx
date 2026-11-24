import { useState } from "react";
import { useDados } from "@/context/DataContext";
import { metricasVeiculo } from "@/lib/metrics";
import { uid } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Veiculo, Despesa, StatusVeiculo, TipoOperacao, Investidor } from "@/types";
import { Card, Badge, Modal } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Field } from "@/components/ui/Input";
import { formatMoeda, formatData, hojeISO } from "@/lib/format";
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp } from "lucide-react";

const statusOptions: StatusVeiculo[] = ["disponivel", "vendido", "oficina", "em_uso", "reservado"];

function vazioVeiculo(): Veiculo {
  return {
    id: uid(),
    marca: "",
    modelo: "",
    anoFab: "",
    anoMod: "",
    cor: "",
    combustivel: "",
    motor: "",
    acessorios: "",
    placa: "",
    renavam: "",
    chassi: "",
    km: 0,
    tipoOperacao: "venda",
    status: "disponivel",
    dataEntrada: hojeISO(),
    valorCompra: 0,
    precoVenda: 0,
    documentacao: "",
    observacoes: "",
    cadastradoPor: "",
    investidores: [],
    createdAt: new Date().toISOString(),
  };
}

export function Estoque() {
  const { usuario } = useAuth();
  const { veiculos, despesas, vendas, usuarios, clientes, salvarVeiculo, excluirVeiculo } = useDados();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Veiculo | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [salvando, setSalvando] = useState(false);

  function abrirNovo() {
    setEditando(vazioVeiculo());
    setModalAberto(true);
  }

  function abrirEdicao(v: Veiculo) {
    setEditando({ ...v });
    setModalAberto(true);
  }

  async function salvar() {
    if (!editando) return;
    if (!editando.marca || !editando.modelo || !editando.placa) return;
    const v = { ...editando };
    if (!v.cadastradoPor) v.cadastradoPor = usuario?.id ?? "";
    setSalvando(true);
    try {
      await salvarVeiculo(v);
      setModalAberto(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível salvar esse veículo.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este veículo e todas as despesas ligadas a ele?")) return;
    try {
      await excluirVeiculo(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível excluir esse veículo.");
    }
  }

  const lista = filtroStatus
    ? veiculos.filter((v) => v.status === filtroStatus)
    : veiculos;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-500">Veículos de repasse e venda</p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={16} /> Novo veículo
        </Button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setFiltroStatus("")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${filtroStatus === "" ? "bg-brand-red text-white" : "bg-gray-100 text-gray-600"}`}
        >
          Todos ({veiculos.length})
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${filtroStatus === s ? "bg-brand-red text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {veiculos.filter((v) => v.status === s).length}{" "}
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {lista.length === 0 && (
          <Card className="p-8 text-center text-gray-400">Nenhum veículo cadastrado.</Card>
        )}
        {lista.map((v) => (
          <VeiculoLinha
            key={v.id}
            veiculo={v}
            veiculos={veiculos}
            despesas={despesas}
            vendas={vendas}
            clientes={clientes}
            usuarios={usuarios}
            expandido={expandido === v.id}
            onToggle={() => setExpandido(expandido === v.id ? null : v.id)}
            onEditar={() => abrirEdicao(v)}
            onExcluir={() => excluir(v.id)}
          />
        ))}
      </div>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={editando?.marca ? "Editar veículo" : "Novo veículo"} wide>
        {editando && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Marca">
              <Input value={editando.marca} onChange={(e) => setEditando({ ...editando, marca: e.target.value })} />
            </Field>
            <Field label="Modelo">
              <Input value={editando.modelo} onChange={(e) => setEditando({ ...editando, modelo: e.target.value })} />
            </Field>
            <Field label="Ano fabricação">
              <Input value={editando.anoFab} onChange={(e) => setEditando({ ...editando, anoFab: e.target.value })} />
            </Field>
            <Field label="Ano modelo">
              <Input value={editando.anoMod} onChange={(e) => setEditando({ ...editando, anoMod: e.target.value })} />
            </Field>
            <Field label="Cor">
              <Input value={editando.cor} onChange={(e) => setEditando({ ...editando, cor: e.target.value })} />
            </Field>
            <Field label="Combustível">
              <Input placeholder="Ex: Álcool/Gasolina" value={editando.combustivel} onChange={(e) => setEditando({ ...editando, combustivel: e.target.value })} />
            </Field>
            <Field label="Motor">
              <Input placeholder="Ex: 1.0" value={editando.motor} onChange={(e) => setEditando({ ...editando, motor: e.target.value })} />
            </Field>
            <Field label="Placa">
              <Input value={editando.placa} onChange={(e) => setEditando({ ...editando, placa: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="KM">
              <Input type="number" value={editando.km} onChange={(e) => setEditando({ ...editando, km: Number(e.target.value) })} />
            </Field>
            <Field label="RENAVAM">
              <Input value={editando.renavam} onChange={(e) => setEditando({ ...editando, renavam: e.target.value })} />
            </Field>
            <Field label="Chassi">
              <Input value={editando.chassi} onChange={(e) => setEditando({ ...editando, chassi: e.target.value })} />
            </Field>
            <Field label="Tipo de operação">
              <Select value={editando.tipoOperacao} onChange={(e) => setEditando({ ...editando, tipoOperacao: e.target.value as TipoOperacao })}>
                <option value="venda">Venda</option>
                <option value="repasse">Repasse</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={editando.status} onChange={(e) => setEditando({ ...editando, status: e.target.value as StatusVeiculo })}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </Select>
            </Field>
            <Field label="Data de entrada">
              <Input type="date" value={editando.dataEntrada} onChange={(e) => setEditando({ ...editando, dataEntrada: e.target.value })} />
            </Field>
            <Field label="Valor de compra">
              <Input type="number" step="0.01" value={editando.valorCompra} onChange={(e) => setEditando({ ...editando, valorCompra: Number(e.target.value) })} />
            </Field>
            <Field label="Preço de venda (anunciado)">
              <Input type="number" step="0.01" value={editando.precoVenda} onChange={(e) => setEditando({ ...editando, precoVenda: Number(e.target.value) })} />
            </Field>
            <div className="col-span-1 sm:col-span-2">
              <InvestidoresField
                investidores={editando.investidores}
                usuarios={usuarios}
                onChange={(investidores) => setEditando({ ...editando, investidores })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Field label="Acessórios/opcionais">
                <Input placeholder="Ex: ar condicionado, direção hidráulica, vidros elétricos" value={editando.acessorios} onChange={(e) => setEditando({ ...editando, acessorios: e.target.value })} />
              </Field>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Field label="Documentação do veículo">
                <Textarea rows={2} placeholder="Ex: CRLV em dia, IPVA pago até 2027, laudo cautelar ok..." value={editando.documentacao} onChange={(e) => setEditando({ ...editando, documentacao: e.target.value })} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Observações">
                <Textarea rows={2} value={editando.observacoes} onChange={(e) => setEditando({ ...editando, observacoes: e.target.value })} />
              </Field>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalAberto(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function InvestidoresField({
  investidores,
  usuarios,
  onChange,
}: {
  investidores: Investidor[];
  usuarios: ReturnType<typeof useDados>["usuarios"];
  onChange: (investidores: Investidor[]) => void;
}) {
  function percentualDe(usuarioId: string) {
    return investidores.find((i) => i.usuarioId === usuarioId)?.percentual ?? 0;
  }

  function setPercentual(usuarioId: string, percentual: number) {
    const outros = investidores.filter((i) => i.usuarioId !== usuarioId);
    const novo = percentual > 0 ? [...outros, { usuarioId, percentual }] : outros;
    onChange(novo);
  }

  function aplicarPreset(preset: "50-50" | number) {
    if (preset === "50-50") {
      const metade = Math.round((100 / usuarios.length) * 100) / 100;
      onChange(usuarios.map((u) => ({ usuarioId: u.id, percentual: metade })));
    } else {
      onChange([{ usuarioId: usuarios[preset].id, percentual: 100 }]);
    }
  }

  const total = investidores.reduce((s, i) => s + i.percentual, 0);

  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-1">Quem investiu na compra</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {usuarios.map((u, i) => (
          <button
            key={u.id}
            type="button"
            onClick={() => aplicarPreset(i)}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            100% {u.nome}
          </button>
        ))}
        {usuarios.length > 1 && (
          <button
            type="button"
            onClick={() => aplicarPreset("50-50")}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Dividir igual
          </button>
        )}
      </div>
      <div className="space-y-2">
        {usuarios.map((u) => (
          <div key={u.id} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: u.cor }} />
            <span className="text-sm text-gray-700 flex-1">{u.nome}</span>
            <Input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={percentualDe(u.id)}
              onChange={(e) => setPercentual(u.id, Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-400">%</span>
          </div>
        ))}
      </div>
      {investidores.length > 0 && (
        <p className={`text-xs mt-1.5 ${total === 100 ? "text-gray-400" : "text-amber-600"}`}>
          Total: {total}% {total !== 100 && "— não fecha 100%"}
        </p>
      )}
    </div>
  );
}

function VeiculoLinha({
  veiculo,
  veiculos,
  despesas,
  vendas,
  clientes,
  usuarios,
  expandido,
  onToggle,
  onEditar,
  onExcluir,
}: {
  veiculo: Veiculo;
  veiculos: Veiculo[];
  despesas: Despesa[];
  vendas: ReturnType<typeof useDados>["vendas"];
  clientes: ReturnType<typeof useDados>["clientes"];
  usuarios: ReturnType<typeof useDados>["usuarios"];
  expandido: boolean;
  onToggle: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const m = metricasVeiculo(veiculo.id, veiculos, despesas, vendas);
  const despesasVeiculo = despesas.filter((d) => d.veiculoId === veiculo.id);
  const vendaDoVeiculo = vendas.find((v) => v.veiculoId === veiculo.id);
  const comprador = vendaDoVeiculo ? clientes.find((c) => c.id === vendaDoVeiculo.clienteId) : undefined;

  return (
    <Card className="overflow-hidden">
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 items-center">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-semibold text-gray-900">{veiculo.marca} {veiculo.modelo}</p>
            <p className="text-xs text-gray-500">{veiculo.anoFab}/{veiculo.anoMod} · {veiculo.placa}</p>
            {comprador && (
              <p className="text-xs text-emerald-700 font-medium mt-0.5">Comprador: {comprador.nome}</p>
            )}
          </div>
          <Badge value={veiculo.status} />
          <Badge value={veiculo.tipoOperacao} />
          <div className="text-sm">
            <p className="text-gray-400 text-xs">Gasto total (compra+reparos)</p>
            <p className="font-medium">{formatMoeda(m.custoTotal)}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-400 text-xs">{m.realizado ? "Lucro" : "Lucro estimado"}</p>
            <p className={`font-medium ${m.lucro >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatMoeda(m.lucro)}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-400 text-xs">Markup</p>
            <p className={`font-medium ${m.markup >= 0 ? "text-emerald-600" : "text-red-600"}`}>{m.markup.toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onEditar(); }} className="p-2 text-gray-400 hover:text-gray-700">
            <Pencil size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onExcluir(); }} className="p-2 text-gray-400 hover:text-red-600">
            <Trash2 size={16} />
          </button>
          {expandido ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </div>

      {expandido && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white rounded-lg p-3 border border-gray-100 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Valor de compra</p>
              <p className="font-medium">{formatMoeda(m.valorCompra)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Despesas/reparos</p>
              <p className="font-medium">{formatMoeda(m.gastos)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">{m.realizado ? "Vendido por" : "Anunciado por"}</p>
              <p className="font-medium">{formatMoeda(m.precoVenda)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Entrada</p>
              <p className="font-medium">{formatData(veiculo.dataEntrada)}</p>
            </div>
            {comprador && (
              <div>
                <p className="text-gray-400 text-xs">Comprador</p>
                <p className="font-medium">{comprador.nome}</p>
              </div>
            )}
          </div>
          {veiculo.investidores && veiculo.investidores.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Quem investiu na compra</p>
              <div className="flex flex-wrap gap-2">
                {veiculo.investidores.map((inv) => {
                  const u = usuarios.find((x) => x.id === inv.usuarioId);
                  return (
                    <span
                      key={inv.usuarioId}
                      className="inline-flex items-center gap-1.5 text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u?.cor }} />
                      {u?.nome ?? "Usuário"} — {inv.percentual}% ({formatMoeda((veiculo.valorCompra * inv.percentual) / 100)})
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {veiculo.documentacao && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Documentação</p>
              <p className="text-sm text-gray-700">{veiculo.documentacao}</p>
            </div>
          )}
          {veiculo.chassi && (
            <p className="text-xs text-gray-500">Chassi: {veiculo.chassi} {veiculo.renavam && `· RENAVAM: ${veiculo.renavam}`} {veiculo.km ? `· ${veiculo.km.toLocaleString("pt-BR")} km` : ""}</p>
          )}
          <DespesasVeiculo veiculo={veiculo} usuarios={usuarios} despesas={despesasVeiculo} />
        </div>
      )}
    </Card>
  );
}

function DespesasVeiculo({
  veiculo,
  usuarios,
  despesas,
}: {
  veiculo: Veiculo;
  usuarios: ReturnType<typeof useDados>["usuarios"];
  despesas: Despesa[];
}) {
  const { usuario } = useAuth();
  const { salvarDespesa, excluirDespesa } = useDados();
  const [nova, setNova] = useState({ descricao: "", valor: 0, responsavelId: usuario?.id ?? "" });
  const [salvando, setSalvando] = useState(false);

  async function adicionar() {
    if (!nova.descricao || nova.valor <= 0) return;
    setSalvando(true);
    try {
      await salvarDespesa({
        id: uid(),
        veiculoId: veiculo.id,
        descricao: nova.descricao,
        valor: nova.valor,
        responsavelId: nova.responsavelId,
        data: hojeISO(),
      });
      setNova({ descricao: "", valor: 0, responsavelId: usuario?.id ?? "" });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível salvar essa despesa.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string) {
    try {
      await excluirDespesa(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível excluir essa despesa.");
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">
        Despesas do veículo (compra: {formatMoeda(veiculo.valorCompra)})
      </p>
      <div className="space-y-1 mb-3">
        {despesas.map((d) => {
          const resp = usuarios.find((u) => u.id === d.responsavelId);
          return (
            <div key={d.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-gray-100">
              <span>{d.descricao} {resp && <span className="text-gray-400">— {resp.nome}</span>}</span>
              <div className="flex items-center gap-3">
                <span className="font-medium">{formatMoeda(d.valor)}</span>
                <button onClick={() => remover(d.id)} className="text-gray-300 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
        {despesas.length === 0 && <p className="text-xs text-gray-400">Nenhuma despesa lançada.</p>}
      </div>
      <div className="flex gap-2 flex-wrap items-end">
        <div className="flex-1 min-w-[160px]">
          <Input placeholder="Descrição (ex: funilaria)" value={nova.descricao} onChange={(e) => setNova({ ...nova, descricao: e.target.value })} />
        </div>
        <div className="w-32">
          <Input type="number" step="0.01" placeholder="Valor" value={nova.valor || ""} onChange={(e) => setNova({ ...nova, valor: Number(e.target.value) })} />
        </div>
        <div className="w-40">
          <Select value={nova.responsavelId} onChange={(e) => setNova({ ...nova, responsavelId: e.target.value })}>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </Select>
        </div>
        <Button variant="secondary" onClick={adicionar} disabled={salvando}>{salvando ? "Salvando..." : "Adicionar"}</Button>
      </div>
    </div>
  );
}
