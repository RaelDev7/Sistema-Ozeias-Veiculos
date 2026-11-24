import { useMemo } from "react";
import { useDados } from "@/context/DataContext";
import { metricasVeiculo, resumoMensalMovimentacoes } from "@/lib/metrics";
import { Card } from "@/components/ui/Card";
import { formatMoeda } from "@/lib/format";
import { Car, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

export function Dashboard() {
  const { veiculos, despesas, vendas, parcelas, movimentacoes, loading } = useDados();

  const stats = useMemo(() => {
    const emEstoque = veiculos.filter((v) => v.status === "disponivel").length;
    const vendidos = veiculos.filter((v) => v.status === "vendido").length;

    const aReceber = parcelas
      .filter((p) => p.status !== "pago")
      .reduce((s, p) => s + (p.valorDevido - p.valorPago), 0);

    const recebido = parcelas.reduce((s, p) => s + p.valorPago, 0);

    const hoje = new Date().toISOString().slice(0, 10);
    const atrasadas = parcelas.filter(
      (p) => (p.status === "pendente" || p.status === "parcial") && p.dataVencimento < hoje
    ).length;

    const totalInvestido = veiculos.reduce(
      (s, v) => s + metricasVeiculo(v.id, veiculos, despesas, vendas).custoTotal,
      0
    );

    const totalEntradas = movimentacoes
      .filter((m) => m.tipo === "entrada")
      .reduce((s, m) => s + m.valor, 0);
    const totalSaidas = movimentacoes
      .filter((m) => m.tipo === "saida")
      .reduce((s, m) => s + m.valor, 0);

    const vendidosMetricas = veiculos
      .filter((v) => v.status === "vendido")
      .map((v) => metricasVeiculo(v.id, veiculos, despesas, vendas));
    const lucroRealizado = vendidosMetricas.reduce((s, m) => s + m.lucro, 0);
    const markupMedio =
      vendidosMetricas.length > 0
        ? vendidosMetricas.reduce((s, m) => s + m.markup, 0) / vendidosMetricas.length
        : 0;

    return {
      emEstoque,
      vendidos,
      aReceber,
      recebido,
      atrasadas,
      totalInvestido,
      saldoCaixa: totalEntradas - totalSaidas,
      lucroRealizado,
      markupMedio,
    };
  }, [veiculos, despesas, vendas, parcelas, movimentacoes]);

  const resumoMensal = useMemo(() => resumoMensalMovimentacoes(movimentacoes).slice(0, 6), [movimentacoes]);

  const cards = [
    {
      label: "Veículos em estoque",
      value: stats.emEstoque,
      icon: Car,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      label: "A receber",
      value: formatMoeda(stats.aReceber),
      icon: DollarSign,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Parcelas atrasadas",
      value: stats.atrasadas,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100",
    },
    {
      label: "Saldo em caixa",
      value: formatMoeda(stats.saldoCaixa),
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  if (loading) {
    return <p className="text-gray-400 text-sm">Carregando...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">Visão geral da Ozeias Veículos</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Resumo do estoque</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total de veículos</span>
              <span className="font-medium">{veiculos.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vendidos</span>
              <span className="font-medium">{stats.vendidos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total investido (compra + gastos)</span>
              <span className="font-medium">{formatMoeda(stats.totalInvestido)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Já recebido em parcelas</span>
              <span className="font-medium">{formatMoeda(stats.recebido)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Lucro realizado (vendidos)</span>
              <span className="font-medium text-emerald-600">{formatMoeda(stats.lucroRealizado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Markup médio</span>
              <span className="font-medium">{stats.markupMedio.toFixed(1)}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Últimos veículos cadastrados</h2>
          {veiculos.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum veículo cadastrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {[...veiculos]
                .sort((a, b) => +new Date(b.dataEntrada) - +new Date(a.dataEntrada))
                .slice(0, 5)
                .map((v) => (
                  <div key={v.id} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                    <span>{v.marca} {v.modelo}</span>
                    <span className="text-gray-500">{v.placa}</span>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5 mt-4">
        <h2 className="font-semibold text-gray-900 mb-3">Fluxo de caixa por mês</h2>
        {resumoMensal.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma movimentação registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                  <th className="pb-2 font-medium">Mês</th>
                  <th className="pb-2 font-medium text-right">Entradas</th>
                  <th className="pb-2 font-medium text-right">Saídas</th>
                  <th className="pb-2 font-medium text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {resumoMensal.map((r) => (
                  <tr key={r.mes} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-medium text-gray-700">{r.label}</td>
                    <td className="py-2 text-right text-emerald-600">{formatMoeda(r.entradas)}</td>
                    <td className="py-2 text-right text-red-600">{formatMoeda(r.saidas)}</td>
                    <td className={`py-2 text-right font-medium ${r.saldo >= 0 ? "text-gray-900" : "text-red-600"}`}>
                      {formatMoeda(r.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
