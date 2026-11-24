export type StatusVeiculo =
  | "disponivel"
  | "vendido"
  | "oficina"
  | "em_uso"
  | "reservado";

export type TipoOperacao = "repasse" | "venda";

export interface Usuario {
  id: string;
  nome: string;
  login: string;
  senha: string;
  cor: string; // usado pra identificar o usuário nas listagens
  whatsapp: string; // número de WhatsApp do usuário, usado na cobrança
}

export interface Investidor {
  usuarioId: string;
  percentual: number; // 0-100
}

export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  anoFab: string;
  anoMod: string;
  cor: string;
  combustivel: string;
  motor: string;
  acessorios: string; // ex: "ar condicionado, direção hidráulica, vidros elétricos"
  placa: string;
  renavam: string;
  chassi: string;
  km: number;
  tipoOperacao: TipoOperacao;
  status: StatusVeiculo;
  dataEntrada: string; // ISO date
  valorCompra: number;
  precoVenda: number; // preço de venda pretendido/anunciado — usado pra estimar lucro e markup antes de vender
  documentacao: string; // texto livre: "CRLV em dia", "IPVA pago até 2027", etc
  observacoes: string;
  cadastradoPor: string; // usuarioId
  investidores: Investidor[]; // quem pagou a compra e em que %, entre os usuários
  createdAt: string;
}

export interface Despesa {
  id: string;
  veiculoId: string;
  descricao: string;
  valor: number;
  responsavelId: string; // usuarioId (quem fez/pagou a manutenção)
  data: string;
}

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  nacionalidade: string;
  estadoCivil: string;
  telefone: string; // formato com DDI pra montar link do whats: 5588999999999
  email: string;
  endereco: string; // rua/número
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  observacoes: string;
}

export type FormaPagamento = "avista" | "parcelado";

export type FormaPagamentoContrato =
  | "pix"
  | "dinheiro"
  | "cartao"
  | "financiamento"
  | "transferencia"
  | "outra";

export interface ItensEntregues {
  chaves: boolean;
  manual: boolean;
  crlv: boolean;
  estepe: boolean;
  macaco: boolean;
  chaveRoda: boolean;
  triangulo: boolean;
  outros: string;
}

export interface VistoriaVeiculo {
  motorNormal: boolean;
  cambioNormal: boolean;
  suspensaoNormal: boolean;
  arCondicionadoFunciona: boolean;
  eletricaNormal: boolean;
  lataria: string;
  pneus: string;
  vidros: string;
  interior: string;
  outrosApontamentos: string;
}

export interface DadosGarantia {
  prazoDias: number;
  kmLimite: number;
  componentes: string;
  observacoes: string;
}

export interface DadosContrato {
  representanteVendedor: string; // nome de quem assina pela Ozeias Veículos (proprietário)
  cpfRepresentante: string;
  formaPagamento: FormaPagamentoContrato;
  formaPagamentoOutra: string;
  entradaDescricao: string; // ex: "CARRO PAGO INTEGRAL VIA PIX" ou "2.000,00 em dinheiro em 01/09/2026"
  valorFinanciado: number;
  dataEntrega: string; // ISO
  horaEntrega: string;
  entregaCondicao: "integral" | "financiamento_liberado" | "outra";
  entregaCondicaoOutra: string;
  itensEntregues: ItensEntregues;
  ressalvas: string; // defeitos/avarias informados ao comprador
  vistoria: VistoriaVeiculo;
  garantia: DadosGarantia; // só usado no contrato tipo "venda" (com garantia de 3 meses)
  localAssinatura: string; // ex: "Ibaretama/CE"
}

export interface Venda {
  id: string;
  veiculoId: string;
  clienteId: string;
  vendidoPor: string; // usuarioId
  tipoContrato: TipoOperacao;
  valorVenda: number;
  valorEntrada: number; // valor pago à vista pelo cliente no ato da venda, abatido antes de dividir as parcelas
  formaPagamento: FormaPagamento;
  numeroParcelas: number;
  data: string;
  observacoes: string;
  contrato?: DadosContrato;
}

export type StatusParcela = "pendente" | "pago" | "atrasado" | "parcial";

export interface Parcela {
  id: string;
  vendaId: string;
  numero: number;
  valorDevido: number;
  valorPago: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: StatusParcela;
}

export type TipoMovimentacao = "entrada" | "saida";

export interface Movimentacao {
  id: string;
  tipo: TipoMovimentacao;
  valor: number;
  descricao: string;
  categoria: string;
  data: string;
  veiculoId: string | null;
}

export interface TemplateMensagem {
  id: string;
  titulo: string;
  texto: string; // suporta variáveis {nome}, {valor}, {vencimento}, {parcela}
}
