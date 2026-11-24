import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Car,
  Users,
  Receipt,
  FileText,
  ArrowLeftRight,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/estoque", label: "Estoque", icon: Car },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/vendas", label: "Vendas & Parcelas", icon: Receipt },
  { to: "/contratos", label: "Contratos", icon: FileText },
  { to: "/movimentacoes", label: "Entrada & Saída", icon: ArrowLeftRight },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Layout() {
  const { usuario, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();
  const paginaAtual = links.find((l) =>
    l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)
  );

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Topbar mobile */}
      <header className="md:hidden flex items-center justify-between bg-brand-red text-white px-4 py-3 sticky top-0 z-30">
        <button onClick={() => setMenuAberto(true)} className="p-1 -ml-1">
          <Menu size={22} />
        </button>
        <span className="font-semibold text-sm">{paginaAtual?.label ?? "OZEIAS VEÍCULOS"}</span>
        <span className="w-6" />
      </header>

      {/* Overlay + drawer mobile */}
      {menuAberto && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuAberto(false)} />
          <aside className="relative w-64 max-w-[80%] bg-brand-red text-white flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <h1 className="font-bold text-lg leading-tight">OZEIAS VEÍCULOS</h1>
                <p className="text-xs text-white/70">Estoque e vendas</p>
              </div>
              <button onClick={() => setMenuAberto(false)} className="p-1">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
              {links.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuAberto(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-white/10">
              <p className="text-sm font-medium">{usuario?.nome}</p>
              <button
                onClick={logout}
                className="mt-2 flex items-center gap-2 text-xs text-white/70 hover:text-white"
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 bg-brand-red text-white flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <h1 className="font-bold text-lg leading-tight">OZEIAS VEÍCULOS</h1>
          <p className="text-xs text-white/70">Controle de estoque e vendas</p>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-sm font-medium">{usuario?.nome}</p>
          <button
            onClick={logout}
            className="mt-2 flex items-center gap-2 text-xs text-white/70 hover:text-white"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
