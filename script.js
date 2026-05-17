/* Analyst Den — main script.js */

/* === PAGE TRANSITION LINKS === */
document.addEventListener('DOMContentLoaded', () => {

  /* Intercept internal links for smooth page transitions */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || link.hasAttribute('download')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      document.body.style.animation = 'pageOut 0.22s ease forwards';
      setTimeout(() => { window.location.href = href; }, 210);
    });
  });

  /* === MOBILE MENU === */
  const toggle = document.querySelector('.menu-toggle');
  const menu   = document.querySelector('.mobile-menu');
  const close  = document.querySelector('.close-menu');
  if (toggle && menu && close) {
    toggle.onclick = () => menu.classList.add('open');
    close.onclick  = () => menu.classList.remove('open');
    document.addEventListener('click', e => {
      if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== toggle) {
        menu.classList.remove('open');
      }
    });
  }

  /* === TYPING EFFECT (index only) === */
  const typingEl = document.getElementById('typing-text');
  if (typingEl) {
    const texts = ['Into Real-World Impact', 'Into Actionable Decisions', 'Into Practical Solutions'];
    let ti = 0, ci = 0;
    function type() {
      if (ci < texts[ti].length) {
        typingEl.textContent += texts[ti][ci++];
        setTimeout(type, 72);
      } else {
        setTimeout(() => { typingEl.textContent = ''; ci = 0; ti = (ti+1)%texts.length; type(); }, 1600);
      }
    }
    type();
  }

  /* === PROJECT FILTER + PAGINATION (index & pjt) === */
  const catBtns    = document.querySelectorAll('.categories button, .projects-categories button');
  const projCards  = Array.from(document.querySelectorAll('.project-card'));
  const pagEl      = document.querySelector('.pagination');

  if (catBtns.length && projCards.length) {
    const pagBtns = pagEl ? pagEl.querySelectorAll('button') : [];
    const PER_PAGE = 6;
    let page = 1, catFilter = 'all', statusFilter = null, contribOnly = false, sortOrder = null;

    const statusBtns   = document.querySelectorAll('.projects-status-filters button');
    const contribToggle = document.getElementById('filter-contributors');
    const sortSelect   = document.getElementById('projects-sort-select');

    function filtered() {
      return projCards.filter(c => {
        const cat = c.dataset.category?.toLowerCase() || '';
        const status = c.dataset.status?.toLowerCase() || '';
        const contrib = c.dataset.contributors || '';
        if (catFilter !== 'all' && !cat.includes(catFilter)) return false;
        if (statusFilter && status !== statusFilter) return false;
        if (contribOnly && contrib !== 'yes') return false;
        return true;
      });
    }

    function render() {
      let cards = filtered();
      if (sortOrder) {
        cards = [...cards].sort((a, b) => {
          const d1 = new Date(a.dataset.date || 0);
          const d2 = new Date(b.dataset.date || 0);
          return sortOrder === 'Newest' ? d2 - d1 : d1 - d2;
        });
      }
      const total = Math.ceil(cards.length / PER_PAGE);
      if (page > total) page = Math.max(1, total);
      projCards.forEach(c => c.style.display = 'none');
      const start = (page-1)*PER_PAGE;
      cards.slice(start, start+PER_PAGE).forEach(c => { c.style.display = 'flex'; c.style.flexDirection = 'column'; });
      if (pagEl) pagEl.style.display = cards.length > PER_PAGE ? 'flex' : 'none';
      pagBtns.forEach(b => {
        b.classList.remove('active');
        if (+b.dataset.page === page) b.classList.add('active');
      });
    }

    catBtns.forEach(b => b.onclick = () => {
      catBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      catFilter = (b.dataset.filter || b.dataset.categoryFilter || 'all').toLowerCase();
      page = 1; render();
    });

    statusBtns.forEach(b => b.onclick = () => {
      const same = b.classList.contains('active');
      statusBtns.forEach(x => x.classList.remove('active'));
      statusFilter = same ? null : (b.dataset.statusFilter || null);
      if (!same) b.classList.add('active');
      page = 1; render();
    });

    if (contribToggle) contribToggle.onchange = () => { contribOnly = contribToggle.checked; page = 1; render(); };
    if (sortSelect) sortSelect.onchange = () => { sortOrder = sortSelect.value; render(); };

    pagBtns.forEach(b => b.onclick = () => {
      const tot = Math.ceil(filtered().length / PER_PAGE);
      if (b.dataset.page === 'next' && page < tot) page++;
      else if (b.dataset.page === 'prev' && page > 1) page--;
      else if (!isNaN(b.dataset.page)) page = +b.dataset.page;
      render();
    });

    render();
  }

  /* === CONTRIBUTOR SEARCH + SORT === */
  const searchInput = document.getElementById('contributor-search');
  const sortSel     = document.getElementById('contributor-sort');
  const cGrid       = document.getElementById('contributorGrid');

  if (searchInput && cGrid) {
    const cCards = Array.from(cGrid.querySelectorAll('.contributor-card'));
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      cCards.forEach(c => {
        const name = c.querySelector('h3')?.textContent.toLowerCase() || '';
        c.style.display = name.includes(q) ? '' : 'none';
      });
    });
    if (sortSel) {
      sortSel.onchange = () => {
        const sorted = [...cCards].sort((a,b) => {
          const d1 = new Date(a.dataset.date||0), d2 = new Date(b.dataset.date||0);
          return sortSel.value === 'newest' ? d2-d1 : d1-d2;
        });
        sorted.forEach(c => cGrid.appendChild(c));
      };
    }
  }

  /* === TEAM TOGGLE === */
  const teamGrid = document.querySelector('.team-grid');
  const teamCards = teamGrid ? teamGrid.querySelectorAll('.team-card') : [];
  if (teamCards.length > 4) {
    const btn = document.createElement('button');
    btn.className = 'btn secondary';
    btn.textContent = 'View all contributors';
    const wrap = document.createElement('div');
    wrap.className = 'team-toggle';
    wrap.appendChild(btn);
    teamGrid.parentElement.appendChild(wrap);
    btn.addEventListener('click', () => {
      teamGrid.classList.toggle('show-all');
      btn.textContent = teamGrid.classList.contains('show-all') ? 'Show fewer' : 'View all contributors';
    });
  }

  /* === COUNTDOWN (project detail) === */
  const cdEl = document.getElementById('countdown-timer');
  if (cdEl) {
    const target = new Date(); target.setMonth(target.getMonth()+1); target.setDate(1); target.setHours(0,0,0,0);
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) { cdEl.textContent = 'Starting today'; return; }
      const d = Math.floor(diff/86400000), h = Math.floor(diff/3600000)%24, m = Math.floor(diff/60000)%60;
      cdEl.textContent = d+'d '+h+'h '+m+'m';
    }
    tick(); setInterval(tick, 60000);
  }

  /* === CONTACT FORM (simple feedback) === */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'Message sent ✓';
      btn.disabled = true;
      setTimeout(() => { contactForm.reset(); btn.textContent = 'Send Message'; btn.disabled = false; }, 3000);
    });
  }

  /* === NOTIFY FORM === */
  document.querySelectorAll('.notify-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button');
      btn.textContent = 'Thanks! ✓';
      btn.disabled = true;
    });
  });

});

/* pageOut keyframe injected via JS so CSS file doesn't need it */
const st = document.createElement('style');
st.textContent = '@keyframes pageOut { to { opacity:0; transform:translateY(-8px); } }';
document.head.appendChild(st);
