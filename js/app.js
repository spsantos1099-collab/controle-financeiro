/* ==========================================================================
   APP.JS
   Ponto de entrada geral da aplicação: controle de tema (claro/escuro),
   proteção de páginas (exige login) e inicialização de listeners globais.
   ========================================================================== */

import { observarUsuario, sair } from "./firebase.js";

const CHAVE_TEMA = "controleFinanceiro:tema";

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  localStorage.setItem(CHAVE_TEMA, tema);
}

function alternarTema() {
  const temaAtual = document.documentElement.getAttribute("data-tema") || "claro";
  aplicarTema(temaAtual === "claro" ? "escuro" : "claro");
}

function iniciarTema() {
  const temaSalvo = localStorage.getItem(CHAVE_TEMA);
  const preferSistemaEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
  aplicarTema(temaSalvo || (preferSistemaEscuro ? "escuro" : "claro"));
}

/* --------------------------------------------------------------------
   PROTEÇÃO DE PÁGINAS
   Toda página interna (dashboard, receitas, despesas...) tem no <body>:
     <body data-protegida="true" data-raiz="../">
   Se ninguém estiver logado, o usuário é mandado de volta para o login.
   Se estiver logado, o e-mail dele é exibido em qualquer elemento com
   o atributo [data-usuario-email], e o botão [data-sair] faz logout.
   -------------------------------------------------------------------- */
function protegerPaginaSeNecessario() {
  const paginaProtegida = document.body.dataset.protegida === "true";
  if (!paginaProtegida) return;

  const raiz = document.body.dataset.raiz || "";

  observarUsuario((usuario) => {
    if (!usuario) {
      window.location.href = `${raiz}index.html`;
      return;
    }

    document.querySelectorAll("[data-usuario-email]").forEach((elemento) => {
      elemento.textContent = usuario.email;
    });
  });

  const botaoSair = document.querySelector("[data-sair]");
  if (botaoSair) {
    botaoSair.addEventListener("click", async () => {
      await sair();
      window.location.href = `${raiz}index.html`;
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarTema();
  protegerPaginaSeNecessario();

  const botaoTema = document.querySelector("[data-alterna-tema]");
  if (botaoTema) {
    botaoTema.addEventListener("click", alternarTema);
  }
});

/* --------------------------------------------------------------------
   TOASTS (avisos de sucesso/erro no canto da tela)
   Uso: mostrarToast("Receita salva com sucesso!", "sucesso")
   -------------------------------------------------------------------- */
export function mostrarToast(mensagem, tipo = "sucesso") {
  let container = document.getElementById("containerToasts");
  if (!container) {
    container = document.createElement("div");
    container.id = "containerToasts";
    container.className = "container-toasts";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast--${tipo}`;
  toast.textContent = mensagem;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visivel"));

  setTimeout(() => {
    toast.classList.remove("toast--visivel");
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}
