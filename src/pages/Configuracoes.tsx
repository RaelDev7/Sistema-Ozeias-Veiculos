import { useState } from "react";
import { useDados } from "@/context/DataContext";
import { uid } from "@/lib/api";
import type { TemplateMensagem } from "@/types";
import { Card, Modal } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

function vazio(): TemplateMensagem {
  return { id: uid(), titulo: "", texto: "" };
}

export function Configuracoes() {
  const { usuarios, templates, salvarTemplate, excluirTemplate, salvarUsuario } = useDados();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<TemplateMensagem | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!editando || !editando.titulo || !editando.texto) return;
    setSalvando(true);
    try {
      await salvarTemplate(editando);
      setModalAberto(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível salvar esse template.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este template?")) return;
    try {
      await excluirTemplate(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível excluir esse template.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Configurações</h1>
        <p className="text-gray-500">Usuários e mensagens de cobrança</p>
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Usuários</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
          {usuarios.map((u) => (
            <SocioCard key={u.id} usuario={u} salvarUsuario={salvarUsuario} />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Cada usuário loga com seu próprio acesso — vendas e manutenções ficam registradas com o nome de quem fez.
          O WhatsApp de cada um pode ser usado na mensagem de cobrança (variável <code>{"{meuWhats}"}</code>).
        </p>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 max-w-2xl">
          <h2 className="font-semibold text-gray-900">Templates de cobrança (WhatsApp)</h2>
          <Button variant="secondary" onClick={() => { setEditando(vazio()); setModalAberto(true); }} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus size={16} /> Novo template
          </Button>
        </div>
        <div className="space-y-3 max-w-2xl">
          {templates.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{t.titulo}</p>
                  <p className="text-sm text-gray-500 mt-1">{t.texto}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditando(t); setModalAberto(true); }} className="p-1.5 text-gray-400 hover:text-gray-700">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => excluir(t.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 max-w-2xl">
          Variáveis disponíveis: <code>{"{nome}"}</code>, <code>{"{valor}"}</code>, <code>{"{vencimento}"}</code>, <code>{"{parcela}"}</code>, <code>{"{meuWhats}"}</code>.
          O botão "Cobrar" na tela de Vendas usa o primeiro template da lista, preenche o WhatsApp de quem estiver
          logado no momento em <code>{"{meuWhats}"}</code>, e já abre o WhatsApp do cliente com a mensagem pronta.
        </p>
      </div>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={editando?.titulo ? "Editar template" : "Novo template"}>
        {editando && (
          <div className="space-y-4">
            <Field label="Título">
              <Input value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} />
            </Field>
            <Field label="Mensagem">
              <Textarea rows={4} value={editando.texto} onChange={(e) => setEditando({ ...editando, texto: e.target.value })} />
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

function SocioCard({
  usuario,
  salvarUsuario,
}: {
  usuario: ReturnType<typeof useDados>["usuarios"][number];
  salvarUsuario: ReturnType<typeof useDados>["salvarUsuario"];
}) {
  const [editando, setEditando] = useState(false);
  const [whatsapp, setWhatsapp] = useState(usuario.whatsapp ?? "");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
      await salvarUsuario({ id: usuario.id, nome: usuario.nome, cor: usuario.cor, whatsapp });
      setEditando(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível salvar o WhatsApp desse usuário.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: usuario.cor }} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{usuario.nome}</p>
          <p className="text-xs text-gray-400">login: {usuario.login}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        {editando ? (
          <div className="flex items-center gap-2">
            <Input
              placeholder="88999999999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="flex-1"
            />
            <button onClick={salvar} disabled={salvando} className="p-2 text-emerald-600 hover:text-emerald-700">
              <Check size={16} />
            </button>
            <button onClick={() => { setEditando(false); setWhatsapp(usuario.whatsapp ?? ""); }} className="p-2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              WhatsApp: {usuario.whatsapp || <span className="text-gray-400">não cadastrado</span>}
            </p>
            <button onClick={() => setEditando(true)} className="p-1.5 text-gray-400 hover:text-gray-700">
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
