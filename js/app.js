/* ==========================================================================
   APP.JS
   Comportamentos globais: proteção das páginas, sincronização da preferência
   de tema e toasts. O tema inicial é aplicado por theme-init.js antes do CSS.
   ========================================================================== */

import { observarUsuario, sair, buscarUmaVez } from "./firebase.js";

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

    sincronizarTemaDoPerfil(usuario);
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
