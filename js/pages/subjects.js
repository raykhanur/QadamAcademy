// Qadam Academy - Subjects Catalog + Subject Detail

function renderSubjects() {
  UI.setTitle('Пәндер каталогы');
  UI.setContent(`
    <div class="page-header">
      <h1 class="page-title">Пәндер каталогы</h1>
      <p class="page-subtitle">ҰБТ пәндері бойынша оқу материалдарын таңдаңыз</p>
    </div>
    <div class="subjects-grid subjects-grid-full">
      ${SUBJECTS.map((s) => renderSubjectCardFull(s)).join('')}
    </div>
  `);
}

function renderSubjectCardFull(subject) {
  const progress = Storage.getSubjectProgress(subject.id);
  const lessons  = LESSONS[subject.id] || [];
  const tests    = TESTS[subject.id]   || [];
  const completedLessons = Storage.getCompletedLessons();
  const doneCount = lessons.filter((l) => completedLessons.includes(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((doneCount / lessons.length) * 100) : 0;

  return `
    <div class="subject-card-full" style="--subject-color: ${subject.color}">
      <div class="subject-card-full-header">
        <span class="subject-icon-lg">${subject.icon}</span>
        <div>
          <h2>${subject.name}</h2>
          <p>${subject.description}</p>
        </div>
      </div>
      <div class="subject-progress-row">
        <div class="stat-pill">📖 ${doneCount}/${lessons.length} сабақ</div>
        <div class="stat-pill">📝 ${tests.length} тест</div>
        <div class="stat-pill">🏆 Үздік: ${progress.bestScore || 0}%</div>
      </div>
      <div class="progress-bar progress-bar-lg">
        <div class="progress-fill" style="width: ${pct}%"></div>
      </div>
      <div class="subject-card-full-footer">
        <span class="progress-label">${pct}% аяқталды</span>
        <a href="#subject/${subject.id}" class="btn btn-primary">Кіру →</a>
      </div>
    </div>
  `;
}

// ── Subject Detail ────────────────────────────────────────────────────────────

function renderSubject(subjectId) {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  if (!subject) {
    UI.setContent('<div class="error-state">Пән табылмады.</div>');
    return;
  }

  UI.setTitle(subject.name);
  const lessons          = LESSONS[subjectId] || [];
  const tests            = TESTS[subjectId]   || [];
  const completedLessons = Storage.getCompletedLessons();

  // Build a map: lessonId → test (match by index where available)
  // For subjects with more lessons than tests, later lessons won't have a dedicated test
  const lessonTestMap = {};
  tests.forEach((t) => {
    if (t.lessonId) lessonTestMap[t.lessonId] = t;
  });
  // Also fall back to index-based mapping if lessonId not explicitly set
  tests.forEach((t, i) => {
    if (lessons[i] && !lessonTestMap[lessons[i].id]) {
      lessonTestMap[lessons[i].id] = t;
    }
  });

  UI.setContent(`
    <div class="page-header" style="border-left: 4px solid ${subject.color}; padding-left: 1.5rem;">
      <div class="breadcrumb"><a href="#subjects">Пәндер</a> / ${subject.name}</div>
      <h1 class="page-title">${subject.icon} ${subject.name}</h1>
      <p class="page-subtitle">${subject.description}</p>
    </div>

    <div class="subject-detail-grid">
      <div class="lessons-section">
        <h2 class="section-heading">📖 Сабақтар</h2>
        <div class="lessons-list">
          ${lessons.map((lesson, i) => {
            const done      = completedLessons.includes(lesson.id);
            const test      = lessonTestMap[lesson.id];
            const testResult = test ? Storage.getTestResult(test.id) : null;
            const testScore  = testResult ? Math.round((testResult.score / testResult.total) * 100) : null;

            return `
              <div class="lesson-item ${done ? 'lesson-done' : ''}">
                <div class="lesson-num">${done ? '✅' : i + 1}</div>
                <div class="lesson-body">
                  <div class="lesson-title">${lesson.title}</div>
                  <div class="lesson-actions">
                    <a href="#lesson/${subjectId}/${lesson.id}" class="btn btn-sm btn-primary">
                      ${done ? 'Қайтадан оқу' : 'Оқу'}
                    </a>
                    ${test
                      ? `<a href="#test/${subjectId}/${test.id}" class="btn btn-sm ${testScore !== null ? 'btn-outline' : 'btn-accent'}">
                          ${testScore !== null ? `Тест: ${testScore}%` : 'Тест тапсыру'}
                        </a>`
                      : ''}
                  </div>
                </div>
                ${done ? '<span class="lesson-badge">Аяқталды</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="subject-sidebar">
        <div class="info-card">
          <h3>Пән туралы</h3>
          <div class="info-row"><span>📚 Сабақтар:</span><strong>${lessons.length}</strong></div>
          <div class="info-row"><span>✅ Тесттер:</span><strong>${tests.length}</strong></div>
          <div class="info-row">
            <span>🏆 Үздік нәтиже:</span>
            <strong>${Storage.getSubjectProgress(subjectId).bestScore || 0}%</strong>
          </div>
        </div>

        ${renderSubjectRecommendations(subjectId)}
      </div>
    </div>
  `);
}

function renderSubjectRecommendations(subjectId) {
  const results = Storage.getTestResults().filter((r) => r.subjectId === subjectId);
  if (!results.length) return '';

  const missed = {};
  results.forEach((r) => {
    (r.wrongQuestions || []).forEach((q) => {
      missed[q.questionText] = (missed[q.questionText] || 0) + 1;
    });
  });

  const topMissed = Object.entries(missed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (!topMissed.length) return '';

  return `
    <div class="recommendation-card">
      <h3>💡 Ұсыныстар</h3>
      <p>Жиі қате жіберген сұрақтар:</p>
      <ul>
        ${topMissed.map(([text, count]) =>
          `<li>«${text.substring(0, 60)}...» — ${count} рет</li>`
        ).join('')}
      </ul>
    </div>
  `;
}
