// Qadam Academy - LocalStorage Manager (v2: multi-user, subject selection)

const Storage = (() => {
  const KEYS = {
    CURRENT_USER_ID:    'qadam_current_user_id',
    USERS:              'qadam_users',           // map: id → user object
    PROGRESS:           'qadam_progress',        // map: userId_subjectId → data
    TEST_RESULTS:       'qadam_test_results',    // array, tagged by userId
    COMPLETED_LESSONS:  'qadam_completed_lessons', // map: userId → array
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function _load(key, fallback) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch(e) { return fallback; }
  }
  function _save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  // ── Users ────────────────────────────────────────────────────────────────────
  function getAllUsers()    { return _load(KEYS.USERS, {}); }
  function saveAllUsers(u) { _save(KEYS.USERS, u); }

  function getCurrentUserId() { return localStorage.getItem(KEYS.CURRENT_USER_ID) || null; }
  function setCurrentUserId(id){ localStorage.setItem(KEYS.CURRENT_USER_ID, id); }

  function getUser() {
    const uid = getCurrentUserId();
    if (uid) {
      const users = getAllUsers();
      if (users[uid]) return users[uid];
    }
    // No user yet — return null so the app shows onboarding
    return null;
  }

  function createUser(data) {
    // data: { name, grade, school, avatar, selectedSubjects }
    const id = 'user-' + Date.now();
    const user = {
      id,
      name:             data.name    || 'Оқушы',
      grade:            data.grade   || '11-сынып',
      school:           data.school  || '',
      avatar:           data.avatar  || '👤',
      selectedSubjects: data.selectedSubjects || [],
      joinedAt:         new Date().toISOString(),
    };
    const users = getAllUsers();
    users[id] = user;
    saveAllUsers(users);
    setCurrentUserId(id);
    return user;
  }

  function updateUser(fields) {
    const uid = getCurrentUserId();
    if (!uid) return;
    const users = getAllUsers();
    if (!users[uid]) return;
    users[uid] = { ...users[uid], ...fields };
    saveAllUsers(users);
    return users[uid];
  }

  function switchUser(userId) {
    const users = getAllUsers();
    if (users[userId]) { setCurrentUserId(userId); return true; }
    return false;
  }

  function deleteUser(userId) {
    const users = getAllUsers();
    delete users[userId];
    saveAllUsers(users);
    if (getCurrentUserId() === userId) {
      localStorage.removeItem(KEYS.CURRENT_USER_ID);
    }
  }

  function logout() {
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
  }

  // ── Subject selection ────────────────────────────────────────────────────────
  function getSelectedSubjects() {
    const user = getUser();
    if (!user || !user.selectedSubjects || !user.selectedSubjects.length) {
      // If no selection, return all subjects
      return (typeof SUBJECTS !== 'undefined') ? SUBJECTS.map(s => s.id) : [];
    }
    return user.selectedSubjects;
  }

  function setSelectedSubjects(ids) {
    updateUser({ selectedSubjects: ids });
  }

  // ── Progress ─────────────────────────────────────────────────────────────────
  function _progressKey() {
    return KEYS.PROGRESS + '_' + (getCurrentUserId() || 'guest');
  }
  function getProgress()         { return _load(_progressKey(), {}); }
  function setSubjectProgress(subjectId, data) {
    const p = getProgress();
    p[subjectId] = { ...p[subjectId], ...data };
    _save(_progressKey(), p);
  }
  function getSubjectProgress(subjectId) {
    return getProgress()[subjectId] || { lessonsCompleted: 0, testsCompleted: 0, bestScore: 0 };
  }

  // ── Completed Lessons ────────────────────────────────────────────────────────
  function _lessonsKey() {
    return KEYS.COMPLETED_LESSONS + '_' + (getCurrentUserId() || 'guest');
  }
  function getCompletedLessons()      { return _load(_lessonsKey(), []); }
  function markLessonComplete(id) {
    const arr = getCompletedLessons();
    if (!arr.includes(id)) { arr.push(id); _save(_lessonsKey(), arr); }
  }
  function isLessonComplete(id)  { return getCompletedLessons().includes(id); }

  // ── Test Results ─────────────────────────────────────────────────────────────
  function _resultsKey() {
    return KEYS.TEST_RESULTS + '_' + (getCurrentUserId() || 'guest');
  }
  function getTestResults() { return _load(_resultsKey(), []); }
  function saveTestResult(result) {
    const results  = getTestResults();
    const existing = results.findIndex(r => r.testId === result.testId);
    if (existing >= 0) {
      result.previousScore = results[existing].score;
      results[existing] = result;
    } else {
      results.push(result);
    }
    _save(_resultsKey(), results);
    // Update subject-level progress
    const subResults = results.filter(r => r.subjectId === result.subjectId);
    const bestScore  = Math.max(...subResults.map(r => Math.round((r.score / r.total) * 100)));
    setSubjectProgress(result.subjectId, { testsCompleted: subResults.length, bestScore });
  }
  function getTestResult(testId) {
    return getTestResults().find(r => r.testId === testId) || null;
  }

  // ── Recommendations ──────────────────────────────────────────────────────────
  function getWeakTopics() {
    const weakMap = {};
    getTestResults().forEach(result => {
      (result.wrongQuestions || []).forEach(() => {
        weakMap[result.subjectId] = (weakMap[result.subjectId] || 0) + 1;
      });
    });
    return weakMap;
  }

  // ── Overall Stats ─────────────────────────────────────────────────────────────
  function getOverallStats() {
    const results   = getTestResults();
    const completed = getCompletedLessons();
    const totalTests = results.length;
    const avgScore   = totalTests > 0
      ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / totalTests)
      : 0;
    return {
      lessonsCompleted: completed.length,
      testsCompleted:   totalTests,
      avgScore,
      streak: new Set(results.map(r => new Date(r.timestamp).toDateString())).size,
    };
  }

  // ── Clear current user data ───────────────────────────────────────────────────
  function clearAll() {
    localStorage.removeItem(_progressKey());
    localStorage.removeItem(_lessonsKey());
    localStorage.removeItem(_resultsKey());
  }

  return {
    getUser, createUser, updateUser, getAllUsers, switchUser, deleteUser, logout,
    getCurrentUserId, setCurrentUserId,
    getSelectedSubjects, setSelectedSubjects,
    getProgress, getSubjectProgress, setSubjectProgress,
    getCompletedLessons, markLessonComplete, isLessonComplete,
    getTestResults, saveTestResult, getTestResult,
    getWeakTopics, getOverallStats, clearAll,
  };
})();
