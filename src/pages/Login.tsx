import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginInput, setLoginInput] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const ok = await login(loginInput, senha);
      if (ok) {
        navigate("/");
      } else {
        setErro("Login ou senha inválidos");
      }
    } catch {
      setErro("Não foi possível conectar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-red">OZEIAS VEÍCULOS</h1>
          <p className="text-gray-500 text-sm mt-1">Controle de estoque e vendas</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <Label>Usuário</Label>
            <Input value={loginInput} onChange={(e) => setLoginInput(e.target.value)} autoFocus />
          </div>
          <div>
            <Label>Senha</Label>
            <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
