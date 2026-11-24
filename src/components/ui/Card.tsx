import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const badgeColors: Record<string, string> = {
  disponivel: "bg-emerald-100 text-emerald-800",
  vendido: "bg-red-100 text-red-800",
  oficina: "bg-amber-100 text-amber-800",
  em_uso: "bg-blue-100 text-blue-800",
  reservado: "bg-purple-100 text-purple-800",
  pendente: "bg-gray-100 text-gray-700",
  pago: "bg-emerald-100 text-emerald-800",
  atrasado: "bg-red-100 text-red-800",
  parcial: "bg-amber-100 text-amber-800",
  repasse: "bg-blue-100 text-blue-800",
  venda: "bg-brand-red/10 text-brand-red",
};

const labels: Record<string, string> = {
  disponivel: "Disponível",
  vendido: "Vendido",
  oficina: "Oficina",
  em_uso: "Em uso",
  reservado: "Reservado",
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  parcial: "Parcial",
  repasse: "Repasse",
  venda: "Venda",
  entrada: "Entrada",
  saida: "Saída",
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
        badgeColors[value] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[value] ?? value}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
