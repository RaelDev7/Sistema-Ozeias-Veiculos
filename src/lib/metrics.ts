import { EMPRESA } from "@/config/empresa";
import type {
  Veiculo,
  Despesa,
  Venda,
  Parcela,
  Movimentacao,
  TemplateMensagem,
  DadosContrato,
} from "@/types";
import { formatMoeda } from "@/lib/format";

export function gastosVeiculo(veiculoId: string, despesas: Despesa[]): number {
  return despesas.filter((d) => d.veiculoId === veiculoId).reduce((s, d) => s + d.valor, 0);
}

export interface MetricasVeiculo {
  valorCompra: number;
  gastos: number;
  custoTotal: number;
  precoVenda: number;
  realizado: boolean;
  lucro: number;
  markup: number;
}

export function metricasVeiculo(
  veiculoId: string,
  veiculos: Veiculo[],
  despesas: Despesa[],
  vendas: Venda[]
): MetricasVeiculo {
  const veic = veiculos.find((v) => v.id === veiculoId);
  const valorCompra = veic?.valorCompra ?? 0;
  const gastos = gastosVeiculo(veiculoId, despesas);
  const custoTotal = valorCompra + gastos;
  const vendaReal = vendas.find((v) => v.veiculoId === veiculoId);
  const realizado = !!vendaReal;
  const precoVenda = vendaReal ? vendaReal.valorVenda : veic?.precoVenda ?? 0;
  const lucro = precoVenda - custoTotal;
  const markup = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0;
  return { valorCompra, gastos, custoTotal, precoVenda, realizado, lucro, markup };
}

export function custoTotalVeiculo(veiculoId: string, veiculos: Veiculo[], despesas: Despesa[]): number {
  const veic = veiculos.find((v) => v.id === veiculoId);
  if (!veic) return 0;
  return veic.valorCompra + gastosVeiculo(veiculoId, despesas);
}

/** Status "efetivo" da parcela pra exibição — não persiste "atrasado" no banco,
 *  só calcula na hora com base na data de hoje. */
export function statusExibicaoParcela(parcela: Parcela): Parcela["status"] {
  const hoje = new Date().toISOString().slice(0, 10);
  if ((parcela.status === "pendente" || parcela.status === "parcial") && parcela.dataVencimento < hoje) {
    return "atrasado";
  }
  return parcela.status;
}

export function montarLinkWhatsapp(
  telefone: string,
  template: TemplateMensagem,
  vars: Record<string, string>
) {
  let texto = template.texto;
  Object.entries(vars).forEach(([k, v]) => {
    texto = texto.replaceAll(`{${k}}`, v);
  });
  const numero = telefone.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export interface ResumoMensal {
  mes: string; // "2026-09"
  label: string; // "Set/2026"
  entradas: number;
  saidas: number;
  saldo: number;
}

const MESES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export function resumoMensalMovimentacoes(movimentacoes: Movimentacao[]): ResumoMensal[] {
  const porMes = new Map<string, { entradas: number; saidas: number }>();
  for (const m of movimentacoes) {
    const mes = m.data.slice(0, 7); // "2026-09"
    const atual = porMes.get(mes) ?? { entradas: 0, saidas: 0 };
    if (m.tipo === "entrada") atual.entradas += m.valor;
    else atual.saidas += m.valor;
    porMes.set(mes, atual);
  }
  return [...porMes.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([mes, v]) => {
      const [ano, mesNum] = mes.split("-");
      return {
        mes,
        label: `${MESES_ABREV[Number(mesNum) - 1]}/${ano}`,
        entradas: v.entradas,
        saidas: v.saidas,
        saldo: v.entradas - v.saidas,
      };
    });
}

export function resumoMensalVendas(vendas: Venda[]): { mes: string; label: string; quantidade: number; total: number }[] {
  const porMes = new Map<string, { quantidade: number; total: number }>();
  for (const v of vendas) {
    const mes = v.data.slice(0, 7);
    const atual = porMes.get(mes) ?? { quantidade: 0, total: 0 };
    atual.quantidade += 1;
    atual.total += v.valorVenda;
    porMes.set(mes, atual);
  }
  return [...porMes.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([mes, v]) => {
      const [ano, mesNum] = mes.split("-");
      return { mes, label: `${MESES_ABREV[Number(mesNum) - 1]}/${ano}`, ...v };
    });
}

export function dadosContratoPadrao(venda: Venda, nomeRepresentante: string): DadosContrato {
  return {
    representanteVendedor: EMPRESA.proprietario || nomeRepresentante,
    cpfRepresentante: EMPRESA.cpfProprietario,
    formaPagamento: venda.formaPagamento === "parcelado" ? "financiamento" : "pix",
    formaPagamentoOutra: "",
    entradaDescricao:
      venda.formaPagamento === "avista"
        ? "CARRO PAGO INTEGRAL"
        : venda.valorEntrada > 0
          ? `Entrada de ${formatMoeda(venda.valorEntrada)} + ${venda.numeroParcelas}x de ${formatMoeda((venda.valorVenda - venda.valorEntrada) / venda.numeroParcelas)}`
          : `${venda.numeroParcelas}x conforme parcelas do sistema, sem entrada`,
    valorFinanciado: venda.formaPagamento === "parcelado" ? venda.valorVenda - venda.valorEntrada : 0,
    dataEntrega: venda.data,
    horaEntrega: "",
    entregaCondicao: venda.formaPagamento === "parcelado" ? "financiamento_liberado" : "integral",
    entregaCondicaoOutra: "",
    itensEntregues: {
      chaves: true,
      manual: true,
      crlv: true,
      estepe: true,
      macaco: true,
      chaveRoda: true,
      triangulo: true,
      outros: "",
    },
    ressalvas: "",
    vistoria: {
      motorNormal: true,
      cambioNormal: true,
      suspensaoNormal: true,
      arCondicionadoFunciona: true,
      eletricaNormal: true,
      lataria: "Pintura e lataria em bom estado, apenas com marcas de uso.",
      pneus: "Bons/seminovos",
      vidros: "OK",
      interior: "OK",
      outrosApontamentos: "",
    },
    garantia: {
      prazoDias: 90,
      kmLimite: 5000,
      componentes: "Motor, câmbio e ar-condicionado",
      observacoes:
        "Se constar mau uso do cliente, a loja não se responsabiliza por eventuais prejuízos. Falta de óleo no motor ou de água no reservatório por esquecimento/falta de manutenção não são cobertos pela garantia.",
    },
    localAssinatura: EMPRESA.cidade,
  };
}
