(() => {
  const nav = document.querySelector('.nav-paginas');
  if (!nav || nav.dataset.sidebarPronta === 'true') return;
  nav.dataset.sidebarPronta = 'true';

  const icones = {
    'dashboard.html': `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.6"></rect>
        <rect x="14" y="3" width="7" height="4.5" rx="1.6"></rect>
        <rect x="14" y="10.5" width="7" height="10.5" rx="1.6"></rect>
        <rect x="3" y="13" width="7" height="8" rx="1.6"></rect>
      </svg>`,
    'receitas.html': `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 18h16"></path>
        <path d="m6 15 4-4 3 3 5-6"></path>
        <path d="M18 8h0.01"></path>
        <path d="M18 4v4h-4"></path>
      </svg>`,
    'despesas.html': `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 18h16"></path>
        <path d="m6 8 4 4 3-3 5 6"></path>
        <path d="M18 16h0.01"></path>
        <path d="M18 20v-4h-4"></path>
      </svg>`,
    'cartoes.html': `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5"></rect>
        <path d="M3 10h18"></path>
        <path d="M7 15h4"></path>
        <path d="M16 15h2"></path>
      </svg>`,
    'calendario.html': `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2.5"></rect>
        <path d="M8 3v4M16 3v4M3 10h18"></path>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01"></path>
      </svg>`,
    'metas.html': `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5"></circle>
        <circle cx="12" cy="12" r="4.4"></circle>
        <path d="m15.8 8.2 2.2-2.2"></path>
        <path d="M17.2 8.2H18V9"></path>
      </svg>`,
    'relatorios.html': `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20V11"></path>
        <path d="M10 20V4"></path>
        <path d="M16 20v-6"></path>
        <path d="M22 20H2"></path>
      </svg>`,
    'configuracoes.html': `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2"></circle>
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.1.38.3.73.6 1 .3.28.68.4 1.1.4H21v4h-.09c-.42 0-.8.12-1.1.4-.3.27-.5.62-.41 1.2Z"></path>
      </svg>`
  };

  const marca = document.createElement('div');
  marca.className = 'sidebar-marca';
  marca.innerHTML = `
    <a href="dashboard.html" class="sidebar-marca__link" aria-label="Fluxo — início">
      <img src="../assets/fluxo-icon.png" alt="">
      <span>Fluxo</span>
    </a>
    <button type="button" class="sidebar-alternar" aria-label="Expandir menu" aria-expanded="false" title="Expandir menu">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"></path></svg>
    </button>`;
  nav.prepend(marca);

  nav.querySelectorAll(':scope > a').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    const rotulo = link.textContent.trim();
    link.dataset.rotulo = rotulo;
    link.setAttribute('aria-label', rotulo);
    link.innerHTML = `<span class="nav-icone">${icones[href] || icones['dashboard.html']}</span><span class="nav-rotulo">${rotulo}</span>`;
  });

  const chave = 'fluxo-sidebar-expandida';
  const alternar = marca.querySelector('.sidebar-alternar');

  function aplicar(expandida, salvar = false) {
    document.body.classList.toggle('sidebar-expandida', expandida);
    nav.classList.toggle('nav-paginas--expandida', expandida);
    alternar.setAttribute('aria-expanded', String(expandida));
    alternar.setAttribute('aria-label', expandida ? 'Recolher menu' : 'Expandir menu');
    alternar.title = expandida ? 'Recolher menu' : 'Expandir menu';
    if (salvar) localStorage.setItem(chave, expandida ? '1' : '0');
  }

  let expandida = false;
  try { expandida = localStorage.getItem(chave) === '1'; } catch (_) {}
  aplicar(expandida);

  alternar.addEventListener('click', () => aplicar(!nav.classList.contains('nav-paginas--expandida'), true));

  const mq = window.matchMedia('(max-width: 760px)');
  const ajustarMobile = () => {
    if (mq.matches && nav.classList.contains('nav-paginas--expandida')) {
      document.body.classList.add('sidebar-mobile-sobreposta');
    } else {
      document.body.classList.remove('sidebar-mobile-sobreposta');
    }
  };
  ajustarMobile();
  mq.addEventListener?.('change', ajustarMobile);
  alternar.addEventListener('click', ajustarMobile);
})();
