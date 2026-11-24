export function baixarCsv(nomeArquivo: string, colunas: string[], linhas: (string | number)[][]) {
  const escapar = (v: string | number) => {
    const s = String(v ?? "");
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const conteudo = [colunas, ...linhas]
    .map((linha) => linha.map(escapar).join(";"))
    .join("\n");
  // BOM pra acentuação abrir certinho no Excel
  const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
