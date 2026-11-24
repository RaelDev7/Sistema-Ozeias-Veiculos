import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Estoque } from "@/pages/Estoque";
import { Clientes } from "@/pages/Clientes";
import { Vendas } from "@/pages/Vendas";
import { Contratos } from "@/pages/Contratos";
import { Movimentacoes } from "@/pages/Movimentacoes";
import { Configuracoes } from "@/pages/Configuracoes";

function Privado({ children }: { children: React.ReactNode }) {
  const { usuario, carregandoSessao } = useAuth();
  if (carregandoSessao) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  return <DataProvider>{children}</DataProvider>;
}

function AppRoutes() {
  const { usuario, carregandoSessao } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={!carregandoSessao && usuario ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        element={
          <Privado>
            <Layout />
          </Privado>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/contratos" element={<Contratos />} />
        <Route path="/movimentacoes" element={<Movimentacoes />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
