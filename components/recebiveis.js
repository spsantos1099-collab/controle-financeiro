/* ==========================================================================
   COMPONENTS/RECEBIVEIS.JS
   Helpers para valores que outras pessoas devem ao usuário.
   ========================================================================== */

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

export function totalPendenteRecebiveis(lista = []) {
  return lista
    .filter((item) => item.status !== "recebido")
    .reduce((soma, item) => soma + numero(item.valor), 0);
}

export function totalRecebidoRecebiveis(lista = []) {
  return lista
    .filter((item) => item.status === "recebido")
    .reduce((soma, item) => soma + numero(item.valor), 0);
}

export function ordenarRecebiveis(lista = []) {
  return [...lista].sort((a, b) => {
    const statusA = a.status === "recebido" ? 1 : 0;
    const statusB = b.status === "recebido" ? 1 : 0;
    if (statusA !== statusB) return statusA - statusB;
    const dataA = a.status === "recebido" ? a.dataRecebimento : a.dataPrevista;
    const dataB = b.status === "recebido" ? b.dataRecebimento : b.dataPrevista;
    return String(dataB || "").localeCompare(String(dataA || ""));
  });
}
