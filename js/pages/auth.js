// Qadam Academy - Onboarding / Account creation

// Subject combination presets for ҰБТ
const UBT_PRESETS = [
  {
    id: 'it',
    label: '💻 IT / Информатика бағыты',
    subjects: ['math', 'informatics', 'physics', 'math_lit', 'reading_lit'],
  },
  {
    id: 'natural',
    label: '🔬 Жаратылыстану бағыты',
    subjects: ['math', 'physics', 'chemistry', 'biology', 'math_lit'],
  },
  {
    id: 'social',
    label: '📜 Қоғамдық-гуманитарлық бағыт',
    subjects: ['history', 'geography', 'english', 'math_lit', 'reading_lit'],
  },
  {
    id: 'biology',
    label: '🧬 Медицина / Биология бағыты',
    subjects: ['chemistry', 'biology', 'math', 'math_lit', 'reading_lit'],
  },
  {
    id: 'language',
    label: '🌐 Тіл / Халықаралық бағыт',
    subjects: ['english', 'history', 'reading_lit', 'math_lit', 'geography'],
  },
];

const AVATARS = ['👨‍🎓','👩‍🎓','🧑‍💻','👩‍💻','👨‍🔬','👩‍🔬','📚','🏆'];

function renderAuth(onComplete) {
  // onComplete(user) — called after account creation
  document.body.innerHTML = '';  // clear shell

  const wrap = document.createElement('div');
  wrap.className = 'auth-wrap';
  wrap.innerHTML = `
    <div class="auth-card">
      <div class="auth-logo">🎓 <span>Qadam Academy</span></div>
      <h1 class="auth-title">Аккаунт жасау</h1>
      <p class="auth-sub">ҰБТ-ға дайындықты бастау үшін профиль жасаңыз</p>

      <!-- Step indicator -->
      <div class="auth-steps">
        <div class="auth-step active" id="step-dot-1"><span>1</span><small>Профиль</small></div>
        <div class="auth-step-line"></div>
        <div class="auth-step" id="step-dot-2"><span>2</span><small>Пәндер</small></div>
      </div>

      <!-- Step 1: Profile -->
      <div id="auth-step-1">
        <div class="auth-field">
          <label>Аты-жөні <span class="req">*</span></label>
          <input id="auth-name" type="text" placeholder="Мысалы: Айгерім Сейткали" maxlength="60" autocomplete="name" />
        </div>
        <div class="auth-field">
          <label>Сынып</label>
          <select id="auth-grade">
            <option value="9-сынып">9-сынып</option>
            <option value="10-сынып">10-сынып</option>
            <option value="11-сынып" selected>11-сынып</option>
          </select>
        </div>
        <div class="auth-field">
          <label>Мектеп (міндетті емес)</label>
          <input id="auth-school" type="text" placeholder="Мектептің атауы" maxlength="80" />
        </div>
        <div class="auth-field">
          <label>Аватар таңдаңыз</label>
          <div class="avatar-picker" id="avatarPicker">
            ${AVATARS.map((a, i) => `
              <button type="button" class="avatar-btn ${i===1?'selected':''}" data-avatar="${a}">${a}</button>
            `).join('')}
          </div>
        </div>
        <div id="auth-error-1" class="auth-error" style="display:none"></div>
        <button class="btn btn-primary btn-block auth-next" id="toStep2">Келесі →</button>

        ${_existingAccountsHTML()}
      </div>

      <!-- Step 2: Subject selection -->
      <div id="auth-step-2" style="display:none">
        <p class="auth-field-hint">ҰБТ-ға дайындалатын <strong>5 пән</strong> таңдаңыз (міндетті 2 пән + 3 таңдаулы):</p>

        <div class="preset-row">
          <span class="preset-label">Дайын үйлесімдер:</span>
          <div class="preset-btns" id="presetBtns">
            ${UBT_PRESETS.map(p => `
              <button type="button" class="preset-btn" data-preset="${p.id}">${p.label}</button>
            `).join('')}
          </div>
        </div>

        <div class="auth-subjects-grid" id="subjectCheckboxes">
          ${SUBJECTS.map(s => `
            <label class="subject-checkbox ${['math_lit','reading_lit'].includes(s.id)?'required-sub':''}">
              <input type="checkbox" value="${s.id}"
                ${['math_lit','reading_lit'].includes(s.id)?'checked disabled':''}
              />
              <span class="sub-check-icon">${s.icon}</span>
              <span class="sub-check-name">${s.name}</span>
              ${['math_lit','reading_lit'].includes(s.id)?'<span class="sub-required-badge">Міндетті</span>':''}
            </label>
          `).join('')}
        </div>

        <div id="subject-count-hint" class="subject-count-hint">0 / 3 таңдалды</div>
        <div id="auth-error-2" class="auth-error" style="display:none"></div>

        <div class="auth-btn-row">
          <button class="btn btn-outline" id="backToStep1">← Артқа</button>
          <button class="btn btn-primary" id="createAccountBtn">✅ Аккаунт жасау</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(wrap);

  // ── State ──────────────────────────────────────────────────────────────────
  let selectedAvatar = AVATARS[1];

  // Avatar picker
  wrap.querySelectorAll('.avatar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = btn.dataset.avatar;
    });
  });

  // Step 1 → 2
  document.getElementById('toStep2').addEventListener('click', () => {
    const name = document.getElementById('auth-name').value.trim();
    const err  = document.getElementById('auth-error-1');
    if (!name) {
      err.textContent = 'Аты-жөніңізді енгізіңіз.';
      err.style.display = 'block';
      return;
    }
    err.style.display = 'none';
    document.getElementById('auth-step-1').style.display = 'none';
    document.getElementById('auth-step-2').style.display = 'block';
    document.getElementById('step-dot-1').classList.remove('active');
    document.getElementById('step-dot-1').classList.add('done');
    document.getElementById('step-dot-2').classList.add('active');
    _updateSubjectCount();
  });

  // Back
  document.getElementById('backToStep1').addEventListener('click', () => {
    document.getElementById('auth-step-2').style.display = 'none';
    document.getElementById('auth-step-1').style.display = 'block';
    document.getElementById('step-dot-2').classList.remove('active');
    document.getElementById('step-dot-1').classList.add('active');
    document.getElementById('step-dot-1').classList.remove('done');
  });

  // Preset buttons
  document.getElementById('presetBtns').addEventListener('click', e => {
    const btn    = e.target.closest('.preset-btn');
    if (!btn) return;
    const preset = UBT_PRESETS.find(p => p.id === btn.dataset.preset);
    if (!preset) return;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Apply selection
    document.querySelectorAll('#subjectCheckboxes input[type=checkbox]').forEach(cb => {
      if (!cb.disabled) cb.checked = preset.subjects.includes(cb.value);
    });
    _updateSubjectCount();
  });

  // Subject checkboxes — enforce max 3 optional (5 total incl. 2 mandatory)
  document.getElementById('subjectCheckboxes').addEventListener('change', e => {
    if (!e.target.matches('input[type=checkbox]') || e.target.disabled) return;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    _enforceSubjectLimit();
    _updateSubjectCount();
  });

  // Create account
  document.getElementById('createAccountBtn').addEventListener('click', () => {
    const selected = _getSelectedSubjects();
    const err      = document.getElementById('auth-error-2');
    if (selected.length !== 5) {
      err.textContent = `Дәл 5 пән таңдаңыз (қазір ${selected.length}).`;
      err.style.display = 'block';
      return;
    }
    err.style.display = 'none';

    const user = Storage.createUser({
      name:             document.getElementById('auth-name').value.trim(),
      grade:            document.getElementById('auth-grade').value,
      school:           document.getElementById('auth-school').value.trim(),
      avatar:           selectedAvatar,
      selectedSubjects: selected,
    });
    onComplete(user);
  });
}

function _existingAccountsHTML() {
  const users  = Storage.getAllUsers();
  const ids    = Object.keys(users);
  if (!ids.length) return '';
  return `
    <div class="existing-accounts">
      <div class="existing-title">Немесе бар аккаунтқа кіру:</div>
      ${ids.map(id => {
        const u = users[id];
        return `<button type="button" class="existing-btn" data-uid="${id}">
          ${u.avatar} <span>${u.name}</span> <small>${u.grade}</small>
        </button>`;
      }).join('')}
    </div>
  `;
}

function _getSelectedSubjects() {
  const mandatory = ['math_lit','reading_lit'];
  const optional  = [];
  document.querySelectorAll('#subjectCheckboxes input[type=checkbox]:not([disabled]):checked').forEach(cb => {
    optional.push(cb.value);
  });
  return [...mandatory, ...optional];
}

function _enforceSubjectLimit() {
  const optionalChecked = Array.from(
    document.querySelectorAll('#subjectCheckboxes input[type=checkbox]:not([disabled]):checked')
  );
  if (optionalChecked.length > 3) {
    // Uncheck the last one
    const last = optionalChecked[optionalChecked.length - 1];
    last.checked = false;
  }
}

function _updateSubjectCount() {
  const optChecked = document.querySelectorAll('#subjectCheckboxes input[type=checkbox]:not([disabled]):checked').length;
  const hint = document.getElementById('subject-count-hint');
  hint.textContent = `${optChecked} / 3 таңдалды`;
  hint.className   = 'subject-count-hint' + (optChecked === 3 ? ' full' : '');
}

// ── Subject settings panel (called from dashboard) ─────────────────────────────
function renderSubjectSettings() {
  UI.setTitle('Пән таңдау');
  const user    = Storage.getUser();
  const current = Storage.getSelectedSubjects();

  UI.setContent(`
    <div class="page-header">
      <div class="breadcrumb"><a href="#dashboard">Үлгерім</a> / Пән таңдау</div>
      <h1 class="page-title">🎯 Пәндерді өзгерту</h1>
      <p class="page-subtitle">ҰБТ-ға дайындалатын 5 пәніңізді таңдаңыз</p>
    </div>

    <div class="settings-card">
      <div class="preset-row">
        <span class="preset-label">Дайын үйлесімдер:</span>
        <div class="preset-btns" id="settingsPresets">
          ${UBT_PRESETS.map(p => `
            <button type="button" class="preset-btn" data-preset="${p.id}">${p.label}</button>
          `).join('')}
        </div>
      </div>

      <div class="auth-subjects-grid" id="settingsSubjects">
        ${SUBJECTS.map(s => `
          <label class="subject-checkbox ${['math_lit','reading_lit'].includes(s.id)?'required-sub':''}">
            <input type="checkbox" value="${s.id}"
              ${current.includes(s.id) ? 'checked' : ''}
              ${['math_lit','reading_lit'].includes(s.id) ? 'disabled' : ''}
            />
            <span class="sub-check-icon">${s.icon}</span>
            <span class="sub-check-name">${s.name}</span>
            ${['math_lit','reading_lit'].includes(s.id) ? '<span class="sub-required-badge">Міндетті</span>' : ''}
          </label>
        `).join('')}
      </div>

      <div id="settings-count-hint" class="subject-count-hint"></div>
      <div id="settings-error" class="auth-error" style="display:none"></div>

      <div style="display:flex;gap:1rem;margin-top:1.5rem">
        <a href="#dashboard" class="btn btn-outline">← Артқа</a>
        <button class="btn btn-primary" id="saveSubjectsBtn">💾 Сақтау</button>
      </div>
    </div>
  `);

  _updateSettingsCount();

  document.getElementById('settingsPresets').addEventListener('click', e => {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;
    const preset = UBT_PRESETS.find(p => p.id === btn.dataset.preset);
    if (!preset) return;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#settingsSubjects input[type=checkbox]:not([disabled])').forEach(cb => {
      cb.checked = preset.subjects.includes(cb.value);
    });
    _updateSettingsCount();
  });

  document.getElementById('settingsSubjects').addEventListener('change', e => {
    if (!e.target.matches('input') || e.target.disabled) return;
    document.querySelectorAll('#settingsPresets .preset-btn').forEach(b => b.classList.remove('active'));
    // Enforce max 3 optional
    const optChecked = Array.from(
      document.querySelectorAll('#settingsSubjects input:not([disabled]):checked')
    );
    if (optChecked.length > 3) optChecked[optChecked.length-1].checked = false;
    _updateSettingsCount();
  });

  document.getElementById('saveSubjectsBtn').addEventListener('click', () => {
    const optional = Array.from(
      document.querySelectorAll('#settingsSubjects input:not([disabled]):checked')
    ).map(cb => cb.value);
    const selected = ['math_lit','reading_lit',...optional];
    const err = document.getElementById('settings-error');
    if (selected.length !== 5) {
      err.textContent = `Дәл 5 пән таңдаңыз (қазір ${selected.length}).`;
      err.style.display = 'block';
      return;
    }
    err.style.display = 'none';
    Storage.setSelectedSubjects(selected);
    // Rebuild sidebar and go to dashboard
    const user = Storage.getUser();
    UI.renderShell(user);
    Router.navigate('#dashboard');
    showToast('Пәндер сақталды! ✅');
  });
}

function _updateSettingsCount() {
  const n    = document.querySelectorAll('#settingsSubjects input:not([disabled]):checked').length;
  const hint = document.getElementById('settings-count-hint');
  if (!hint) return;
  hint.textContent = `${n} / 3 таңдалды`;
  hint.className   = 'subject-count-hint' + (n === 3 ? ' full' : '');
}
