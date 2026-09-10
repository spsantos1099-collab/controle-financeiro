/* ==========================================================================
   APP.JS
   Comportamentos globais: proteção das páginas, sincronização da preferência
   de tema e toasts. O tema inicial é aplicado por theme-init.js antes do CSS.
   ========================================================================== */

import { observarUsuario, sair, buscarUmaVez } from "./firebase.js";

function nomeCompletoPerfil(perfil, usuario) {
  const nomeExibicao = String(perfil?.nomeExibicao || "").trim();
  if (nomeExibicao) return nomeExibicao;
  const nomeCompleto = [perfil?.nome, perfil?.sobrenome].filter(Boolean).join(" ").trim();
  return nomeCompleto || usuario?.displayName || usuario?.email || "Minha conta";
}

function iniciaisPerfil(perfil, usuario) {
  const nome = nomeCompletoPerfil(perfil, usuario);
  const partes = nome.split(/\s+/).filter(Boolean);
  return (partes.length > 1 ? `${partes[0][0]}${partes[partes.length - 1][0]}` : nome.slice(0, 2)).toUpperCase();
}

async function carregarIdentidadeDoPerfil(usuario) {
  if (!usuario) return;
  let perfil = {};
  try {
    perfil = await buscarUmaVez(usuario.uid, "perfil/principal");
  } catch (_) {}

  const resumo = nomeCompletoPerfil(perfil, usuario);
  document.querySelectorAll("[data-usuario-resumo]").forEach((elemento) => {
    elemento.textContent = `Olá, ${resumo}`;
  });
  document.querySelectorAll("[data-usuario-iniciais]").forEach((elemento) => {
    elemento.textContent = iniciaisPerfil(perfil, usuario);
  });
  document.querySelectorAll("[data-usuario-nome-menu]").forEach((elemento) => {
    elemento.textContent = resumo;
  });
}

async function sincronizarTemaDoPerfil(usuario) {
  if (!usuario || !window.ControleTema) return;

  try {
    const preferencias = await buscarUmaVez(usuario.uid, "configuracoes/preferencias");
    const tema = preferencias?.tema;
    if (["sistema", "claro", "escuro"].includes(tema)) {
      window.ControleTema.aplicarPreferencia(tema, true);
    }
  } catch (_) {
    // A preferência local continua funcionando mesmo se a rede estiver fora.
  }
}


function inserirMarcaSistema() {
  const main = document.querySelector("main");
  const topo = main?.querySelector(".topo-app");
  if (!main || !topo || main.querySelector(".marca-sistema")) return;

  const raiz = document.body.dataset.raiz || "";
  const marca = document.createElement("a");
  marca.className = "marca-sistema";
  marca.href = `${raiz}pages/dashboard.html`;
  marca.setAttribute("aria-label", "Fluxo — Controle financeiro pessoal");
  marca.innerHTML = `
    <img src="${raiz}assets/fluxo-icon.png" alt="">
    <span><strong>Fluxo</strong><small>Controle financeiro pessoal</small></span>`;
  main.insertBefore(marca, topo);
}


function configurarMenuDaConta() {
  const container = document.querySelector(".topo-app__usuario");
  if (!container || container.dataset.menuContaPronto === "true") return;

  container.dataset.menuContaPronto = "true";
  const raiz = document.body.dataset.raiz || "";

  container.innerHTML = `
    <div class="menu-conta">
      <button type="button" class="menu-conta__gatilho" aria-haspopup="true" aria-expanded="false">
        <strong data-usuario-resumo>Olá, Minha conta</strong>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"></path></svg>
      </button>
      <div class="menu-conta__painel" hidden>
        <div class="menu-conta__cabecalho">
          <span class="menu-conta__avatar" data-usuario-iniciais>MC</span>
          <div class="menu-conta__identidade">
            <strong data-usuario-nome-menu>Minha conta</strong>
            <span data-usuario-email></span>
          </div>
        </div>
        <div class="menu-conta__separador" aria-hidden="true"></div>
        <a class="menu-conta__acao" href="${raiz}pages/configuracoes.html">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"></circle><path d="M5.5 20a6.5 6.5 0 0 1 13 0"></path></svg>
          <span>Perfil e configurações</span>
        </a>
        <button data-sair class="menu-conta__acao menu-conta__acao--sair" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5"></path><path d="M14 8l4 4-4 4"></path><path d="M18 12H9"></path></svg>
          <span>Sair</span>
        </button>
      </div>
    </div>`;

  const gatilho = container.querySelector(".menu-conta__gatilho");
  const painel = container.querySelector(".menu-conta__painel");

  const fechar = () => {
    painel.hidden = true;
    gatilho.setAttribute("aria-expanded", "false");
    container.classList.remove("menu-conta-aberto");
  };

  const abrir = () => {
    painel.hidden = false;
    gatilho.setAttribute("aria-expanded", "true");
    container.classList.add("menu-conta-aberto");
  };

  gatilho.addEventListener("click", (evento) => {
    evento.stopPropagation();
    if (painel.hidden) abrir(); else fechar();
  });

  painel.addEventListener("click", (evento) => evento.stopPropagation());
  document.addEventListener("click", fechar);
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !painel.hidden) {
      fechar();
      gatilho.focus();
    }
  });
}

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
      elemento.textContent = usuario.email || "";
    });
    document.querySelectorAll("[data-usuario-resumo]").forEach((elemento) => {
      const nomeInicial = usuario.displayName || usuario.email || "Minha conta";
      elemento.textContent = `Olá, ${nomeInicial}`;
    });
    document.querySelectorAll("[data-usuario-nome-menu]").forEach((elemento) => {
      elemento.textContent = usuario.displayName || usuario.email || "Minha conta";
    });

    sincronizarTemaDoPerfil(usuario);
    carregarIdentidadeDoPerfil(usuario);
  });

  const botaoSair = document.querySelector("[data-sair]");
  if (botaoSair) {
    botaoSair.addEventListener("click", async () => {
      await sair();
      window.location.href = `${raiz}index.html`;
    });
  }
}

function iniciarAplicacao() {
  inserirMarcaSistema();
  configurarMenuDaConta();
  protegerPaginaSeNecessario();
  document.documentElement.classList.add("app-iniciada");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarAplicacao, { once: true });
} else {
  iniciarAplicacao();
}

/* --------------------------------------------------------------------
   TOASTS
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
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}
