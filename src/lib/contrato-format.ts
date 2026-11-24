const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function dataPorExtenso(iso: string) {
  if (!iso) return "____/____/________";
  const [ano, mes, dia] = iso.split("-");
  return `${dia} de ${MESES[Number(mes) - 1]?.toUpperCase()} de ${ano}`;
}

export function check(v: boolean) {
  return v ? "(X)" : "( )";
}

export function simNao(v: boolean) {
  return v ? "SIM" : "NÃO";
}

export function linhaVazia(tamanho: "curta" | "media" | "longa" = "media") {
  const tamanhos = { curta: 20, media: 35, longa: 55 };
  return "_".repeat(tamanhos[tamanho]);
}
