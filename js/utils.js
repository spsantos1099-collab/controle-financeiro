/* ==========================================================================
   UTILS.JS
   Funções utilitárias puras, usadas em várias partes do sistema.
   Mantidas separadas do app.js para facilitar reuso e testes.

   FORMATO DOS DADOS (definido aqui para todas as etapas seguirem o mesmo
   padrão — Dashboard, Receitas, Despesas e Relatórios dependem disso):

   usuarios/{uid}/receitas/{id} = {
     descricao: "Salário",
     categoria: "Salário",
     valor: 1500.00,
     data: "2026-08-05",              // formato ISO (aaaa-mm-dd)
     status: "recebido" | "pendente" | "atrasado",
     formaPagamento: "Pix",
     contaBancaria: "Nubank",
     observacoes: "",
     createdAt: 1234567890,
     updatedAt: 1234567890
   }

   usuarios/{uid}/despesas/{id} = {
     descricao: "Conta de luz",
     categoria: "Moradia",
     valor: 150.00,
     data: "2026-08-10",
     status: "pago" | "pendente" | "atrasado",
     formaPagamento: "Boleto",
     contaBancaria: "Nubank",
     observacoes: "",
     createdAt: 1234567890,
     updatedAt: 1234567890
   }
   ========================================================================== */

// Formata um número como moeda brasileira: 1234.5 -> "R$ 1.234,50"
export function formatarMoeda(valor, moeda = "BRL", locale = "pt-BR") {
  return new Intl.NumberFormat(locale, { style: "currency", currency: moeda }).format(valor || 0);
}

// Formata uma data ISO (2026-08-05) para o formato brasileiro (05/08/2026)
export function formatarData(dataIso, locale = "pt-BR") {
  if (!dataIso) return "";
  const data = new Date(dataIso + "T00:00:00");
  return new Intl.DateTimeFormat(locale).format(data);
}

// Gera um identificador simples para uso em elementos temporários da interface
export function gerarId(prefixo = "id") {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Divide um valor em N parcelas iguais, ajustando centavos na última parcela
// para garantir que a soma bata exatamente com o valor total.
export function calcularParcelas(valorTotal, quantidadeParcelas) {
  const valorCentavos = Math.round(valorTotal * 100);
  const parcelaBase = Math.floor(valorCentavos / quantidadeParcelas);
  const resto = valorCentavos - parcelaBase * quantidadeParcelas;

  return Array.from({ length: quantidadeParcelas }, (_, indice) => {
    const centavos = parcelaBase + (indice === quantidadeParcelas - 1 ? resto : 0);
    return centavos / 100;
  });
}

// Converte o objeto vindo do Realtime Database (chave -> valor) em uma
// lista de itens, cada um já carregando seu próprio "id".
export function paraLista(objetoFirebase) {
  if (!objetoFirebase) return [];
  return Object.entries(objetoFirebase).map(([id, dados]) => ({ id, ...dados }));
}

// Retorna o mês/ano atual no formato "aaaa-mm", usado para filtrar
// lançamentos do mês corrente.
export function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

// Verifica se uma data ISO ("aaaa-mm-dd") pertence a um mês ("aaaa-mm")
export function dataPertenceAoMes(dataIso, mes) {
  return typeof dataIso === "string" && dataIso.startsWith(mes);
}

// Soma o campo "valor" de uma lista de lançamentos
export function somarValores(lista) {
  return lista.reduce((total, item) => total + (Number(item.valor) || 0), 0);
}
