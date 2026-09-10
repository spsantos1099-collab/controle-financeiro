(() => {
  const nav = document.querySelector('.nav-paginas');
  if (!nav || nav.dataset.sidebarPronta === 'true') return;
  nav.dataset.sidebarPronta = 'true';

  // A navegação é identificada primeiro pelo texto visível do item.
  // Isso evita depender do href, porque a Netlify pode reescrever
  // "receitas.html" como "/pages/receitas" ao publicar Pretty URLs.
  const icones = {
    dashboard: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.6"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1.6"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1.6"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1.6"></rect>
        <rect class="nav-acento" x="3" y="3" width="7" height="7" rx="1.6"></rect>
      </svg>`,

    receitas: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect class="nav-acento nav-acento--suave" x="4" y="15" width="3" height="5" rx="1"></rect>
        <rect class="nav-acento nav-acento--suave" x="10.5" y="12" width="3" height="8" rx="1"></rect>
        <rect class="nav-acento" x="17" y="8.5" width="3" height="11.5" rx="1"></rect>
        <path d="m4.5 13 5-5 3.5 3.5L20 4.5"></path>
        <path d="M15.5 4.5H20V9"></path>
      </svg>`,

    despesas: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.5 3.5H14l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z"></path>
        <path d="M14 3.5V8h4"></path>
        <path d="M9 11h5M9 14h4"></path>
        <circle class="nav-acento nav-acento--suave" cx="17.2" cy="17.2" r="4.2"></circle>
        <path d="M17.2 14.8v4.6M15.3 17.6l1.9 1.9 1.9-1.9"></path>
      </svg>`,

    cartoes: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5"></rect>
        <path d="M3 9.5h18"></path>
        <rect class="nav-acento" x="6" y="13" width="4" height="2.8" rx=".7"></rect>
        <path d="M13.5 14.4H18"></path>
      </svg>`,

    calendario: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2.5"></rect>
        <path d="M8 3v4M16 3v4M3 10h18"></path>
        <rect class="nav-acento" x="14.5" y="13.5" width="3.2" height="3.2" rx=".8"></rect>
        <path d="M7.5 14h.01M11 14h.01M7.5 17.5h.01M11 17.5h.01"></path>
      </svg>`,

    metas: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.5" cy="13" r="7.5"></circle>
        <circle cx="10.5" cy="13" r="3.8"></circle>
        <circle class="nav-acento" cx="10.5" cy="13" r="1.6"></circle>
        <path d="M15 3.5v8"></path>
        <path class="nav-acento-stroke" d="M15 4h5l-1.5 2L20 8h-5"></path>
      </svg>`,

    relatorios: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="13" width="4" height="7" rx="1"></rect>
        <rect x="10" y="9" width="4" height="11" rx="1"></rect>
        <rect class="nav-acento" x="16" y="4" width="4" height="16" rx="1"></rect>
        <path d="M3 20.5h18"></path>
      </svg>`,

    configuracoes: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16"></path>
        <circle cx="9" cy="6" r="2"></circle>
        <circle class="nav-acento" cx="15" cy="12" r="2"></circle>
        <circle cx="11" cy="18" r="2"></circle>
      </svg>`
  };

  function normalizar(valor = '') {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\.html$/i, '')
      .replace(/[^a-z0-9-]/g, '');
  }

  function chaveDoLink(link, rotulo) {
    // 1) O rótulo é estável e não é alterado pela Netlify.
    const porRotulo = normalizar(rotulo);
    if (icones[porRotulo]) return porRotulo;

    // 2) Fallback para href, funcionando com ou sem .html e com caminho absoluto.
    const hrefCompleto = (link.getAttribute('href') || '').split('?')[0].split('#')[0];
    const ultimoTrecho = hrefCompleto.split('/').filter(Boolean).pop() || '';
    const porHref = normalizar(ultimoTrecho);
    if (icones[porHref]) return porHref;

    return null;
  }

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
    const rotulo = link.textContent.trim();
    const chaveIcone = chaveDoLink(link, rotulo);

    link.dataset.rotulo = rotulo;
    link.setAttribute('aria-label', rotulo);

    // Não usamos mais um ícone genérico como fallback: cada item precisa ter
    // sua própria chave válida. Se algum item futuro não tiver ícone, o texto
    // continua acessível quando a barra for expandida.
    const svg = chaveIcone ? icones[chaveIcone] : '';
    link.innerHTML = `<span class="nav-icone">${svg}</span><span class="nav-rotulo">${rotulo}</span>`;
  });

  const chave = 'fluxo-sidebar-expandida';
  const alternar = marca.querySelector('.sidebar-alternar');

  function aplicar(expandida, salvar = false) {
    document.body.classList.toggle('sidebar-expandida', expandida);
    nav.classList.toggle('nav-paginas--expandida', expandida);
    alternar.setAttribute('aria-expanded', String(expandida));
    alternar.setAttribute('aria-label', expandida ? 'Recolher menu' : 'Expandir menu');
    alternar.title = expandida ? 'Recolher menu' : 'Expandir menu';
    if (salvar) {
      try { localStorage.setItem(chave, expandida ? '1' : '0'); } catch (_) {}
    }
  }

  let expandida = false;
  try { expandida = localStorage.getItem(chave) === '1'; } catch (_) {}
  aplicar(expandida);

  alternar.addEventListener('click', () => aplicar(!nav.classList.contains('nav-paginas--expandida'), true));

  const mq = window.matchMedia('(max-width: 760px)');
  const ajustarMobile = () => {
    document.body.classList.toggle(
      'sidebar-mobile-sobreposta',
      mq.matches && nav.classList.contains('nav-paginas--expandida')
    );
  };
  ajustarMobile();
  mq.addEventListener?.('change', ajustarMobile);
  alternar.addEventListener('click', ajustarMobile);
})();
