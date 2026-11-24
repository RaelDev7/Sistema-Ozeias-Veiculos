import { useState } from "react";
import { useDados } from "@/context/DataContext";
import { uid } from "@/lib/api";
import { baixarCsv } from "@/lib/csv";
import type { Cliente } from "@/types";
import { Card, Modal } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Plus, Trash2, Pencil, Phone, Download } from "lucide-react";

function vazio(): Cliente {
  return {
    id: uid(),
    nome: "",
    cpf: "",
    rg: "",
    nacionalidade: "Brasileiro(a)",
    estadoCivil: "",
    telefone: "",
    email: "",
    endereco: "",
    bairro: "",
    cidade: "",
    uf: "CE",
    cep: "",
    observacoes: "",
  };
}

export function Clientes() {
  const { clientes, salvarCliente, excluirCliente } = useDados();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!editando || !editando.nome || !editando.telefone) return;
    setSalvando(true);
    try {
      await salvarCliente(editando);
      setModalAberto(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível salvar esse cliente.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este cliente?")) return;
    try {
      await excluirCliente(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível excluir esse cliente.");
    }
  }

  function baixarRelatorio() {
    baixarCsv(
      `relatorio-clientes-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Nome", "CPF", "RG", "Telefone", "E-mail", "Endereço", "Bairro", "Cidade", "UF", "CEP", "Observações"],
      clientes.map((c) => [c.nome, c.cpf, c.rg, c.telefone, c.email, c.endereco, c.bairro, c.cidade, c.uf, c.cep, c.observacoes])
    );
  }

  const lista = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Cadastro de compradores</p>
        </div>
        <Button
          onClick={() => { setEditando(vazio()); setModalAberto(true); }}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={16} /> Novo cliente
        </Button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} className="max-w-sm" />
        {clientes.length > 0 && (
          <Button variant="secondary" onClick={baixarRelatorio} className="flex items-center gap-2 shrink-0">
            <Download size={15} /> Baixar relatório de clientes
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lista.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{c.nome}</p>
                {c.cpf && <p className="text-xs text-gray-500">CPF: {c.cpf}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditando(c); setModalAberto(true); }} className="p-1.5 text-gray-400 hover:text-gray-700">
                  <Pencil size={14} />
                </button>
                <button onClick={() => excluir(c.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
              <Phone size={13} /> {c.telefone}
            </p>
            {c.endereco && <p className="text-xs text-gray-400 mt-1">{c.endereco}</p>}
          </Card>
        ))}
        {lista.length === 0 && (
          <p className="text-gray-400 text-sm col-span-full text-center py-8">Nenhum cliente encontrado.</p>
        )}
      </div>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={editando?.nome ? "Editar cliente" : "Novo cliente"} wide>
        {editando && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nome">
                <Input value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="CPF">
                <Input value={editando.cpf} onChange={(e) => setEditando({ ...editando, cpf: e.target.value })} />
              </Field>
              <Field label="RG">
                <Input value={editando.rg} onChange={(e) => setEditando({ ...editando, rg: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nacionalidade">
                <Input value={editando.nacionalidade} onChange={(e) => setEditando({ ...editando, nacionalidade: e.target.value })} />
              </Field>
              <Field label="Estado civil">
                <Input placeholder="Solteiro(a), Casado(a)..." value={editando.estadoCivil} onChange={(e) => setEditando({ ...editando, estadoCivil: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Telefone (WhatsApp, com DDD)">
                <Input placeholder="88999999999" value={editando.telefone} onChange={(e) => setEditando({ ...editando, telefone: e.target.value })} />
              </Field>
              <Field label="E-mail">
                <Input value={editando.email} onChange={(e) => setEditando({ ...editando, email: e.target.value })} />
              </Field>
            </div>
            <Field label="Endereço (rua/número)">
              <Input value={editando.endereco} onChange={(e) => setEditando({ ...editando, endereco: e.target.value })} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Bairro">
                <Input value={editando.bairro} onChange={(e) => setEditando({ ...editando, bairro: e.target.value })} />
              </Field>
              <Field label="Cidade">
                <Input value={editando.cidade} onChange={(e) => setEditando({ ...editando, cidade: e.target.value })} />
              </Field>
              <Field label="UF">
                <Input value={editando.uf} onChange={(e) => setEditando({ ...editando, uf: e.target.value.toUpperCase() })} />
              </Field>
            </div>
            <Field label="CEP">
              <Input value={editando.cep} onChange={(e) => setEditando({ ...editando, cep: e.target.value })} />
            </Field>
            <Field label="Observações">
              <Textarea rows={2} value={editando.observacoes} onChange={(e) => setEditando({ ...editando, observacoes: e.target.value })} />
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
