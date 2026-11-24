import { useState } from "react";
import { createPortal } from "react-dom";
import { useDados } from "@/context/DataContext";
import { dadosContratoPadrao } from "@/lib/metrics";
import { useAuth } from "@/context/AuthContext";
import type {
  Venda,
  Veiculo,
  Cliente,
  DadosContrato,
  FormaPagamentoContrato,
} from "@/types";
import { Card, Badge, Modal } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Field } from "@/components/ui/Input";
import { formatMoeda, formatData } from "@/lib/format";
import { ContratoRepasse } from "@/components/contracts/ContratoRepasse";
import { ContratoGarantia } from "@/components/contracts/ContratoGarantia";
import { FileText, Printer, Search } from "lucide-react";

export function Contratos() {
  const { usuario } = useAuth();
  const { veiculos, clientes, usuarios, vendas, salvarVenda } = useDados();
  const [busca, setBusca] = useState("");
  const [vendaAtual, setVendaAtual] = useState<Venda | null>(null);
  const [dados, setDados] = useState<DadosContrato | null>(null);
  const [modalForm, setModalForm] = useState(false);
  const [modalPreview, setModalPreview] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const lista = vendas.filter((v) => {
    if (!busca) return true;
    const veic = veiculos.find((x) => x.id === v.veiculoId);
    const cli = clientes.find((x) => x.id === v.clienteId);
    const alvo = `${veic?.marca ?? ""} ${veic?.modelo ?? ""} ${veic?.placa ?? ""} ${cli?.nome ?? ""}`.toLowerCase();
    return alvo.includes(busca.toLowerCase());
  });

  function abrirEdicao(venda: Venda) {
    const repVendedor = usuarios.find((u) => u.id === venda.vendidoPor)?.nome ?? usuario?.nome ?? "";
    setVendaAtual(venda);
    setDados(venda.contrato ?? dadosContratoPadrao(venda, repVendedor));
    setModalForm(true);
  }

  async function salvarEAbrirPreview() {
    if (!vendaAtual || !dados) return;
    const atualizada = { ...vendaAtual, contrato: dados };
    setSalvando(true);
    try {
      await salvarVenda(atualizada);
      setVendaAtual(atualizada);
      setModalForm(false);
      setModalPreview(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível salvar os dados do contrato.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-500">Gerar e imprimir contrato de repasse ou de venda com garantia</p>
        </div>
      </div>

      <div className="mb-4 max-w-sm relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-8"
          placeholder="Buscar por cliente, marca, modelo ou placa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {lista.length === 0 && (
          <Card className="p-8 text-center text-gray-400">Nenhuma venda encontrada.</Card>
        )}
        {lista.map((venda) => {
          const veic = veiculos.find((v) => v.id === venda.veiculoId);
          const cli = clientes.find((c) => c.id === venda.clienteId);
          return (
            <Card key={venda.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{veic ? `${veic.marca} ${veic.modelo}` : "Veículo removido"}</p>
                  <p className="text-xs text-gray-500">{cli?.nome ?? "Cliente removido"} · {formatData(venda.data)} · {formatMoeda(venda.valorVenda)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge value={venda.tipoContrato} />
                <Button variant="secondary" onClick={() => abrirEdicao(venda)} className="flex items-center gap-2">
                  <FileText size={15} /> {venda.contrato ? "Editar / Imprimir" : "Gerar contrato"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal de edição dos dados do contrato */}
      <Modal open={modalForm} onClose={() => setModalForm(false)} title="Dados do contrato" wide>
        {dados && vendaAtual && (
          <FormularioContrato
            dados={dados}
            setDados={setDados}
            mostrarGarantia={vendaAtual.tipoContrato === "venda"}
            onCancelar={() => setModalForm(false)}
            onContinuar={salvarEAbrirPreview}
            salvando={salvando}
          />
        )}
      </Modal>

      {/* Modal de preview/impressão */}
      <Modal open={modalPreview} onClose={() => setModalPreview(false)} title="Pré-visualização do contrato" wide>
        {vendaAtual && dados && (
          <div>
            <div className="flex justify-end gap-2 mb-4 no-print">
              <Button variant="secondary" onClick={() => { setModalPreview(false); setModalForm(true); }}>
                Voltar e editar
              </Button>
              <Button onClick={() => window.print()} className="flex items-center gap-2">
                <Printer size={16} /> Imprimir / Salvar PDF
              </Button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-[65vh] overflow-y-auto">
              <PreviewContrato venda={vendaAtual} dados={dados} veiculos={veiculos} clientes={clientes} />
            </div>
          </div>
        )}
      </Modal>

      {/* Cópia renderizada fora do modal, só pra impressão — evita herdar
          centralização/flex do modal, que causava espaço em branco no PDF */}
      {vendaAtual && dados &&
        createPortal(
          <PreviewContrato venda={vendaAtual} dados={dados} veiculos={veiculos} clientes={clientes} />,
          document.getElementById("print-root")!
        )}
    </div>
  );
}

function PreviewContrato({
  venda,
  dados,
  veiculos,
  clientes,
}: {
  venda: Venda;
  dados: DadosContrato;
  veiculos: Veiculo[];
  clientes: Cliente[];
}) {
  const veiculo = veiculos.find((v) => v.id === venda.veiculoId);
  const cliente = clientes.find((c) => c.id === venda.clienteId);
  if (!veiculo || !cliente) return <p className="text-sm text-gray-400">Veículo ou cliente não encontrado.</p>;

  return venda.tipoContrato === "repasse" ? (
    <ContratoRepasse veiculo={veiculo} cliente={cliente} venda={venda} dados={dados} />
  ) : (
    <ContratoGarantia veiculo={veiculo} cliente={cliente} venda={venda} dados={dados} />
  );
}

function FormularioContrato({
  dados,
  setDados,
  mostrarGarantia,
  onCancelar,
  onContinuar,
  salvando,
}: {
  dados: DadosContrato;
  setDados: (d: DadosContrato) => void;
  mostrarGarantia: boolean;
  onCancelar: () => void;
  onContinuar: () => void;
  salvando: boolean;
}) {
  const it = dados.itensEntregues;
  const v = dados.vistoria;
  const g = dados.garantia;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Representante e pagamento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Proprietário (assina pela Ozeias Veículos)">
            <Input value={dados.representanteVendedor} onChange={(e) => setDados({ ...dados, representanteVendedor: e.target.value })} />
          </Field>
          <Field label="CPF do proprietário">
            <Input value={dados.cpfRepresentante} onChange={(e) => setDados({ ...dados, cpfRepresentante: e.target.value })} />
          </Field>
          <Field label="Forma de pagamento">
            <Select value={dados.formaPagamento} onChange={(e) => setDados({ ...dados, formaPagamento: e.target.value as FormaPagamentoContrato })}>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="financiamento">Financiamento</option>
              <option value="transferencia">Transferência</option>
              <option value="outra">Outra</option>
            </Select>
          </Field>
          {dados.formaPagamento === "outra" && (
            <Field label="Especifique a forma de pagamento">
              <Input value={dados.formaPagamentoOutra} onChange={(e) => setDados({ ...dados, formaPagamentoOutra: e.target.value })} />
            </Field>
          )}
          <div className="sm:col-span-2">
            <Field label="Descrição da entrada">
              <Input placeholder='Ex: "CARRO PAGO INTEGRAL VIA PIX" ou "2.000,00 em dinheiro em 01/09/2026"' value={dados.entradaDescricao} onChange={(e) => setDados({ ...dados, entradaDescricao: e.target.value })} />
            </Field>
          </div>
          {dados.formaPagamento === "financiamento" && (
            <Field label="Valor financiado">
              <Input type="number" step="0.01" value={dados.valorFinanciado} onChange={(e) => setDados({ ...dados, valorFinanciado: Number(e.target.value) })} />
            </Field>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Entrega</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Data de entrega">
            <Input type="date" value={dados.dataEntrega} onChange={(e) => setDados({ ...dados, dataEntrega: e.target.value })} />
          </Field>
          <Field label="Hora de entrega">
            <Input type="time" value={dados.horaEntrega} onChange={(e) => setDados({ ...dados, horaEntrega: e.target.value })} />
          </Field>
          <Field label="Local da assinatura">
            <Input value={dados.localAssinatura} onChange={(e) => setDados({ ...dados, localAssinatura: e.target.value })} />
          </Field>
        </div>
        <p className="text-xs text-gray-500 mt-3 mb-1">Itens/documentos entregues:</p>
        <div className="flex flex-wrap gap-3">
          {([
            ["chaves", "Chaves"],
            ["manual", "Manual"],
            ["crlv", "CRLV-e"],
            ["estepe", "Estepe"],
            ["macaco", "Macaco"],
            ["chaveRoda", "Chave de roda"],
            ["triangulo", "Triângulo"],
          ] as [keyof typeof it, string][]).map(([campo, label]) => (
            <label key={campo} className="flex items-center gap-1.5 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={it[campo] as boolean}
                onChange={(e) => setDados({ ...dados, itensEntregues: { ...it, [campo]: e.target.checked } })}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Vistoria e ressalvas</h3>
        <Field label="Defeitos/avarias/observações informadas ao comprador">
          <Textarea rows={2} value={dados.ressalvas} onChange={(e) => setDados({ ...dados, ressalvas: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input type="checkbox" checked={v.motorNormal} onChange={(e) => setDados({ ...dados, vistoria: { ...v, motorNormal: e.target.checked } })} />
            Motor normal
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input type="checkbox" checked={v.cambioNormal} onChange={(e) => setDados({ ...dados, vistoria: { ...v, cambioNormal: e.target.checked } })} />
            Câmbio/embreagem normal
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input type="checkbox" checked={v.suspensaoNormal} onChange={(e) => setDados({ ...dados, vistoria: { ...v, suspensaoNormal: e.target.checked } })} />
            Suspensão/direção/freios normal
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input type="checkbox" checked={v.arCondicionadoFunciona} onChange={(e) => setDados({ ...dados, vistoria: { ...v, arCondicionadoFunciona: e.target.checked } })} />
            Ar-condicionado funcionando
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input type="checkbox" checked={v.eletricaNormal} onChange={(e) => setDados({ ...dados, vistoria: { ...v, eletricaNormal: e.target.checked } })} />
            Elétrica/iluminação normal
          </label>
        </div>
        {mostrarGarantia && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <Field label="Lataria/pintura">
              <Input value={v.lataria} onChange={(e) => setDados({ ...dados, vistoria: { ...v, lataria: e.target.value } })} />
            </Field>
            <Field label="Pneus">
              <Input value={v.pneus} onChange={(e) => setDados({ ...dados, vistoria: { ...v, pneus: e.target.value } })} />
            </Field>
            <Field label="Vidros/retrovisores">
              <Input value={v.vidros} onChange={(e) => setDados({ ...dados, vistoria: { ...v, vidros: e.target.value } })} />
            </Field>
            <Field label="Interior/bancos/tapetes">
              <Input value={v.interior} onChange={(e) => setDados({ ...dados, vistoria: { ...v, interior: e.target.value } })} />
            </Field>
          </div>
        )}
      </section>

      {mostrarGarantia && (
        <section>
          <h3 className="font-semibold text-gray-800 mb-2 text-sm">Garantia (Anexo II)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Prazo (dias)">
              <Input type="number" value={g.prazoDias} onChange={(e) => setDados({ ...dados, garantia: { ...g, prazoDias: Number(e.target.value) } })} />
            </Field>
            <Field label="Limite de KM">
              <Input type="number" value={g.kmLimite} onChange={(e) => setDados({ ...dados, garantia: { ...g, kmLimite: Number(e.target.value) } })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Componentes abrangidos">
                <Input value={g.componentes} onChange={(e) => setDados({ ...dados, garantia: { ...g, componentes: e.target.value } })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Observações e condições">
                <Textarea rows={2} value={g.observacoes} onChange={(e) => setDados({ ...dados, garantia: { ...g, observacoes: e.target.value } })} />
              </Field>
            </div>
          </div>
        </section>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button onClick={onContinuar} disabled={salvando} className="flex items-center gap-2">
          <Printer size={16} /> {salvando ? "Salvando..." : "Ver e imprimir"}
        </Button>
      </div>
    </div>
  );
}
