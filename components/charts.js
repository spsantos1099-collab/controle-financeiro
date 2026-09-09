/* ==========================================================================
   COMPONENTS/CHARTS.JS
   Gráficos desenhados em SVG puro (sem bibliotecas externas), para
   respeitar a regra do projeto de usar apenas HTML/CSS/JS.
   ========================================================================== */

import { formatarMoeda } from "../js/utils.js";

/* --------------------------------------------------------------------
   GRÁFICO DE BARRAS — Receitas x Despesas por mês
   dados: [{ label: "Jan", receita: 1200, despesa: 800 }, ...]
   -------------------------------------------------------------------- */
export function criarGraficoBarras(container, dados) {
  if (!dados.length || dados.every((d) => d.receita === 0 && d.despesa === 0)) {
    container.innerHTML = '<p class="grafico-vazio">Sem lançamentos para mostrar ainda.</p>';
    return;
  }

  const largura = 640;
  const altura = 260;
  const margemBaixo = 28;
  const margemTopo = 12;
  const alturaUtil = altura - margemBaixo - margemTopo;
  const maiorValor = Math.max(...dados.map((d) => Math.max(d.receita, d.despesa)), 1);
  const larguraGrupo = largura / dados.length;
  const larguraBarra = Math.min(22, larguraGrupo / 3.2);

  const barras = dados.map((ponto, indice) => {
    const centroGrupo = larguraGrupo * indice + larguraGrupo / 2;
    const alturaReceita = (ponto.receita / maiorValor) * alturaUtil;
    const alturaDespesa = (ponto.despesa / maiorValor) * alturaUtil;

    return `
      <g>
        <rect x="${centroGrupo - larguraBarra - 3}" y="${margemTopo + alturaUtil - alturaReceita}"
              width="${larguraBarra}" height="${alturaReceita}" rx="3"
              fill="var(--cor-receita)">
          <title>Receitas ${ponto.label}: ${formatarMoeda(ponto.receita)}</title>
        </rect>
        <rect x="${centroGrupo + 3}" y="${margemTopo + alturaUtil - alturaDespesa}"
              width="${larguraBarra}" height="${alturaDespesa}" rx="3"
              fill="var(--cor-despesa)">
          <title>Despesas ${ponto.label}: ${formatarMoeda(ponto.despesa)}</title>
        </rect>
        <text x="${centroGrupo}" y="${altura - 6}" text-anchor="middle"
              fill="var(--cor-texto-suave)" font-size="11" font-family="Inter, sans-serif">
          ${ponto.label}
        </text>
      </g>
    `;
  }).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${largura} ${altura}" width="100%" role="img" aria-label="Gráfico de receitas e despesas por mês">
      <line x1="0" y1="${margemTopo + alturaUtil}" x2="${largura}" y2="${margemTopo + alturaUtil}" stroke="var(--cor-borda)" />
      ${barras}
    </svg>
  `;
}

/* --------------------------------------------------------------------
   GRÁFICO DE ROSCA — Despesas por categoria
   dados: [{ label: "Moradia", valor: 500, cor: "#..." }, ...]
   -------------------------------------------------------------------- */
const PALETA_CATEGORIAS = [
  "#0D5C4C", "#2ED9B0", "#F5A623", "#3B82F6", "#E5484D",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1"
];

export function criarGraficoDonut(container, dados) {
  const total = dados.reduce((soma, item) => soma + item.valor, 0);

  if (!dados.length || total === 0) {
    container.innerHTML = '<p class="grafico-vazio">Sem despesas categorizadas este mês.</p>';
    return;
  }

  const raio = 70;
  const raioInterno = 44;
  const centro = 90;
  let anguloAtual = -90;

  const fatias = dados.map((item, indice) => {
    const fracao = item.valor / total;
    const anguloInicial = anguloAtual;
    const anguloFinal = anguloAtual + fracao * 360;
    anguloAtual = anguloFinal;

    const cor = item.cor || PALETA_CATEGORIAS[indice % PALETA_CATEGORIAS.length];
    const grandeArco = anguloFinal - anguloInicial > 180 ? 1 : 0;

    const pontoExterno = (angulo) => [
      centro + raio * Math.cos((angulo * Math.PI) / 180),
      centro + raio * Math.sin((angulo * Math.PI) / 180)
    ];

    const [x1, y1] = pontoExterno(anguloInicial);
    const [x2, y2] = pontoExterno(anguloFinal);

    return `
      <path d="M ${x1} ${y1} A ${raio} ${raio} 0 ${grandeArco} 1 ${x2} ${y2}"
            fill="none" stroke="${cor}" stroke-width="${raio - raioInterno}">
        <title>${item.label}: ${formatarMoeda(item.valor)} (${Math.round(fracao * 100)}%)</title>
      </path>
    `;
  }).join("");

  const legenda = dados.map((item, indice) => {
    const cor = item.cor || PALETA_CATEGORIAS[indice % PALETA_CATEGORIAS.length];
    const percentual = Math.round((item.valor / total) * 100);
    return `
      <div class="legenda-item">
        <span class="legenda-item__cor" style="background:${cor}"></span>
        <span class="legenda-item__label">${item.label}</span>
        <span class="legenda-item__valor numero">${percentual}%</span>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="grafico-donut">
      <svg viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="Gráfico de despesas por categoria">
        ${fatias}
      </svg>
      <div class="legenda">${legenda}</div>
    </div>
  `;
}
