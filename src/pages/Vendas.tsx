import { useState } from "react";
import { useDados } from "@/context/DataContext";
import { statusExibicaoParcela, montarLinkWhatsapp } from "@/lib/metrics";
import { uid } from "@/lib/api";
import { baixarCsv } from "@/lib/csv";
import { useAuth } from "@/context/AuthContext";
import type { Venda, TipoOperacao, FormaPagamento, Parcela, Cliente } from "@/types";
import { Card, Badge, Modal } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Field } from "@/components/ui/Input";
import { formatMoeda, formatData, hojeISO } from "@/lib/format";
import { Plus, Trash2, Pencil, MessageCircle, ChevronDown, ChevronUp, Check, Download } from "lucide-react";

function vazioVenda(): Venda {
  return {
    id: uid(),
    veiculoId: "",
    clienteId: "",
    vendidoPor: "",
    tipoContrato: "venda",
    valorVenda: 0,
    valorEntrada: 0,
    formaPagamento: "avista",
    numeroParcelas: 1,
    data: hojeISO(),
    observacoes: "",
  };
}

export function Vendas() {
  const { usuario } = useAuth();
  const { veiculos, clientes, usuarios, vendas, parcelas, templates, salvarVenda, excluirVenda, darBaixaParcela, editarValorParcela } = useDados();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Venda | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const ehEdicao = !!editando && vendas.some((v) => v.id === editando.id);
  const parcelasDaVendaEmEdicao = editando ? parcelas.filter((p) => p.vendaId === editando.id) : [];
  const bloquearFinanceiro = ehEdicao && parcelasDaVendaEmEdicao.some((p) => p.valorPago > 0);

  // No "novo" só mostra carro disponível; editando, mantém o carro já vinculado
  // àquela venda na lista (mesmo que o status dele já esteja "vendido")
  const veiculosDisponiveis = veiculos.filter(
    (v) => v.status !== "vendido" || (editando && v.id === editando.veiculoId)
  );

  function abrirNova() {
    setEditando({ ...vazioVenda(), vendidoPor: usuario?.id ?? "" });
    setModalAberto(true);
  }

  function abrirEdicao(venda: Venda) {
    setEditando({ ...venda });
    setModalAberto(true);
  }

  async function salvar() {
    if (!editando || !editando.veiculoId || !editando.clienteId || editando.valorVenda <= 0) return;
    setSalvando(true);
    try {
      await salvarVenda(editando);
      setModalAberto(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível salvar essa venda.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta venda e suas parcelas?")) return;
    try {
      await excluirVenda(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível excluir essa venda.");
    }
  }

  function baixarRelatorio() {
    const linhas = vendas.map((v) => {
      const veic = veiculos.find((x) => x.id === v.veiculoId);
      const cli = clientes.find((x) => x.id === v.clienteId);
      const vend = usuarios.find((x) => x.id === v.vendidoPor);
      const parcelasVenda = parcelas.filter((p) => p.vendaId === v.id);
      const recebido = v.valorEntrada + parcelasVenda.reduce((s, p) => s + p.valorPago, 0);
      const saldo = parcelasVenda.reduce((s, p) => s + (p.valorDevido - p.valorPago), 0);
      return [
        formatData(v.data),
        veic ? `${veic.marca} ${veic.modelo}` : "",
        veic?.placa ?? "",
        cli?.nome ?? "",
        cli?.telefone ?? "",
        v.tipoContrato,
        v.formaPagamento,
        v.valorVenda,
        v.valorEntrada,
        recebido,
        saldo,
        vend?.nome ?? "",
      ];
    });
    baixarCsv(
      `relatorio-vendas-${hojeISO()}.csv`,
      ["Data", "Veículo", "Placa", "Cliente", "Telefone", "Tipo", "Forma de pagamento", "Valor da venda", "Entrada", "Recebido", "Saldo devedor", "Vendido por"],
      linhas
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas & Parcelas</h1>
          <p className="text-gray-500">Controle de vendas, repasses e cobrança</p>
        </div>
        <Button onClick={abrirNova} className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={16} /> Nova venda
        </Button>
      </div>

      {vendas.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button variant="secondary" onClick={baixarRelatorio} className="flex items-center gap-2">
            <Download size={15} /> Baixar relatório de vendas
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {vendas.length === 0 && (
          <Card className="p-8 text-center text-gray-400">Nenhuma venda registrada.</Card>
        )}
        {vendas.map((v) => (
          <VendaLinha
            key={v.id}
            venda={v}
            veiculos={veiculos}
            clientes={clientes}
            usuarios={usuarios}
            parcelas={parcelas.filter((p) => p.vendaId === v.id)}
            templates={templates}
            onToggle={() => setExpandido(expandido === v.id ? null : v.id)}
            expandido={expandido === v.id}
            onEditar={() => abrirEdicao(v)}
            onExcluir={() => excluir(v.id)}
            darBaixaParcela={darBaixaParcela}
            editarValorParcela={editarValorParcela}
          />
        ))}
      </div>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={ehEdicao ? "Editar venda" : "Nova venda"} wide>
        {editando && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Veículo">
                <Select value={editando.veiculoId} onChange={(e) => setEditando({ ...editando, veiculoId: e.target.value })}>
                  <option value="">Selecione...</option>
                  {veiculosDisponiveis.map((v) => (
                    <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.placa}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Cliente">
                <Select value={editando.clienteId} onChange={(e) => setEditando({ ...editando, clienteId: e.target.value })}>
                  <option value="">Selecione...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Vendido/repassado por">
              <Select value={editando.vendidoPor} onChange={(e) => setEditando({ ...editando, vendidoPor: e.target.value })}>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </Select>
            </Field>
            <Field label="Tipo de contrato">
              <Select value={editando.tipoContrato} onChange={(e) => setEditando({ ...editando, tipoContrato: e.target.value as TipoOperacao })}>
                <option value="venda">Venda</option>
                <option value="repasse">Repasse</option>
              </Select>
            </Field>
            <Field label="Valor total">
              <Input type="number" step="0.01" disabled={bloquearFinanceiro} value={editando.valorVenda} onChange={(e) => setEditando({ ...editando, valorVenda: Number(e.target.value) })} />
            </Field>
            <Field label="Data">
              <Input type="date" value={editando.data} onChange={(e) => setEditando({ ...editando, data: e.target.value })} />
            </Field>
            <Field label="Forma de pagamento">
              <Select disabled={bloquearFinanceiro} value={editando.formaPagamento} onChange={(e) => setEditando({ ...editando, formaPagamento: e.target.value as FormaPagamento, numeroParcelas: e.target.value === "avista" ? 1 : editando.numeroParcelas, valorEntrada: e.target.value === "avista" ? 0 : editando.valorEntrada })}>
                <option value="avista">À vista</option>
                <option value="parcelado">Parcelado</option>
              </Select>
            </Field>
            {editando.formaPagamento === "parcelado" && (
              <>
                <Field label="Valor de entrada">
                  <Input type="number" step="0.01" min={0} max={editando.valorVenda} disabled={bloquearFinanceiro} value={editando.valorEntrada} onChange={(e) => setEditando({ ...editando, valorEntrada: Number(e.target.value) })} />
                </Field>
                <Field label="Número de parcelas">
                  <Input type="number" min={1} disabled={bloquearFinanceiro} value={editando.numeroParcelas} onChange={(e) => setEditando({ ...editando, numeroParcelas: Number(e.target.value) })} />
                </Field>
                <div className="sm:col-span-2 -mt-2">
                  <p className="text-xs text-gray-500">
                    Saldo a parcelar: {formatMoeda(Math.max(editando.valorVenda - editando.valorEntrada, 0))} ·{" "}
                    {editando.numeroParcelas > 0
                      ? `${editando.numeroParcelas}x de ${formatMoeda(Math.max(editando.valorVenda - editando.valorEntrada, 0) / editando.numeroParcelas)}`
                      : ""}
                  </p>
                </div>
              </>
            )}
            {bloquearFinanceiro && (
              <div className="col-span-2 -mt-2">
                <p className="text-xs text-amber-600">
                  Essa venda já tem parcela paga — valor, entrada, forma de pagamento e número de parcelas ficam travados pra não bagunçar o que já foi recebido.
                </p>
              </div>
            )}
            <div className="col-span-2">
              <Field label="Observações">
                <Textarea rows={2} value={editando.observacoes} onChange={(e) => setEditando({ ...editando, observacoes: e.target.value })} />
              </Field>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalAberto(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={salvando}>{salvando ? "Salvando..." : ehEdicao ? "Salvar alterações" : "Salvar venda"}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function VendaLinha({
  venda,
  veiculos,
  clientes,
  usuarios,
  parcelas,
  templates,
  expandido,
  onToggle,
  onEditar,
  onExcluir,
  darBaixaParcela,
  editarValorParcela,
}: {
  venda: Venda;
  veiculos: ReturnType<typeof useDados>["veiculos"];
  clientes: Cliente[];
  usuarios: ReturnType<typeof useDados>["usuarios"];
  parcelas: Parcela[];
  templates: ReturnType<typeof useDados>["templates"];
  expandido: boolean;
  onToggle: () => void;
  onEditar: () => void;
  onExcluir: () => void;
  darBaixaParcela: ReturnType<typeof useDados>["darBaixaParcela"];
  editarValorParcela: ReturnType<typeof useDados>["editarValorParcela"];
}) {
  const veiculo = veiculos.find((v) => v.id === venda.veiculoId);
  const cliente = clientes.find((c) => c.id === venda.clienteId);
  const vendedor = usuarios.find((u) => u.id === venda.vendidoPor);
  const parcelasOrdenadas = [...parcelas].sort((a, b) => a.numero - b.numero);
  const saldoDevedor = parcelas.reduce((s, p) => s + (p.valorDevido - p.valorPago), 0);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 items-center">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-semibold text-gray-900">{veiculo ? `${veiculo.marca} ${veiculo.modelo}` : "Veículo removido"}</p>
            <p className="text-xs text-gray-500">{cliente?.nome ?? "Cliente removido"}</p>
          </div>
          <Badge value={venda.tipoContrato} />
          <div className="text-sm">
            <p className="text-gray-400 text-xs">Valor</p>
            <p className="font-medium">{formatMoeda(venda.valorVenda)}</p>
            {venda.valorEntrada > 0 && (
              <p className="text-xs text-gray-400">Entrada: {formatMoeda(venda.valorEntrada)}</p>
            )}
          </div>
          <div className="text-sm">
            <p className="text-gray-400 text-xs">Saldo devedor</p>
            <p className={`font-medium ${saldoDevedor > 0 ? "text-red-600" : "text-emerald-600"}`}>{formatMoeda(saldoDevedor)}</p>
          </div>
          <div className="text-xs text-gray-500">
            {vendedor?.nome} · {formatData(venda.data)}
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

      {expandido && cliente && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <ParcelasVenda parcelas={parcelasOrdenadas} cliente={cliente} templates={templates} darBaixaParcela={darBaixaParcela} editarValorParcela={editarValorParcela} />
        </div>
      )}
    </Card>
  );
}

function ParcelasVenda({
  parcelas,
  cliente,
  templates,
  darBaixaParcela,
  editarValorParcela,
}: {
  parcelas: Parcela[];
  cliente: Cliente;
  templates: ReturnType<typeof useDados>["templates"];
  darBaixaParcela: ReturnType<typeof useDados>["darBaixaParcela"];
  editarValorParcela: ReturnType<typeof useDados>["editarValorParcela"];
}) {
  const { usuario } = useAuth();
  const [baixaAberta, setBaixaAberta] = useState<string | null>(null);
  const [valorBaixa, setValorBaixa] = useState(0);
  const [dataBaixa, setDataBaixa] = useState(hojeISO());
  const [edicaoAberta, setEdicaoAberta] = useState<string | null>(null);
  const [novoValor, setNovoValor] = useState(0);
  const [salvando, setSalvando] = useState(false);

  function abrirBaixa(p: Parcela) {
    setEdicaoAberta(null);
    setBaixaAberta(p.id);
    setValorBaixa(p.valorDevido - p.valorPago);
    setDataBaixa(hojeISO());
  }

  function abrirEdicaoValor(p: Parcela) {
    setBaixaAberta(null);
    setEdicaoAberta(p.id);
    setNovoValor(p.valorDevido);
  }

  async function confirmarBaixa() {
    if (!baixaAberta || valorBaixa <= 0) return;
    setSalvando(true);
    try {
      await darBaixaParcela(baixaAberta, valorBaixa, dataBaixa);
      setBaixaAberta(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível dar baixa nessa parcela.");
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarEdicaoValor() {
    if (!edicaoAberta || novoValor <= 0) return;
    setSalvando(true);
    try {
      await editarValorParcela(edicaoAberta, novoValor);
      setEdicaoAberta(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível alterar o valor dessa parcela.");
    } finally {
      setSalvando(false);
    }
  }

  function linkCobranca(p: Parcela) {
    const template = templates[0];
    if (!template) return "#";
    return montarLinkWhatsapp(cliente.telefone, template, {
      nome: cliente.nome,
      valor: formatMoeda(p.valorDevido - p.valorPago),
      vencimento: formatData(p.dataVencimento),
      parcela: `${p.numero}/${parcelas.length}`,
      meuWhats: usuario?.whatsapp || "",
    });
  }

  if (parcelas.length === 0) return <p className="text-sm text-gray-400">Pagamento à vista, sem parcelas.</p>;

  return (
    <div className="space-y-2">
      {parcelas.map((p) => {
        const status = statusExibicaoParcela(p);
        return (
          <div key={p.id} className="bg-white rounded-lg border border-gray-100 px-3 py-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Parcela {p.numero}/{parcelas.length}</span>
                <Badge value={status} />
                <span className="text-xs text-gray-500">Venc. {formatData(p.dataVencimento)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {formatMoeda(p.valorPago)} / <span className="font-medium">{formatMoeda(p.valorDevido)}</span>
                </span>
                {p.status !== "pago" && (
                  <>
                    <a href={linkCobranca(p)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                      <MessageCircle size={14} /> Cobrar
                    </a>
                    <button onClick={() => abrirEdicaoValor(p)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium">
                      <Pencil size={13} /> Valor
                    </button>
                    <button onClick={() => abrirBaixa(p)} className="flex items-center gap-1 text-xs text-brand-red hover:text-brand-red-dark font-medium">
                      <Check size={14} /> Dar baixa
                    </button>
                  </>
                )}
              </div>
            </div>
            {baixaAberta === p.id && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-end gap-2 flex-wrap">
                <div className="w-32">
                  <Field label="Valor pago">
                    <Input type="number" step="0.01" value={valorBaixa} onChange={(e) => setValorBaixa(Number(e.target.value))} />
                  </Field>
                </div>
                <div className="w-40">
                  <Field label="Data do pagamento">
                    <Input type="date" value={dataBaixa} onChange={(e) => setDataBaixa(e.target.value)} />
                  </Field>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  Pode lançar valor menor (pagamento parcial) ou o valor cheio antecipado.
                </p>
                <Button onClick={confirmarBaixa} disabled={salvando} className="mb-0">{salvando ? "Salvando..." : "Confirmar"}</Button>
                <Button variant="secondary" onClick={() => setBaixaAberta(null)}>Cancelar</Button>
              </div>
            )}
            {edicaoAberta === p.id && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-end gap-2 flex-wrap">
                <div className="w-32">
                  <Field label="Novo valor da parcela">
                    <Input type="number" step="0.01" value={novoValor} onChange={(e) => setNovoValor(Number(e.target.value))} />
                  </Field>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  Ajusta só essa parcela — pode combinar com o cliente de pagar mais num mês e menos no outro.
                </p>
                <Button onClick={confirmarEdicaoValor} disabled={salvando} className="mb-0">{salvando ? "Salvando..." : "Confirmar"}</Button>
                <Button variant="secondary" onClick={() => setEdicaoAberta(null)}>Cancelar</Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
