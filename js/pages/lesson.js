// Qadam Academy - Lesson Viewer

function renderLesson(subjectId, lessonId) {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const lessons = LESSONS[subjectId] || [];
  const lesson = lessons.find((l) => l.id === lessonId);

  if (!subject || !lesson) {
    UI.setContent('<div class="error-state">Сабақ табылмады.</div>');
    return;
  }

  UI.setTitle(lesson.title);

  const lessonIndex = lessons.indexOf(lesson);
  const prevLesson = lessons[lessonIndex - 1];
  const nextLesson = lessons[lessonIndex + 1];
  const tests = TESTS[subjectId] || [];
  const relatedTest = tests[lessonIndex];
  const isComplete = Storage.isLessonComplete(lessonId);

  UI.setContent(`
    <div class="lesson-layout">
      <div class="lesson-main">
        <div class="breadcrumb">
          <a href="#subjects">Пәндер</a> /
          <a href="#subject/${subjectId}">${subject.name}</a> /
          ${lesson.title}
        </div>

        <div class="lesson-content-card">
          ${lesson.content}
        </div>

        <div class="lesson-nav-bar">
          ${
            prevLesson
              ? `<a href="#lesson/${subjectId}/${prevLesson.id}" class="btn btn-outline">← ${prevLesson.title}</a>`
              : '<span></span>'
          }

          <div class="lesson-nav-center">
            ${
              !isComplete
                ? `<button class="btn btn-primary" onclick="completeLesson('${subjectId}', '${lessonId}')">
                ✅ Аяқтадым
              </button>`
                : '<span class="complete-badge">✅ Аяқталды</span>'
            }
          </div>

          ${
            nextLesson
              ? `<a href="#lesson/${subjectId}/${nextLesson.id}" class="btn btn-outline">${nextLesson.title} →</a>`
              : '<span></span>'
          }
        </div>
      </div>

      <aside class="lesson-sidebar">
        <div class="info-card">
          <h3>📋 Сабақ мәліметі</h3>
          <div class="info-row"><span>Пән:</span><strong>${subject.name}</strong></div>
          <div class="info-row"><span>Сабақ:</span><strong>${lessonIndex + 1} / ${lessons.length}</strong></div>
          <div class="info-row">
            <span>Күй:</span>
            <strong>${isComplete ? '✅ Аяқталды' : '⏳ Оқылмады'}</strong>
          </div>
        </div>

        ${
          relatedTest
            ? `<div class="info-card test-promo-card">
            <h3>✅ Осы сабақ тесті</h3>
            <p>${relatedTest.title}</p>
            <p class="test-promo-meta">${relatedTest.questions.length} сұрақ</p>
            <a href="#test/${subjectId}/${relatedTest.id}" class="btn btn-primary btn-block">
              Тест тапсыру →
            </a>
          </div>`
            : ''
        }

        <div class="lesson-toc info-card">
          <h3>📚 Барлық сабақтар</h3>
          ${lessons
            .map((l) => {
              const done = Storage.isLessonComplete(l.id);
              const active = l.id === lessonId;
              return `<a href="#lesson/${subjectId}/${l.id}" class="toc-item ${active ? 'toc-active' : ''} ${done ? 'toc-done' : ''}">
              ${done ? '✅' : '○'} ${l.title}
            </a>`;
            })
            .join('')}
        </div>
      </aside>
    </div>
  `);
}

function completeLesson(subjectId, lessonId) {
  Storage.markLessonComplete(lessonId);

  // Update subject progress count
  const lessons = LESSONS[subjectId] || [];
  const completedLessons = Storage.getCompletedLessons();
  const doneCount = lessons.filter((l) => completedLessons.includes(l.id)).length;
  Storage.setSubjectProgress(subjectId, { lessonsCompleted: doneCount });

  // Re-render
  renderLesson(subjectId, lessonId);

  // Toast
  showToast('Сабақ аяқталды! 🎉');
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('toast-show'), 50);
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}
