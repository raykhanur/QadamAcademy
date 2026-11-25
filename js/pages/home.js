// Qadam Academy - Home / Landing Page

function renderHome() {
  UI.setTitle('Басты бет');

  // Compute totals dynamically from data
  const totalSubjects = SUBJECTS.length;
  const totalLessons  = Object.values(LESSONS).reduce((s,arr) => s + arr.length, 0);
  const totalTests    = Object.values(TESTS).reduce((s,arr) => s + arr.length, 0);

  // Build subject icons for the hero visual
  const heroCards = SUBJECTS.slice(0, 6).map((s, i) => `
    <div class="floating-card card-${i+1}">${s.icon} ${s.name}</div>
  `).join('');

  UI.setContent(`
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">🇰🇿 ҰБТ-ға дайындық</div>
        <h1 class="hero-title">Qadam Academy-мен<br><span class="gradient-text">ҰБТ-ға дайын бол!</span></h1>
        <p class="hero-desc">
          ${totalSubjects} пән бойынша интерактивті сабақтар мен тесттер арқылы
          ҰБТ-ға толық дайындал.
        </p>
        <div class="hero-actions">
          <a href="#subjects" class="btn btn-primary btn-lg">Оқуды бастау →</a>
          <a href="#dashboard" class="btn btn-outline btn-lg">Менің үлгерімім</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-num">${totalTests}</span>
            <span class="hero-stat-label">Тест</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-num">${totalLessons}</span>
            <span class="hero-stat-label">Сабақ</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-num">${totalSubjects}</span>
            <span class="hero-stat-label">Пән</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-card-stack">${heroCards}</div>
      </div>
    </section>

    <section class="benefits-section">
      <h2 class="section-title">Неліктен Qadam Academy?</h2>
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">🎯</div>
          <h3>ҰБТ бағдарламасы</h3>
          <p>Мазмұн толығымен ҰБТ бағдарламасына сәйкестендірілген</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">📊</div>
          <h3>Прогресс бақылауы</h3>
          <p>Әрбір тест нәтижесі сақталып, үлгерімің бақыланады</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">💡</div>
          <h3>Жеке ұсыныстар</h3>
          <p>Қате жауаптарға негізделген жеке оқу ұсыныстары</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">📱</div>
          <h3>Мобильді нұсқа</h3>
          <p>Кез-келген құрылғыдан оқуға ыңғайлы интерфейс</p>
        </div>
      </div>
    </section>

    <section class="subjects-preview">
      <div class="section-header">
        <h2 class="section-title">Пәндер каталогы</h2>
        <a href="#subjects" class="btn btn-outline">Барлығын көру</a>
      </div>
      <div class="subjects-grid">
        ${SUBJECTS.map((s) => renderSubjectCard(s)).join('')}
      </div>
    </section>
  `);
}

function renderSubjectCard(subject) {
  const lessons  = LESSONS[subject.id] || [];
  const tests    = TESTS[subject.id]   || [];
  const completedLessons = Storage.getCompletedLessons();
  const doneCount = lessons.filter(l => completedLessons.includes(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((doneCount / lessons.length) * 100) : 0;

  return `
    <a href="#subject/${subject.id}" class="subject-card" style="--subject-color: ${subject.color}">
      <div class="subject-card-icon">${subject.icon}</div>
      <div class="subject-card-body">
        <h3 class="subject-card-title">${subject.name}</h3>
        <p class="subject-card-desc">${subject.description}</p>
        <div class="subject-card-meta">
          <span>📖 ${lessons.length} сабақ</span>
          <span>✅ ${tests.length} тест</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
        <span class="progress-label">${pct}% аяқталды</span>
      </div>
      <div class="subject-card-arrow">→</div>
    </a>
  `;
}
