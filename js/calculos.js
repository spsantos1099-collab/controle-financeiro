/* ==========================================================================
   CALCULOS.JS
   Regras financeiras centrais do Fluxo. Dashboard, cartões, metas e
   relatórios usam a mesma lógica para evitar somas duplicadas.
   ========================================================================== */

function numero(valor) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : 0;
}

export function chavePessoa(nome) {
  return String(nome || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function mesDaData(data) {
  return typeof data === "string" && data.length >= 7 ? data.slice(0, 7) : "";
}

export function faturaManualDoMes(faturasManuais = [], cartaoId, mes) {
  return faturasManuais.find((fatura) =>
    fatura.cartaoId === cartaoId && fatura.mesReferencia === mes
  ) || null;
}

export function parcelasDoCartaoMes(parcelas = [], cartaoId, mes) {
  return parcelas.filter((parcela) =>
    parcela.cartaoId === cartaoId && parcela.mesFatura === mes
  );
}

export function totalFaturaCartao({ parcelas = [], faturasManuais = [] }, cartaoId, mes) {
  const manual = faturaManualDoMes(faturasManuais, cartaoId, mes);
  if (manual) return numero(manual.valor);
  return parcelasDoCartaoMes(parcelas, cartaoId, mes)
    .reduce((soma, parcela) => soma + numero(parcela.valor), 0);
}

export function totalPagoLegadoFatura({ parcelas = [], faturasManuais = [] }, cartaoId, mes) {
  const total = totalFaturaCartao({ parcelas, faturasManuais }, cartaoId, mes);
  const manual = faturaManualDoMes(faturasManuais, cartaoId, mes);
  if (manual) return manual.pago ? total : 0;

  const pago = parcelasDoCartaoMes(parcelas, cartaoId, mes)
    .filter((parcela) => parcela.pago)
    .reduce((soma, parcela) => soma + numero(parcela.valor), 0);

  return Math.min(total, pago);
}

export function pagamentosRegistradosFatura(pagamentosFaturas = [], cartaoId, mes) {
  return pagamentosFaturas
    .filter((pagamento) => pagamento.cartaoId === cartaoId && pagamento.mesReferencia === mes)
    .reduce((soma, pagamento) => soma + numero(pagamento.valor), 0);
}

export function totalPagoFaturaPropria(dados, cartaoId, mes) {
  const total = totalFaturaCartao(dados, cartaoId, mes);
  const registrado = pagamentosRegistradosFatura(dados.pagamentosFaturas || [], cartaoId, mes);
  if (registrado > 0) return Math.min(total, registrado);
  return totalPagoLegadoFatura(dados, cartaoId, mes);
}

export function restanteFaturaPropria(dados, cartaoId, mes) {
  return Math.max(0, totalFaturaCartao(dados, cartaoId, mes) - totalPagoFaturaPropria(dados, cartaoId, mes));
}

export function nomesPessoasDoMes(dados, mes) {
  const mapa = new Map();
  const cartoes = dados.cartoes || [];
  const despesas = dados.despesas || [];
  const acertos = dados.acertosPessoas || [];

  cartoes.filter((cartao) => cartao.tipo === "terceiro").forEach((cartao) => {
    const nome = String(cartao.titular || "Outra pessoa").trim();
    mapa.set(chavePessoa(nome), nome);
  });

  despesas.forEach((despesa) => {
    if (mesDaData(despesa.data) !== mes || !despesa.pessoaRelacionada) return;
    const nome = String(despesa.pessoaRelacionada).trim();
    mapa.set(chavePessoa(nome), nome);
  });

  acertos.forEach((acerto) => {
    if (acerto.mesReferencia !== mes || !acerto.pessoa) return;
    const nome = String(acerto.pessoa).trim();
    mapa.set(chavePessoa(nome), nome);
  });

  return [...mapa.values()];
}

export function resumoPessoaMes(dados, nomePessoa, mes) {
  const chave = chavePessoa(nomePessoa);
  const cartoes = dados.cartoes || [];
  const despesas = dados.despesas || [];
  const acertos = dados.acertosPessoas || [];

  const cartoesPessoa = cartoes.filter((cartao) =>
    cartao.tipo === "terceiro" && chavePessoa(cartao.titular || "Outra pessoa") === chave
  );

  const despesasPessoa = despesas.filter((despesa) =>
    mesDaData(despesa.data) === mes && chavePessoa(despesa.pessoaRelacionada) === chave
  );

  const totalCartoes = cartoesPessoa.reduce(
    (soma, cartao) => soma + totalFaturaCartao(dados, cartao.id, mes), 0
  );
  const totalDespesas = despesasPessoa.reduce((soma, despesa) => soma + numero(despesa.valor), 0);
  const totalMes = totalCartoes + totalDespesas;

  const pagamentosRegistrados = acertos
    .filter((acerto) => acerto.mesReferencia === mes && chavePessoa(acerto.pessoa) === chave)
    .reduce((soma, acerto) => soma + numero(acerto.valor), 0);

  const pagoLegadoCartoes = cartoesPessoa.reduce(
    (soma, cartao) => soma + totalPagoLegadoFatura(dados, cartao.id, mes), 0
  );
  const pagoLegadoDespesas = despesasPessoa
    .filter((despesa) => despesa.status === "pago")
    .reduce((soma, despesa) => soma + numero(despesa.valor), 0);
  const pagoLegado = pagoLegadoCartoes + pagoLegadoDespesas;

  const jaPago = Math.min(totalMes, pagamentosRegistrados > 0 ? pagamentosRegistrados : pagoLegado);

  return {
    pessoa: nomePessoa,
    cartoes: cartoesPessoa,
    despesas: despesasPessoa,
    totalCartoes,
    totalDespesas,
    totalMes,
    pagamentosRegistrados,
    pagoLegado,
    jaPago,
    restante: Math.max(0, totalMes - jaPago)
  };
}

export function totalFaturasMes(dados, mes) {
  return (dados.cartoes || []).reduce(
    (soma, cartao) => soma + totalFaturaCartao(dados, cartao.id, mes), 0
  );
}

export function totalDespesasMes(dados, mes) {
  return (dados.despesas || [])
    .filter((despesa) => mesDaData(despesa.data) === mes)
    .reduce((soma, despesa) => soma + numero(despesa.valor), 0);
}

export function totalSaidasPagasMes(dados, mes) {
  const despesas = dados.despesas || [];
  const cartoes = dados.cartoes || [];

  // Despesas vinculadas a alguém entram pelo acerto com a pessoa, evitando
  // que o mesmo pagamento seja debitado duas vezes.
  const despesasComunsPagas = despesas
    .filter((despesa) => mesDaData(despesa.data) === mes)
    .filter((despesa) => !String(despesa.pessoaRelacionada || "").trim())
    .filter((despesa) => despesa.status === "pago")
    .reduce((soma, despesa) => soma + numero(despesa.valor), 0);

  const cartoesPropriosPagos = cartoes
    .filter((cartao) => cartao.tipo !== "terceiro")
    .reduce((soma, cartao) => soma + totalPagoFaturaPropria(dados, cartao.id, mes), 0);

  const pessoasPagas = nomesPessoasDoMes(dados, mes)
    .reduce((soma, pessoa) => soma + resumoPessoaMes(dados, pessoa, mes).jaPago, 0);

  return despesasComunsPagas + cartoesPropriosPagos + pessoasPagas;
}

/* --------------------------------------------------------------------------
   METAS: dinheiro reservado continua sendo patrimônio, mas deixa de estar
   disponível para uso cotidiano. Movimentos positivos reservam; negativos
   devolvem dinheiro ao saldo disponível.
   -------------------------------------------------------------------------- */
export function movimentosMetasDoMes(metas = [], mes) {
  const movimentos = [];
  metas.forEach((meta) => {
    Object.entries(meta.movimentos || {}).forEach(([id, movimento]) => {
      if (mesDaData(movimento.data) !== mes) return;
      movimentos.push({ id, metaId: meta.id, metaNome: meta.nome || "Meta", ...movimento });
    });
  });
  return movimentos;
}

export function resumoReservasMetasMes(metas = [], mes) {
  const movimentos = movimentosMetasDoMes(metas, mes);
  const reservado = movimentos
    .filter((item) => numero(item.valor) > 0)
    .reduce((soma, item) => soma + numero(item.valor), 0);
  const retirado = movimentos
    .filter((item) => numero(item.valor) < 0)
    .reduce((soma, item) => soma + Math.abs(numero(item.valor)), 0);
  const impactoLiquido = movimentos.reduce((soma, item) => soma + numero(item.valor), 0);
  return { reservado, retirado, impactoLiquido, movimentos };
}

/* --------------------------------------------------------------------------
   VALORES A RECEBER DE PESSOAS: só viram entrada financeira quando o usuário
   confirma que recebeu. Enquanto pendentes, são apenas um controle auxiliar.
   -------------------------------------------------------------------------- */
export function dividasRecebidasNoMes(dividasReceber = [], mes) {
  return dividasReceber.filter((item) =>
    item.status === "recebido" && mesDaData(item.dataRecebimento) === mes
  );
}

export function totalRecebidoDePessoasMes(dividasReceber = [], mes) {
  return dividasRecebidasNoMes(dividasReceber, mes)
    .reduce((soma, item) => soma + numero(item.valor), 0);
}

export function mesesComMovimentacao(dados) {
  const meses = new Set();
  (dados.receitas || []).forEach((item) => { const mes = mesDaData(item.data); if (mes) meses.add(mes); });
  (dados.despesas || []).forEach((item) => { const mes = mesDaData(item.data); if (mes) meses.add(mes); });
  (dados.parcelas || []).forEach((item) => { if (item.mesFatura) meses.add(item.mesFatura); });
  (dados.faturasManuais || []).forEach((item) => { if (item.mesReferencia) meses.add(item.mesReferencia); });
  (dados.acertosPessoas || []).forEach((item) => { if (item.mesReferencia) meses.add(item.mesReferencia); });
  (dados.pagamentosFaturas || []).forEach((item) => { if (item.mesReferencia) meses.add(item.mesReferencia); });
  (dados.dividasReceber || []).forEach((item) => {
    const mes = mesDaData(item.status === "recebido" ? item.dataRecebimento : item.dataPrevista);
    if (mes) meses.add(mes);
  });
  (dados.metas || []).forEach((meta) => {
    Object.values(meta.movimentos || {}).forEach((movimento) => {
      const mes = mesDaData(movimento.data);
      if (mes) meses.add(mes);
    });
  });
  return [...meses].sort();
}

export function calcularSaldoCaixa(dados, mes) {
  const receitasRegulares = (dados.receitas || [])
    .filter((receita) => mesDaData(receita.data) === mes)
    .filter((receita) => receita.status === "recebido")
    .reduce((soma, receita) => soma + numero(receita.valor), 0);
  const recebidosDePessoas = totalRecebidoDePessoasMes(dados.dividasReceber || [], mes);
  return receitasRegulares + recebidosDePessoas - totalSaidasPagasMes(dados, mes);
}

export function calcularSaldoAtual(dados, mes) {
  // Mantido por compatibilidade: agora representa o saldo realmente disponível,
  // já descontando valores que foram separados para metas no mês.
  const caixa = calcularSaldoCaixa(dados, mes);
  const reservas = resumoReservasMetasMes(dados.metas || [], mes);
  return caixa - reservas.impactoLiquido;
}

export function resumoFinanceiroMes(dados, mes) {
  const receitasDoMes = (dados.receitas || []).filter((receita) => mesDaData(receita.data) === mes);
  const despesasDoMes = (dados.despesas || []).filter((despesa) => mesDaData(despesa.data) === mes);

  const receitasPrevistas = receitasDoMes.reduce((soma, receita) => soma + numero(receita.valor), 0);
  const receitasRegularesRecebidas = receitasDoMes
    .filter((receita) => receita.status === "recebido")
    .reduce((soma, receita) => soma + numero(receita.valor), 0);
  const receitasRecebidasPessoas = totalRecebidoDePessoasMes(dados.dividasReceber || [], mes);
  const receitasRecebidas = receitasRegularesRecebidas + receitasRecebidasPessoas;

  const despesas = despesasDoMes.reduce((soma, despesa) => soma + numero(despesa.valor), 0);
  const faturas = totalFaturasMes(dados, mes);
  const totalComprometido = despesas + faturas;
  const pago = totalSaidasPagasMes(dados, mes);
  const reservas = resumoReservasMetasMes(dados.metas || [], mes);
  const saldoCaixa = receitasRecebidas - pago;
  const saldoDisponivel = saldoCaixa - reservas.impactoLiquido;

  return {
    receitasPrevistas,
    receitasRegularesRecebidas,
    receitasRecebidasPessoas,
    receitasRecebidas,
    aReceber: Math.max(0, receitasPrevistas - receitasRegularesRecebidas),
    despesas,
    faturas,
    totalComprometido,
    pago,
    aPagar: Math.max(0, totalComprometido - pago),
    reservadoMetas: reservas.reservado,
    retiradoMetas: reservas.retirado,
    impactoMetas: reservas.impactoLiquido,
    resultadoPrevisto: receitasPrevistas - totalComprometido,
    saldoCaixa,
    saldoDisponivel,
    saldoAtual: saldoDisponivel
  };
}
