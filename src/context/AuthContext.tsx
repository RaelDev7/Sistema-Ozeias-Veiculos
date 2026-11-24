import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Usuario } from "@/types";
import { api } from "@/lib/api";

type UsuarioSemSenha = Omit<Usuario, "senha">;

interface AuthContextType {
  usuario: UsuarioSemSenha | null;
  login: (login: string, senha: string) => Promise<boolean>;
  logout: () => void;
  carregandoSessao: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "ozeias_veiculos_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSemSenha | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) setUsuario(JSON.parse(raw));
    setCarregandoSessao(false);
  }, []);

  async function login(loginInput: string, senha: string) {
    const u = await api.auth.login(loginInput, senha);
    if (u) {
      setUsuario(u);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
      return true;
    }
    return false;
  }

  function logout() {
    setUsuario(null);
    sessionStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregandoSessao }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
