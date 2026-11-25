// Qadam Academy - Interactive Test Engine

let _testState = null;

function renderTest(subjectId, testId) {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const tests = TESTS[subjectId] || [];
  const test = tests.find((t) => t.id === testId);

  if (!subject || !test) {
    UI.setContent('<div class="error-state">Тест табылмады.</div>');
    return;
  }

  UI.setTitle(test.title);

  _testState = {
    test,
    subjectId,
    answers: {},
    startTime: Date.now(),
  };

  renderTestQuestion(0);
}

function renderTestQuestion(qIndex) {
  const { test, answers } = _testState;
  const q = test.questions[qIndex];
  const total = test.questions.length;
  const answered = Object.keys(answers).length;

  UI.setContent(`
    <div class="test-layout">
      <div class="test-header">
        <div class="breadcrumb">
          <a href="#subject/${_testState.subjectId}">← Пәнге оралу</a>
        </div>
        <h1 class="test-title">${test.title}</h1>
        <div class="test-meta-row">
          <span class="test-progress-label">${answered} / ${total} жауапталды</span>
          <div class="test-progress-bar">
            <div class="test-progress-fill" style="width: ${(answered / total) * 100}%"></div>
          </div>
        </div>
      </div>

      <div class="question-dots">
        ${test.questions
          .map(
            (_, i) => `
          <button
            class="q-dot ${i === qIndex ? 'active' : ''} ${answers[i] !== undefined ? 'answered' : ''}"
            onclick="goToQuestion(${i})"
            aria-label="${i + 1}-сұрақ"
          >${i + 1}</button>
        `
          )
          .join('')}
      </div>

      <div class="question-card">
        <div class="question-num">Сұрақ ${qIndex + 1} / ${total}</div>
        <div class="question-text">${q.text}</div>

        <div class="options-list" id="optionsList">
          ${q.options
            .map(
              (opt, oi) => `
            <button
              class="option-btn ${answers[qIndex] === oi ? 'selected' : ''}"
              onclick="selectAnswer(${qIndex}, ${oi})"
            >
              <span class="option-letter">${String.fromCharCode(65 + oi)}</span>
              <span class="option-text">${opt}</span>
            </button>
          `
            )
            .join('')}
        </div>

        <div class="question-nav">
          ${
            qIndex > 0
              ? `<button class="btn btn-outline" onclick="goToQuestion(${qIndex - 1})">← Алдыңғы</button>`
              : '<span></span>'
          }

          ${
            qIndex < total - 1
              ? `<button class="btn btn-primary" onclick="goToQuestion(${qIndex + 1})" ${answers[qIndex] === undefined ? 'disabled' : ''}>
              Келесі →
            </button>`
              : `<button
              class="btn btn-success"
              onclick="submitTest()"
              ${answered < total ? '' : ''}
            >
              ${answered < total ? `Тапсыру (${total - answered} қалды)` : '✅ Тапсыру'}
            </button>`
          }
        </div>
      </div>
    </div>
  `);
}

function selectAnswer(qIndex, optionIndex) {
  _testState.answers[qIndex] = optionIndex;
  renderTestQuestion(qIndex);
}

function goToQuestion(qIndex) {
  renderTestQuestion(qIndex);
}

function submitTest() {
  if (!_testState) return;

  const { test, subjectId, answers, startTime } = _testState;
  const questions = test.questions;

  // Calculate score
  let score = 0;
  const wrongQuestions = [];
  const detailedAnswers = [];

  questions.forEach((q, i) => {
    const chosen = answers[i];
    const correct = q.correct;
    const isCorrect = chosen === correct;
    if (isCorrect) {
      score++;
    } else {
      wrongQuestions.push({
        questionText: q.text,
        chosenIndex: chosen,
        correctIndex: correct,
        explanation: q.explanation,
      });
    }
    detailedAnswers.push({ questionText: q.text, chosen, correct, isCorrect, options: q.options, explanation: q.explanation });
  });

  const result = {
    testId: test.id,
    testTitle: test.title,
    subjectId,
    score,
    total: questions.length,
    answers: detailedAnswers,
    wrongQuestions,
    timeTaken: Math.round((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  };

  Storage.saveTestResult(result);
  renderTestResult(result);
}

function renderTestResult(result) {
  const pct = Math.round((result.score / result.total) * 100);
  const colorClass = UI.scoreColor(pct);
  const label = UI.scoreLabel(pct);
  const subject = SUBJECTS.find((s) => s.id === result.subjectId);
  const mins = Math.floor(result.timeTaken / 60);
  const secs = result.timeTaken % 60;

  UI.setContent(`
    <div class="result-layout">
      <div class="result-hero result-hero-${colorClass}">
        <div class="result-score-circle">
          <span class="result-score-num">${pct}%</span>
          <span class="result-score-label">${result.score}/${result.total}</span>
        </div>
        <div class="result-hero-text">
          <h1>${label}</h1>
          <p>${result.testTitle}</p>
          <div class="result-meta">
            <span>⏱ ${mins}м ${secs}с</span>
            <span>✅ ${result.score} дұрыс</span>
            <span>❌ ${result.total - result.score} қате</span>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <a href="#test/${result.subjectId}/${result.testId}" class="btn btn-outline">🔄 Қайта тапсыру</a>
        <a href="#subject/${result.subjectId}" class="btn btn-primary">← Пәнге оралу</a>
        <a href="#dashboard" class="btn btn-outline">📊 Менің үлгерімім</a>
      </div>

      <div class="result-breakdown">
        <h2>Толық нәтиже</h2>
        ${result.answers
          .map(
            (a, i) => `
          <div class="answer-item ${a.isCorrect ? 'answer-correct' : 'answer-wrong'}">
            <div class="answer-header">
              <span class="answer-num">${i + 1}</span>
              <span class="answer-status">${a.isCorrect ? '✅ Дұрыс' : '❌ Қате'}</span>
            </div>
            <div class="answer-question">${a.questionText}</div>
            <div class="answer-options">
              ${a.options
                .map(
                  (opt, oi) => `
                <div class="answer-option
                  ${oi === a.correct ? 'option-correct' : ''}
                  ${oi === a.chosen && !a.isCorrect ? 'option-wrong-chosen' : ''}
                ">
                  <span>${String.fromCharCode(65 + oi)}.</span> ${opt}
                  ${oi === a.correct ? ' ✓' : ''}
                  ${oi === a.chosen && !a.isCorrect ? ' ✗' : ''}
                </div>
              `
                )
                .join('')}
            </div>
            ${
              !a.isCorrect
                ? `<div class="answer-explanation">💡 ${a.explanation}</div>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `);
}
