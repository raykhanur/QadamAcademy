// Qadam Academy - Shared UI helpers

const UI = (() => {

  function renderShell(user) {
    const selected = Storage.getSelectedSubjects();
    // Filter SUBJECTS to only show selected ones
    const visibleSubjects = (typeof SUBJECTS !== 'undefined')
      ? SUBJECTS.filter(s => selected.includes(s.id))
      : [];

    document.body.innerHTML = `
      <div class="app-layout">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-header">
            <div class="logo">
              <span class="logo-icon">🎓</span>
              <span class="logo-text">Qadam<br><small>Academy</small></span>
            </div>
            <button class="sidebar-toggle" id="sidebarToggle" aria-label="Мәзірді жабу">✕</button>
          </div>

          <nav class="sidebar-nav">
            <a href="#home" class="nav-item" data-page="home">
              <span class="nav-icon">🏠</span>
              <span class="nav-label">Басты бет</span>
            </a>
            <a href="#dashboard" class="nav-item" data-page="dashboard">
              <span class="nav-icon">📊</span>
              <span class="nav-label">Менің үлгерімім</span>
            </a>
            <a href="#subjects" class="nav-item" data-page="subjects">
              <span class="nav-icon">📚</span>
              <span class="nav-label">Пәндер</span>
            </a>
          </nav>

          <div class="sidebar-subjects">
            <p class="sidebar-section-label">Менің пәндерім</p>
            ${visibleSubjects.map(s => `
              <a href="#subject/${s.id}" class="nav-item nav-subject" data-page="subject">
                <span class="nav-icon">${s.icon}</span>
                <span class="nav-label">${s.name}</span>
              </a>
            `).join('')}
            <a href="#subject-settings" class="nav-item nav-settings" data-page="subject-settings">
              <span class="nav-icon">⚙️</span>
              <span class="nav-label">Пәндерді өзгерту</span>
            </a>
          </div>

          <div class="sidebar-footer">
            <div class="user-card">
              <span class="user-avatar">${user.avatar}</span>
              <div class="user-info">
                <span class="user-name">${user.name}</span>
                <span class="user-grade">${user.grade}</span>
              </div>
              <button class="logout-btn" id="logoutBtn" title="Шығу">↩</button>
            </div>
          </div>
        </aside>

        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <div class="main-wrapper">
          <header class="topbar">
            <button class="menu-btn" id="menuBtn" aria-label="Мәзір">☰</button>
            <div class="topbar-title" id="topbarTitle">Qadam Academy</div>
            <div class="topbar-actions">
              <span class="user-avatar-sm">${user.avatar}</span>
            </div>
          </header>
          <main class="main-content" id="mainContent">
            <div class="page-loading"><div class="spinner"></div></div>
          </main>
        </div>
      </div>
    `;

    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn= document.getElementById('sidebarToggle');
    const openSidebar  = () => { sidebar.classList.add('open');    overlay.classList.add('active'); };
    const closeSidebar = () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); };
    menuBtn.addEventListener('click', openSidebar);
    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      if (confirm('Аккаунттан шығасыз ба?')) {
        Storage.logout();
        window.location.reload();
      }
    });

    // Active nav
    window.addEventListener('hashchange', updateActiveNav);
    updateActiveNav();
  }

  function updateActiveNav() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const page = hash.split('/')[0] || 'home';
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
  }

  function setTitle(title) {
    const el = document.getElementById('topbarTitle');
    if (el) el.textContent = title;
    document.title = `${title} | Qadam Academy`;
  }

  function setContent(html) {
    const main = document.getElementById('mainContent');
    if (main) { main.innerHTML = html; main.scrollTop = 0; }
  }

  function scoreColor(pct) {
    if (pct >= 80) return 'green';
    if (pct >= 50) return 'orange';
    return 'red';
  }

  function scoreLabel(pct) {
    if (pct >= 90) return 'Өте жақсы! 🌟';
    if (pct >= 75) return 'Жақсы! 👍';
    if (pct >= 50) return 'Орташа 📖';
    return 'Жаттығу керек 💪';
  }

  function animateCount(el, end, suffix = '') {
    if (!el) return;
    let start = 0;
    const step = Math.ceil(end / 30) || 1;
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      el.textContent = start + suffix;
      if (start >= end) clearInterval(timer);
    }, 30);
  }

  return { renderShell, setTitle, setContent, updateActiveNav, scoreColor, scoreLabel, animateCount };
})();
