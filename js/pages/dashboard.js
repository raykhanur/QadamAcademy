// Qadam Academy - Student Dashboard

function renderDashboard() {
  UI.setTitle('Менің үлгерімім');
  const user    = Storage.getUser();
  const stats   = Storage.getOverallStats();
  const results = Storage.getTestResults();

  // Compute total possible tests from actual data
  const totalPossibleTests = Object.values(TESTS).reduce((s, arr) => s + arr.length, 0);

  UI.setContent(`
    <div class="dashboard-layout">

      <!-- Profile card -->
      <div class="profile-card">
        <div class="profile-avatar">${user.avatar}</div>
        <div class="profile-info">
          <h1 class="profile-name">${user.name}</h1>
          <p class="profile-grade">${user.grade}</p>
          <p class="profile-school">${user.school}</p>
        </div>
        <div class="profile-stats">
          <div class="profile-stat">
            <span class="profile-stat-num" id="statLessons">0</span>
            <span class="profile-stat-label">Сабақ</span>
          </div>
          <div class="profile-stat">
            <span class="profile-stat-num" id="statTests">0</span>
            <span class="profile-stat-label">Тест</span>
          </div>
          <div class="profile-stat">
            <span class="profile-stat-num" id="statScore">0</span>
            <span class="profile-stat-label">Орт. балл %</span>
          </div>
          <div class="profile-stat">
            <span class="profile-stat-num" id="statDays">0</span>
            <span class="profile-stat-label">Оқу күндері</span>
          </div>
        </div>
      </div>

      <!-- Overall progress bar -->
      <div class="dash-section">
        <div class="overall-progress-card">
          <div class="overall-progress-label">
            <span>Жалпы үлгерім</span>
            <strong>${stats.testsCompleted} / ${totalPossibleTests} тест аяқталды</strong>
          </div>
          <div class="progress-bar progress-bar-lg">
            <div class="progress-fill" style="width: ${totalPossibleTests > 0 ? Math.round(stats.testsCompleted/totalPossibleTests*100) : 0}%"></div>
          </div>
        </div>
      </div>

      <!-- Subject progress cards -->
      <div class="dash-section">
        <h2 class="section-heading">📚 Пәндер бойынша үлгерім</h2>
        <div class="dash-subjects-grid">
          ${SUBJECTS.map((s) => renderDashSubjectCard(s)).join('')}
        </div>
      </div>

      <!-- Recent tests -->
      <div class="dash-section">
        <h2 class="section-heading">🏆 Соңғы тесттер</h2>
        ${results.length === 0
          ? '<div class="empty-state">Әзірге тест тапсырылмады. <a href="#subjects">Бастау →</a></div>'
          : `<div class="results-list">
              ${results.slice().reverse().slice(0, 8).map((r) => renderResultRow(r)).join('')}
            </div>`
        }
      </div>

      <!-- Recommendations -->
      <div class="dash-section">
        <h2 class="section-heading">💡 Жеке ұсыныстар</h2>
        ${renderDashRecommendations()}
      </div>
    </div>
  `);

  renderAISection();

  // Animate counters after render
  setTimeout(() => {
    UI.animateCount(document.getElementById('statLessons'), stats.lessonsCompleted);
    UI.animateCount(document.getElementById('statTests'),   stats.testsCompleted);
    UI.animateCount(document.getElementById('statScore'),   stats.avgScore, '%');
    UI.animateCount(document.getElementById('statDays'),    stats.streak);
  }, 100);
}

function renderDashSubjectCard(subject) {
  const progress         = Storage.getSubjectProgress(subject.id);
  const lessons          = LESSONS[subject.id] || [];
  const tests            = TESTS[subject.id]   || [];
  const completedLessons = Storage.getCompletedLessons();
  const doneCount        = lessons.filter((l) => completedLessons.includes(l.id)).length;
  const lessonPct        = lessons.length > 0 ? Math.round((doneCount / lessons.length) * 100) : 0;

  // Count how many of this subject's tests have been taken
  const allResults         = Storage.getTestResults();
  const subjectTestResults = allResults.filter(r => r.subjectId === subject.id);
  const testPct            = tests.length > 0 ? Math.round((subjectTestResults.length / tests.length) * 100) : 0;

  return `
    <div class="dash-subject-card" style="--subject-color: ${subject.color}">
      <div class="dash-subject-top">
        <span class="dash-subject-icon">${subject.icon}</span>
        <div>
          <h3>${subject.name}</h3>
          <span class="best-score ${UI.scoreColor(progress.bestScore || 0)}">
            Үздік: ${progress.bestScore || 0}%
          </span>
        </div>
      </div>

      <div class="dash-subject-bars">
        <div class="bar-row">
          <span class="bar-label">Сабақтар</span>
          <div class="mini-progress">
            <div class="mini-fill" style="width: ${lessonPct}%; background: ${subject.color}"></div>
          </div>
          <span class="bar-val">${doneCount}/${lessons.length}</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">Тесттер</span>
          <div class="mini-progress">
            <div class="mini-fill" style="width: ${testPct}%; background: ${subject.color}"></div>
          </div>
          <span class="bar-val">${subjectTestResults.length}/${tests.length}</span>
        </div>
      </div>

      <a href="#subject/${subject.id}" class="btn btn-sm btn-outline btn-block">Жалғастыру</a>
    </div>
  `;
}

function renderResultRow(result) {
  const pct        = Math.round((result.score / result.total) * 100);
  const colorClass = UI.scoreColor(pct);
  const subject    = SUBJECTS.find((s) => s.id === result.subjectId);
  const date       = new Date(result.timestamp).toLocaleDateString('kk-KZ');

  return `
    <div class="result-row">
      <span class="result-subject-icon">${subject ? subject.icon : '📝'}</span>
      <div class="result-row-info">
        <span class="result-row-title">${result.testTitle}</span>
        <span class="result-row-date">${date}</span>
      </div>
      <span class="result-score score-${colorClass}">${pct}%</span>
      <a href="#test/${result.subjectId}/${result.testId}" class="btn btn-sm btn-outline">Қайта тапсыру</a>
    </div>
  `;
}

function renderDashRecommendations() {
  const results = Storage.getTestResults();

  if (!results.length) {
    return `<div class="rec-card rec-start">
      <span class="rec-icon">🚀</span>
      <div>
        <strong>Оқуды бастаңыз!</strong>
        <p>Тест тапсырғаннан кейін жеке ұсыныстар пайда болады.</p>
        <a href="#subjects" class="btn btn-primary">Пәндерге өту →</a>
      </div>
    </div>`;
  }

  const recs = [];

  SUBJECTS.forEach((s) => {
    const subResults = results.filter((r) => r.subjectId === s.id);
    const subTests   = TESTS[s.id] || [];
    if (!subResults.length && subTests.length > 0) {
      recs.push({
        icon: s.icon,
        title: `${s.name} бойынша тест тапсырыңыз`,
        desc: 'Осы пән бойынша әлі тест тапсырылмады',
        link: `#subject/${s.id}`,
        linkText: 'Бастау',
        type: 'new',
      });
    } else if (subResults.length) {
      const avg = Math.round(
        subResults.reduce((a, r) => a + (r.score / r.total) * 100, 0) / subResults.length
      );
      if (avg < 70) {
        recs.push({
          icon: s.icon,
          title: `${s.name} — жаттығу қажет`,
          desc: `Орташа балл: ${avg}%. Сабақтарды қайталаңыз.`,
          link: `#subject/${s.id}`,
          linkText: 'Оқуды жалғастыру',
          type: 'improve',
        });
      }
    }
  });

  // Top wrong questions
  const wrongMap = {};
  results.forEach((r) => {
    (r.wrongQuestions || []).forEach((q) => {
      const key = q.questionText;
      if (!wrongMap[key]) wrongMap[key] = { ...q, count: 0, subjectId: r.subjectId, testId: r.testId };
      wrongMap[key].count++;
    });
  });

  Object.values(wrongMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .forEach((q) => {
      recs.push({
        icon: '❌',
        title: `Қате берілген сұрақ (${q.count} рет)`,
        desc: `«${q.questionText.substring(0, 70)}...»`,
        explanation: q.explanation,
        link: `#test/${q.subjectId}/${q.testId}`,
        linkText: 'Тестті қайталау',
        type: 'retry',
      });
    });

  if (!recs.length) {
    return `<div class="rec-card rec-perfect">
      <span class="rec-icon">🌟</span>
      <div><strong>Тамаша!</strong><p>Барлық пәндер бойынша жақсы нәтиже көрсетіп жатырсыз!</p></div>
    </div>`;
  }

  return `<div class="recs-grid">
    ${recs.slice(0, 4).map((r) => `
      <div class="rec-card rec-${r.type}">
        <span class="rec-icon">${r.icon}</span>
        <div class="rec-body">
          <strong>${r.title}</strong>
          <p>${r.desc}</p>
          ${r.explanation ? `<p class="rec-hint">💡 ${r.explanation}</p>` : ''}
          <a href="${r.link}" class="btn btn-sm btn-primary">${r.linkText}</a>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// Qadam Academy - AI recommendation integration

function renderAISection() {

  const layout = document.querySelector('.dashboard-layout');
  if (!layout) return;

  const section = document.createElement('div');
  section.className = 'dash-section';

  section.innerHTML = `
    <h2 class="section-heading">🤖 AI ұсыныстары</h2>

    <div class="rec-card">
      <span class="rec-icon">🤖</span>

      <div class="rec-body">
        <strong>Жасанды интеллект көмекшісі</strong>

        <p>Негізгі ұсынысты алгоритм анықтайды. AI эксперименттік режимде жұмыс істейді.</p>

        <p>Ұсыныс қате болуы мүмкін. Жеке деректер AI моделіне жіберілмейді.</p>

        <button id="aiAnalyzeBtn" class="btn btn-primary">
          AI талдау
        </button>

        <div id="aiRecommendationResult"
             style="margin-top:16px">
        </div>
      </div>
    </div>
  `;

  layout.querySelector('.profile-card').after(section);

  document.getElementById('aiAnalyzeBtn')
    .addEventListener('click', loadAIRecommendation);
};

async function loadAIRecommendation() {
  const button = document.getElementById('aiAnalyzeBtn');
  const output = document.getElementById('aiRecommendationResult');

  const results = Storage.getTestResults().filter(r =>
    Number.isInteger(r.score) &&
    Number.isInteger(r.total) &&
    r.total > 0 &&
    r.score >= 0 &&
    r.score <= r.total
  );

  if (!results.length) {
    output.textContent = 'Алдымен тест тапсырыңыз.';
    return;
  }

  const topics = results.map((r, i) => ({
    topic_id: 'topic_' + i,
    correct: r.score,
    total: r.total
  }));

  if (topics.every(t => t.correct === t.total)) {
    output.textContent = 'Тамаша! Барлық жауаптарыңыз дұрыс.';
    return;
  }

  const baseline = [...topics].sort((a, b) =>
    (a.correct / a.total) - (b.correct / b.total) ||
    a.topic_id.localeCompare(b.topic_id)
  )[0];

  button.disabled = true;
  button.textContent = 'Талдау жүргізілуде...';
  output.textContent = 'Нәтижелер өңделуде...';

  let selected = baseline.topic_id;
  let aiPrediction = null;
  let source = 'baseline';

  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topics })
    });

    if (!response.ok) {
      throw new Error('API unavailable');
    }

    const data = await response.json();

    if (topics.some(t => t.topic_id === data.topic_id)) {
      aiPrediction = data.source === 'ai' ? data.topic_id : null;
      selected = baseline.topic_id;
      source = data.source === 'ai' ? 'ai' : 'baseline';
    }

  } catch (error) {
    console.warn('Using baseline:', error);
  }

  const index = topics.findIndex(t => t.topic_id === selected);
  const result = results[index];

  const percent = Math.round(
    result.score / result.total * 100
  );

  output.replaceChildren();

  const title = document.createElement('strong');
  title.textContent = '📊 Алгоритмдік ұсыныс';

  const topic = document.createElement('p');
  topic.textContent = 'Тақырып: ' + result.testTitle;

  const score = document.createElement('p');
  score.textContent = 'Нәтиже: ' + percent + '%';

  const advice = document.createElement('p');
  advice.textContent = 'Осы тақырыпты қайталап, тестті қайта тапсырыңыз.';

  const link = document.createElement('a');
  link.className = 'btn btn-sm btn-primary';
  link.href = '#test/' + result.subjectId + '/' + result.testId;
  link.textContent = 'Тестті қайталау';

  const dismiss = document.createElement('button');
  dismiss.className = 'btn btn-sm btn-outline';
  dismiss.textContent = 'Ұсынысты қабылдамау';
  dismiss.style.marginLeft = '8px';

  dismiss.onclick = () => {
    output.textContent = 'Ұсыныс қабылданбады.';
  };

  output.append(title, topic, score, advice);

  if (source === 'ai' && aiPrediction !== baseline.topic_id) {
    const warning = document.createElement('p');
    warning.textContent =
      '⚠️ AI қате нәтиже берді. Қауіпсіздік үшін алгоритмдік ұсыныс қолданылды.';
    output.append(warning);
  }

  output.append(link, dismiss);

  button.disabled = false;
  button.textContent = 'Қайта талдау';
}
