// ============================================================
// APP.JS v2.0 — Instant Feedback + Optimized UX
// Không còn nút "Kiểm tra đáp án" — Click là biết ngay
// ============================================================

const App = (() => {

  // ===== STATE =====
  let state = {
    mode: 'home',
    questions: [],
    current: 0,
    selected: null,
    checked: false,
    isAnimating: false,         // Chống double-click
    results: {},
    score: { correct: 0, wrong: 0 },
    streak: 0,                  // Chuỗi đúng liên tiếp
    maxStreak: 0,
    currentTopicFilter: 'all',
    modeLabel: 'Toàn bộ',
    startTime: null,
    questionStartTime: null,    // Đo thời gian mỗi câu
    timePerQuestion: {},
    bookmarks: new Set(),
    hearts: 0,
    maxHearts: 5,
    heartsSynced: false,
    isPremium: false,
    hasUsedFreeHeartRecovery: false,
    canUseDailyRecovery: true,
    dailyRecoveryAmount: 5,
    isOutOfHeartsLocked: false,
    lastHeartLoss: null,
    aiHintsUsed: new Set(),
    aiExplanationOpen: new Set()
  };

  // ===== INIT =====
  function resolveChapterBackground(topic) {
    const backgroundImage = topic && typeof topic.backgroundImage === 'string' ? topic.backgroundImage.trim() : '';
    if (!backgroundImage) return '';
    if (backgroundImage.startsWith('/assets/')) return backgroundImage;
    if (backgroundImage.startsWith('/api/')) return `http://localhost:8000${backgroundImage}`;
    return backgroundImage;
  }

  function setChapterBackground(topic) {
    const imageUrl = resolveChapterBackground(topic);
    document.body.style.setProperty('--chapter-bg-image', imageUrl ? `url("${imageUrl.replace(/"/g, '%22')}")` : 'none');
    document.body.classList.toggle('has-chapter-background', Boolean(imageUrl));
  }

  function getCorrectAnswerIndex(q) {
    const rawAnswer = q && (q.answer !== undefined ? q.answer : (q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.ans));
    if (typeof rawAnswer === 'number' && Number.isFinite(rawAnswer)) return rawAnswer;
    if (typeof rawAnswer === 'string') {
      const normalized = rawAnswer.trim();
      const upper = normalized.toUpperCase();
      const letterIndex = ['A', 'B', 'C', 'D'].indexOf(upper);
      if (letterIndex >= 0) return letterIndex;
      const parsed = Number.parseInt(upper, 10);
      if (Number.isFinite(parsed) && String(parsed) === normalized) return parsed;
      if (Array.isArray(q.options)) {
        const textIndex = q.options.findIndex(option => String(option).trim().toLowerCase() === normalized.toLowerCase());
        if (textIndex >= 0) return textIndex;
      }
    }
    return -1;
  }

  function hasValidCorrectAnswer(q) {
    const idx = getCorrectAnswerIndex(q);
    return idx >= 0 && Array.isArray(q.options) && idx < q.options.length;
  }

  async function init() {
    if (typeof window.loadPublishedQuizData === 'function') {
      await window.loadPublishedQuizData();
    }
    loadBookmarks();
    setupHeartSync();

    // Iframe logic
    const params = new URLSearchParams(window.location.search);
    const unitId = params.get('unit'); // e.g. "u1"
    const lessonStr = params.get('lesson'); // e.g. "1"

    if (unitId && lessonStr) {
      const topicIndex = parseInt(unitId.replace('u', ''), 10) - 1;
      const topic = QUIZ_DATA.topics[topicIndex];
      const lesson = parseInt(lessonStr, 10);

      if (topic) {
        state.questions = ALL_QUESTIONS.filter(q => q.topicId === topic.id);
        state.modeLabel = topic.name;
        state.currentTopicFilter = topic.id;
        setChapterBackground(topic);

        const lessonType = params.get('type');
        const totalQ = state.questions.length;
        const topicNodes = Array.isArray(topic.lessonNodes) ? topic.lessonNodes : [];
        const resolveNodeQuestions = () => {
          const directNodeId = `${unitId}-l${lesson}`;
          const byId = topicNodes.find(node => node.id === directNodeId || node.id === lessonStr);
          const byIndex = topicNodes[lesson - 1];
          const node = byId || byIndex;
          if (node && Number.isFinite(Number(node.questionStart)) && Number.isFinite(Number(node.questionCount))) {
            const startIndex = Math.max(0, Number(node.questionStart));
            const count = Math.max(1, Number(node.questionCount));
            return state.questions.slice(startIndex, Math.min(startIndex + count, totalQ));
          }
          const legacyLessonSlotMap = { 1: 0, 2: 1, 4: 2, 5: 3 };
          const slot = legacyLessonSlotMap[lesson] !== undefined ? legacyLessonSlotMap[lesson] : (lesson - 1);
          const startIndex = slot * 5;
          return state.questions.slice(startIndex, Math.min(startIndex + 5, totalQ));
        };

        if (lessonType === 'review') {
          state.questions.sort(() => Math.random() - 0.5);
          state.questions = state.questions.slice(0, 15);

        } else if (lessonType === 'boss') {
          state.questions.sort(() => Math.random() - 0.5);
          state.questions = state.questions.slice(0, 5);

        } else if (lessonType === 'practice') {
          const currentNode = topicNodes[lesson - 1];
          const previousNodes = topicNodes.filter(node => Number(node.questionStart) < Number(currentNode?.questionStart || 0)).slice(-2);
          let practicePool = previousNodes.length > 0
            ? previousNodes.flatMap(node => state.questions.slice(Number(node.questionStart), Number(node.questionStart) + Number(node.questionCount)))
            : state.questions.slice(0, Math.min(10, totalQ));

          let wrongIds = [];
          try {
            wrongIds = JSON.parse(localStorage.getItem('ha_wrong_questions') || '[]');
          } catch(e) {}

          const wrongQs = state.questions.filter(q => wrongIds.includes(q.globalId));
          practicePool.sort(() => Math.random() - 0.5);
          const weakSlot = wrongQs.slice(0, Math.min(2, wrongQs.length));
          const normalSlot = practicePool.filter(q => !wrongIds.includes(q.globalId));
          const combined = [...weakSlot, ...normalSlot];
          state.questions = combined.slice(0, 5);

          if (state.questions.length < 5) {
            const extra = practicePool.slice(0, 5 - state.questions.length);
            state.questions = [...state.questions, ...extra];
          }

        } else {
          state.questions = resolveNodeQuestions();
        }

        if (!state.questions || state.questions.length === 0) {
          const sameTopicFallback = ALL_QUESTIONS.filter(q => q.topicId === topic.id);
          const globalFallback = ALL_QUESTIONS.filter(q => q && q.globalId);
          const fallbackPool = sameTopicFallback.length > 0 ? sameTopicFallback : globalFallback;
          fallbackPool.sort(() => Math.random() - 0.5);
          state.questions = fallbackPool.slice(0, lessonType === 'review' ? 15 : 5);
        }

        document.getElementById('homeScreen').style.display = 'none';
        beginQuiz();
        setupKeyboard();

        return;
      }
    }

    renderHomeTopics();
    showHome();
    setupKeyboard();
  }

  function loadBookmarks() {
    try {
      const saved = localStorage.getItem('history_quiz_bookmarks');
      if (saved) {
        const arr = JSON.parse(saved);
        state.bookmarks = new Set(arr);
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e);
      state.bookmarks = new Set();
    }
    updateHomeBookmarkButton();
  }

  function saveBookmarks() {
    localStorage.setItem('history_quiz_bookmarks', JSON.stringify([...state.bookmarks]));
    updateHomeBookmarkButton();
  }

  function toggleBookmark(globalId) {
    if (state.bookmarks.has(globalId)) {
      state.bookmarks.delete(globalId);
    } else {
      state.bookmarks.add(globalId);
    }
    saveBookmarks();
    // Re-render current question header bookmark button
    const btn = document.getElementById('btnBookmark');
    if (btn) {
      btn.classList.toggle('active', state.bookmarks.has(globalId));
    }
    // Re-render dot map
    renderDotMap();
  }

  function updateHomeBookmarkButton() {
    const btn = document.getElementById('btnReviewBookmarked');
    const count = document.getElementById('bookmarkCount');
    if (btn && count) {
      if (state.bookmarks.size > 0) {
        btn.style.display = 'inline-flex';
        count.textContent = state.bookmarks.size;
      } else {
        btn.style.display = 'none';
      }
    }
  }

  function startBookmarked() {
    if (state.bookmarks.size === 0) return;
    resetAll();
    state.questions = ALL_QUESTIONS.filter(q => state.bookmarks.has(q.globalId));
    state.modeLabel = 'Câu hỏi đã lưu';
    state.currentTopicFilter = 'bookmarks';
    beginQuiz();
  }

  // ===== HOME =====
  function renderHomeTopics() {
    const grid = document.getElementById('homeTopicsGrid');
    grid.innerHTML = QUIZ_DATA.topics.map(topic => `
      <button class="topic-card" onclick="App.startTopic(${topic.id})"
        style="--topic-color: ${topic.color}">
        <div class="topic-card-icon">${topic.icon}</div>
        <div class="topic-card-info">
          <div class="topic-card-name">${topic.name}</div>
          <div class="topic-card-title">${topic.title}</div>
          <div class="topic-card-count">${topic.questions.length} câu hỏi</div>
        </div>
      </button>
    `).join('');
  }

  function showHome() {
    state.mode = 'home';
    document.getElementById('homeScreen').style.display = 'flex';
    document.getElementById('mainLayout').style.display = 'none';
    setChapterBackground(null);
    document.getElementById('headerProgressText').textContent = 'Chọn chương để bắt đầu';
    document.getElementById('headerScore').style.display = 'none';
  }

  function returnHome() {
    const exitModal = document.getElementById('exitConfirmOverlay');
    if (exitModal) exitModal.remove();
    
    // Bỏ qua confirm mặc định vì đã có showExitConfirm
    // Check if launched with specific params (Lesson mode vs Practice mode)
    const params = new URLSearchParams(window.location.search);
    const hasParams = params.get('unit') && params.get('lesson');

    // Iframe return home
    if (window.parent && window.parent !== window && hasParams) {
      window.parent.postMessage({ type: 'RETURN_HOME' }, '*');
      return;
    }

    resetAll();
    showHome();
  }

  function resetAll() {
    state.questions = [];
    state.current = 0;
    state.selected = null;
    state.checked = false;
    state.isAnimating = false;
    state.results = {};
    state.score = { correct: 0, wrong: 0 };
    state.streak = 0;
    state.maxStreak = 0;
    state.currentTopicFilter = 'all';
    state.startTime = null;
    state.questionStartTime = null;
    state.timePerQuestion = {};
    state.aiHintsUsed = new Set();
    state.aiExplanationOpen = new Set();
  }

  // ===== START =====
  function startAll() {
    resetAll();
    state.questions = [...ALL_QUESTIONS];
    state.modeLabel = 'Toàn bộ 130 câu';
    state.currentTopicFilter = 'all';
    setChapterBackground(null);
    beginQuiz();
  }

  function startTopic(topicId) {
    resetAll();
    const topic = QUIZ_DATA.topics.find(t => t.id === topicId);
    if (!topic) return;
    state.questions = ALL_QUESTIONS.filter(q => q.topicId === topicId);
    state.modeLabel = topic.name;
    state.currentTopicFilter = topicId;
    setChapterBackground(topic);
    beginQuiz();
  }

  function beginQuiz() {
    state.mode = 'quiz';
    state.startTime = Date.now();
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('mainLayout').style.display = 'grid';
    renderTopicBar();
    renderSidebar();
    renderQuestion();
    updateHeader();
  }

  // ===== TOPIC BAR =====
  function renderTopicBar() {
    // Topic bar is replaced by top-topic-bar current info
  }

  function filterByTopic(topicId) {
    if (state.checked && !confirm('Chuyển chương sẽ reset tiến độ. Tiếp tục?')) return;
    state.currentTopicFilter = topicId;
    if (topicId === 'all') {
      state.questions = [...ALL_QUESTIONS];
      state.modeLabel = 'Toàn bộ 130 câu';
    } else {
      const topic = QUIZ_DATA.topics.find(t => t.id === topicId);
      state.questions = ALL_QUESTIONS.filter(q => q.topicId === topicId);
      state.modeLabel = topic ? topic.name : '';
      setChapterBackground(topic);
    }
    state.current = 0;
    state.selected = null;
    state.checked = false;
    state.isAnimating = false;
    renderTopicBar();
    renderSidebar();
    renderQuestion();
  }

  // ===== SIDEBAR =====
  function renderSidebar() {
    const total = state.questions.length;
    const answered = Object.keys(state.results).length;
    const pct = total > 0 ? answered / total : 0;

    // Counter
    document.getElementById('sidebarCurrent').textContent = state.current + 1;
    document.getElementById('sidebarTotal').textContent = total;

    // Progress ring
    const circumference = 213.6;
    const offset = circumference * (1 - pct);
    document.getElementById('progressRing').style.strokeDashoffset = offset;
    document.getElementById('progressPercent').textContent = Math.round(pct * 100) + '%';

    // Topic info
    const q = state.questions[state.current];
    if (q) {
      document.getElementById('sidebarTopicIcon').innerHTML = q.topicIcon;
      document.getElementById('sidebarTopicName').textContent = q.topicTitle;
    }

    // Score
    document.getElementById('scoreCorrect').textContent = state.score.correct;
    document.getElementById('scoreWrong').textContent = state.score.wrong;

    // Streak
    const streakEl = document.getElementById('streakDisplay');
    if (streakEl) {
      streakEl.textContent = state.streak > 0 ? state.streak : '—';
      streakEl.className = 'streak-value' + (state.streak >= 3 ? ' streak-fire' : '');
    }

    // Navigation buttons
    document.getElementById('btnPrev').disabled = state.current === 0;
    document.getElementById('btnNext').disabled = state.current === total - 1;

    // AI Tip panel
    renderAITip(q);

    // Dot map
    renderDotMap();
  }

  function renderAITip(q) {
    const tipEl = document.getElementById('aiTipPanel');
    if (!tipEl || !q) return;
    // Show a short contextual tip based on topic
    const tips = {
      1: ['Nhớ: CM Anh (quý tộc mới), CM Mỹ (chủ nô), CM Pháp (tư sản).', 'Các-ten & Xanh-đi-ca ở Pháp/Đức; Tơ-rớt ở Mỹ.', 'Triết học Ánh sáng = CM Pháp; Thanh giáo = CM Anh.'],
      2: ['30/12/1922 → Liên Xô ra đời từ 4 nước.', '12/1978 → Trung Quốc mở cửa; 12/1986 → VN Đổi mới.', 'Liên Xô tan rã 12/1991 sau 74 năm.'],
      3: ['Hải đảo bị xâm lược trước (TK XVI), lục địa sau (TK XIX).', 'Xiêm = nước duy nhất ở ĐNA không bị thuộc địa hóa.', 'Ra-ma IV mở cửa (1851); Ra-ma V cải cách toàn diện (1868).'],
      4: ['938: Cọc Bạch Đằng; 1785: Rạch Gầm; 1789: 29 vạn Thanh.', 'Lam Sơn: 1418 → 1427 (20 năm đô hộ Minh).', 'Tây Sơn: Nhạc – Huệ – Lữ; giải quyết cả giai cấp + dân tộc.'],
      5: ['Hồ Quý Ly (1396–1407): tiền giấy, hạn điền, hạn nô.', 'Luật Hồng Đức: 1483, 722 điều – đỉnh cao phong kiến VN.', 'Minh Mạng: 30 tỉnh + phủ Thừa Thiên (1831–1832).'],
      6: ['Biển Đông: 3,5 triệu km², nhộn nhịp thứ 2 thế giới.', 'UNCLOS 1982: 320 điều, 9 phụ lục, 5 vùng biển.', 'DOC ký 4/11/2002 tại Phnôm Pênh – ASEAN + Trung Quốc.'],
    };
    const topicTips = tips[q.topicId] || tips[1];
    const tip = topicTips[state.current % topicTips.length];
    tipEl.innerHTML = `<div class="ai-tip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg></div><div class="ai-tip-text">${tip}</div>`;
  }

  function renderDotMap() {
    const dots = document.getElementById('questionDots');
    dots.innerHTML = state.questions.map((q, i) => {
      let cls = 'q-dot';
      if (i === state.current) cls += ' active';
      else if (state.results[q.globalId] === true) cls += ' answered-correct';
      else if (state.results[q.globalId] === false) cls += ' answered-wrong';
      if (state.bookmarks.has(q.globalId)) cls += ' bookmarked';
      return `<div class="${cls}" onclick="App.jumpTo(${i})" title="Câu ${i+1}">${i+1}</div>`;
    }).join('');
  }

  function setupHeartSync() {
    window.addEventListener('message', handleParentMessage);
    window.parent.postMessage({ type: 'QUIZ_READY' }, '*');
  }

  function handleParentMessage(event) {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'HEARTS_SYNC') {
      state.maxHearts = Number(data.maxHearts) || state.maxHearts || 5;
      state.hearts = normalizeHeartCount(data.hearts, state.maxHearts);
      state.heartsSynced = true;
      state.isPremium = Boolean(data.isPremium);
      state.hasUsedFreeHeartRecovery = Boolean(data.hasUsedFreeHeartRecovery);
      state.canUseDailyRecovery = Boolean(data.canUseDailyRecovery);
      state.dailyRecoveryAmount = Number(data.dailyRecoveryAmount) || state.dailyRecoveryAmount || 5;
      state.isOutOfHeartsLocked = !state.isPremium && state.hearts <= 0;
      updateHeartsPill();
      return;
    }

    if (data.type === 'HEARTS_UPDATED') {
      state.maxHearts = Number(data.maxHearts) || state.maxHearts || 5;
      state.hearts = normalizeHeartCount(data.afterHearts ?? data.hearts, state.maxHearts);
      state.heartsSynced = true;
      state.isPremium = Boolean(data.isPremium);
      state.hasUsedFreeHeartRecovery = Boolean(data.hasUsedFreeHeartRecovery);
      state.canUseDailyRecovery = Boolean(data.canUseDailyRecovery);
      state.dailyRecoveryAmount = Number(data.dailyRecoveryAmount) || state.dailyRecoveryAmount || 5;
      state.isOutOfHeartsLocked = !state.isPremium && state.hearts <= 0;
      state.lastHeartLoss = data;
      updateHeartsPill(true);
      showHeartLossModal(data);
    }
  }

  function normalizeHeartCount(value, maxHearts = 5) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(maxHearts, parsed));
  }

  function renderHeartsPill() {
    const countText = !state.heartsSynced ? '...' : (state.isPremium ? '∞' : state.hearts);
    const label = !state.heartsSynced
      ? 'Đang đồng bộ năng lượng'
      : state.isPremium
      ? 'Năng lượng vô hạn'
      : `${state.hearts}/${state.maxHearts} năng lượng`;
    const empty = state.heartsSynced && !state.isPremium && state.hearts <= 0;
    return `
      <div class="quiz-hearts-pill${empty ? ' is-empty' : ''}" id="quizHeartsPill" aria-label="${label}" title="${label}">
        <svg class="quiz-heart-icon-svg quiz-energy-icon-svg" width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="1" y="2" width="23" height="14" rx="5" fill="url(#quizEnergyGrad)" opacity="${empty ? '0.42' : '1'}"/>
          <rect x="3.5" y="4.5" width="${empty ? '4' : '18'}" height="9" rx="3.2" fill="${empty ? '#ef4444' : 'rgba(255,255,255,0.24)'}"/>
          <path d="M26 6V12" stroke="${empty ? '#ef4444' : '#d97706'}" stroke-width="2.7" stroke-linecap="round"/>
          <path d="M13.3 4.7 9.3 10.2h3.05l-1.05 3.35 4.25-5.65h-3.05l.8-3.2Z" fill="white"/>
          <defs>
            <linearGradient id="quizEnergyGrad" x1="1" y1="2" x2="24" y2="16" gradientUnits="userSpaceOnUse">
              <stop stop-color="#fbbf24"/>
              <stop offset="1" stop-color="#d97706"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="quiz-heart-count" id="quizHeartCount">${countText}</span>
      </div>
    `;
  }

  function updateHeartsPill(pulse = false) {
    const pill = document.getElementById('quizHeartsPill');
    const count = document.getElementById('quizHeartCount');
    if (!pill || !count) return;
    const countText = state.isPremium ? '∞' : state.hearts;
    const label = state.isPremium ? 'Năng lượng vô hạn' : `${state.hearts}/${state.maxHearts} năng lượng`;
    count.textContent = countText;
    pill.setAttribute('aria-label', label);
    pill.setAttribute('title', label);
    pill.classList.toggle('is-empty', !state.isPremium && state.hearts <= 0);
    if (pulse) {
      pill.classList.remove('heart-pulse');
      void pill.offsetWidth;
      pill.classList.add('heart-pulse');
    }
  }

  function isRetryAllowedQuestion(q) {
    return Boolean(q && q.retry);
  }

  function canSubmitQuestionNow(q) {
    return state.isPremium || !state.isOutOfHeartsLocked || isRetryAllowedQuestion(q);
  }

  function showOutOfHeartsProGate() {
    showHeartLossModal({
      beforeHearts: 0,
      afterHearts: 0,
      hearts: 0,
      maxHearts: state.maxHearts,
      lost: false,
      recoveryOffer: state.canUseDailyRecovery ? 'daily' : 'pro',
      blockedNewQuestion: true
    });
  }

  function requestHeartLoss(q, reason = 'wrong_answer') {
    window.parent.postMessage({
      type: 'LOSE_HEART',
      questionId: q.globalId,
      retry: Boolean(q.retry),
      questionType: q.type || 'quiz',
      reason
    }, '*');
  }

  function getQuestionKey(q) {
    return q ? (q.retryOf || q.globalId) : '';
  }

  function isAIExplanationOpen(q) {
    return state.aiExplanationOpen.has(getQuestionKey(q));
  }

  function buildAIExplanationIfOpen(q) {
    return isAIExplanationOpen(q) ? buildAIExplanation(q) : '';
  }

  function renderQuestionActions(q) {
    const key = getQuestionKey(q);
    const bookmarked = state.bookmarks.has(q.globalId);
    const aiOpen = state.aiExplanationOpen.has(key);
    const usedHint = state.aiHintsUsed.has(key);
    return `
      <div class="question-actions" aria-label="Công cụ câu hỏi">
        <button class="question-action-button question-action-flag${bookmarked ? ' active' : ''}" id="btnBookmark" onclick="App.toggleBookmark('${q.globalId}')" aria-label="${bookmarked ? 'Bỏ lưu câu hỏi' : 'Lưu câu hỏi'}" title="${bookmarked ? 'Bỏ lưu câu hỏi' : 'Lưu câu hỏi'}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V5.8c0-.7.5-1.25 1.2-1.25h8.45c.45 0 .85.18 1.15.5l.75.78c.3.32.72.5 1.16.5H19v9.7h-1.32c-.44 0-.86-.18-1.16-.5l-.76-.78a1.57 1.57 0 0 0-1.14-.5H6.2"/></svg>
        </button>
        <button class="question-action-button question-action-ai${aiOpen ? ' active' : ''}${usedHint ? ' used' : ''}" id="btnAIHint" onclick="App.handleAIHintClick()" aria-label="Mở Giải thích AI" title="${state.checked ? 'Xem Giải thích AI' : 'Nhận gợi ý AI (-1 năng lượng)'}">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-5.9-1.52a.5.5 0 0 1 0-.96l5.9-1.52A2 2 0 0 0 9.94 8.5l1.52-5.9a.5.5 0 0 1 .96 0l1.52 5.9a2 2 0 0 0 1.44 1.56l5.9 1.52a.5.5 0 0 1 0 .96l-5.9 1.52a2 2 0 0 0-1.44 1.44l-1.52 5.9a.5.5 0 0 1-.96 0z"/><path d="M19 2v4"/><path d="M21 4h-4"/></svg>
        </button>
      </div>
    `;
  }

  function renderFeedbackZone(q, resultBannerHtml = '') {
    const feedbackZone = document.getElementById('feedbackZone');
    if (!feedbackZone || !q) return;
    feedbackZone.innerHTML = `${resultBannerHtml}${buildAIExplanationIfOpen(q)}${state.checked ? buildNextAction() : ''}`;
  }

  function handleAIHintClick() {
    const q = state.questions[state.current];
    if (!q) return;
    const key = getQuestionKey(q);

    if (!state.checked && !state.aiHintsUsed.has(key)) {
      if (!canSubmitQuestionNow(q)) {
        showOutOfHeartsProGate();
        return;
      }
      state.aiHintsUsed.add(key);
      if (!state.isPremium) requestHeartLoss(q, 'ai_hint');
    }

    state.aiExplanationOpen.add(key);
    const btn = document.getElementById('btnAIHint');
    if (btn) btn.classList.add('active', 'used');
    renderFeedbackZone(q);
    const feedbackZone = document.getElementById('feedbackZone');
    if (feedbackZone) {
      setTimeout(() => feedbackZone.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }

  function renderHeartLossPreview(beforeHearts, afterHearts) {
    const slots = 5;
    const didLose = beforeHearts > afterHearts;
    const filledSlots = didLose ? slots - 1 : Math.min(slots, Math.max(0, afterHearts));

    return Array.from({ length: slots }, (_, i) => {
      const cls = i < filledSlots ? 'filled' : (didLose && i === slots - 1 ? 'lost' : 'empty');
      const label = cls === 'filled' ? 'năng lượng còn' : (cls === 'lost' ? 'năng lượng vừa mất' : 'năng lượng trống');
      return `<span class="heart-icon ${cls}" aria-label="${label}">♥</span>`;
    }).join('');
  }

  // ===== RENDER QUESTION =====
  function renderQuestion() {
    const q = state.questions[state.current];
    if (!q) { showFinish(); return; }

    state.selected = null;
    state.checked = false;
    state.isAnimating = false;
    state.questionStartTime = Date.now();

    state.fillBlankAnswers = [];
    state.activeBlankIdx = null;
    state.fillBlankChecked = false;
    state.matchingSelectedA = null;
    state.matchingAnswers = {};
    state.matchingPairs = {};
    state.matchingChecked = false;
    state.matchingLostHeart = false;

    const zone = document.getElementById('questionZone');
    const letters = ['A', 'B', 'C', 'D'];
    const isAnswered = state.results.hasOwnProperty(q.globalId) && !q.retry;
    const isBookmarked = state.bookmarks.has(q.globalId);
    const progressPercent = Math.max(4, Math.min(100, ((state.current + 1) / state.questions.length) * 100));

    let contentHtml = '';

    if (q.type === 'fill_blank') {
      let textHtml = q.text;
      q.answer.forEach((_, idx) => {
        textHtml = textHtml.replace(`[_${idx}_]`, `<span class="blank-dropzone" id="blank-${idx}" onclick="App.handleBlankClick(${idx})">...</span>`);
      });
      contentHtml = `
        <div class="question-card fill-blank-card">
          <div class="question-topline">
            <div class="fill-blank-text">${textHtml}</div>
            ${renderQuestionActions(q)}
          </div>
          <div class="word-blocks-pool" id="wordBlocksPool">
            ${q.options.map((opt, i) => `<div class="word-block" id="wordBlock-${i}" onclick="App.handleWordClick(${i})">${opt}</div>`).join('')}
          </div>
          <div class="fill-blank-hint" id="fillBlankHint">Chọn một ô trống trước, sau đó chọn khối từ để điền.</div>
          <div class="fill-blank-actions" id="fillBlankActions"></div>
        </div>
      `;
    } else if (q.type === 'matching') {
      contentHtml = `
        <div class="question-card matching-question-card">
          <div class="question-topline">
            <div class="question-text">${q.question}</div>
            ${renderQuestionActions(q)}
          </div>
          <div class="matching-stage" id="matchingStage">
            <svg class="matching-lines" id="matchingLines" aria-hidden="true"></svg>
            <div class="matching-container">
              <div class="matching-col" id="matchColA">
                ${q.columnA.map((text, i) => `<div class="match-item" id="matchA-${i}" onclick="App.handleMatchAClick(${i})">${text}</div>`).join('')}
              </div>
              <div class="matching-col" id="matchColB">
                ${q.columnB.map((text, i) => `<div class="match-item" id="matchB-${i}" onclick="App.handleMatchBClick(${i})">${text}</div>`).join('')}
              </div>
            </div>
          </div>
          <div class="matching-actions" id="matchingActions"></div>
        </div>
      `;
    } else {
      contentHtml = `
        <div class="question-card">
          <div class="question-topline">
            <div class="question-text">${q.question}</div>
            ${renderQuestionActions(q)}
          </div>
        </div>
        <div class="options-grid" id="optionsGrid">
          ${q.options.map((opt, i) => `
            <div class="option-item" id="opt-${i}" onclick="App.selectOption(${i})" role="button" tabindex="0">
              <div class="option-letter">${letters[i]}</div>
              <div class="option-text">${opt}</div>
              <div class="option-status-icon" id="optStatus-${i}"></div>
            </div>
          `).join('')}
        </div>
        <div class="option-actions" id="optionActions"></div>
      `;
    }

    zone.innerHTML = `
      <div class="question-header progress-question-header">
        <button class="quiz-close-button" onclick="App.showExitConfirm()" aria-label="Thoát bài học" title="Thoát bài học">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
        <div class="quiz-progress-shell" role="progressbar" aria-label="Tiến độ bài học" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progressPercent)}">
          <div class="quiz-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        ${renderHeartsPill()}
      </div>
      ${contentHtml}
      <div id="feedbackZone"></div>
    `;

    if (isAnswered) {
      state.checked = true;
      restoreAnswerState(q);
    }

    renderSidebar();
    updateHeader();
    document.querySelector('.content-area').scrollTop = 0;
  }

  function restoreAnswerState(q) {
    if (!q.type || q.type === 'quiz') {
      const correctIdx = getCorrectAnswerIndex(q);
      q.options.forEach((_, i) => {
        const el = document.getElementById(`opt-${i}`);
        if (!el) return;
        el.classList.add('disabled');
        if (i === correctIdx) {
          el.classList.add('correct');
          const statusEl = document.getElementById(`optStatus-${i}`);
          if (statusEl) statusEl.innerHTML = svgCheck();
        }
      });
    } else if (q.type === 'fill_blank') {
      q.answer.forEach((optIdx, blankIdx) => {
        const el = document.getElementById(`blank-${blankIdx}`);
        if (el) {
          el.innerText = q.options[optIdx];
          el.classList.add('correct-zone', 'filled');
        }
      });
      document.querySelectorAll('.word-block').forEach(el => el.classList.add('used'));
    } else if (q.type === 'matching') {
      q.columnA.forEach((_, i) => {
        const elA = document.getElementById(`matchA-${i}`);
        const elB = document.getElementById(`matchB-${q.answer[i]}`);
        if (elA) elA.classList.add('matched');
        if (elB) elB.classList.add('matched');
      });
    }

    renderFeedbackZone(q);
  }

  function selectOption(idx) {
    if (state.checked || state.isAnimating) return;

    state.selected = idx;
    document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected', 'selected-pending'));
    const selectedEl = document.getElementById(`opt-${idx}`);
    if (selectedEl) selectedEl.classList.add('selected', 'selected-pending');

    const actions = document.getElementById('optionActions');
    if (actions) {
      actions.innerHTML = `<button class="option-check-button" onclick="App.checkSelectedOption()">KIỂM TRA</button>`;
    }
  }

  function checkSelectedOption() {
    if (state.checked || state.isAnimating || state.selected === null || state.selected === undefined) return;

    state.isAnimating = true;
    state.checked = true;

    const q = state.questions[state.current];
    if (!canSubmitQuestionNow(q)) {
      state.isAnimating = false;
      state.checked = false;
      showOutOfHeartsProGate();
      return;
    }
    const selectedIdx = state.selected;
    const realAnswerIdx = getCorrectAnswerIndex(q);
    if (!hasValidCorrectAnswer(q)) {
      console.warn('[Quiz] Không xác định được đáp án đúng cho câu hỏi:', q);
      state.isAnimating = false;
      state.checked = false;
      return;
    }
    const correct = selectedIdx === realAnswerIdx;
    const elapsed = state.questionStartTime ? Math.round((Date.now() - state.questionStartTime) / 1000) : 0;
    state.timePerQuestion[q.globalId] = elapsed;

    recordAnswerResult(q, correct);

    const selectedEl = document.getElementById(`opt-${selectedIdx}`);
    if (selectedEl) selectedEl.classList.add('selecting');

    const actions = document.getElementById('optionActions');
    if (actions) actions.innerHTML = '';

    setTimeout(() => {
      revealAnswer(q, selectedIdx, correct);
      state.isAnimating = false;
    }, 180);
  }

  function recordAnswerResult(q, correct) {
    const isRetry = Boolean(q.retry);
    const hasResult = state.results.hasOwnProperty(q.globalId);
    const isFirstTime = !hasResult && !isRetry;

    if (isFirstTime) {
      state.results[q.globalId] = correct;
      if (correct) {
        state.score.correct++;
        state.streak++;
        if (state.streak > state.maxStreak) state.maxStreak = state.streak;
        removeWrongQuestion(q.globalId);
      } else {
        state.score.wrong++;
        state.streak = 0;
        rememberWrongQuestion(q.globalId);
        requestHeartLoss(q);
        pushRetryQuestion(q);
      }
      return;
    }

    if (correct) {
      state.results[q.globalId] = true;
      state.streak++;
      if (state.streak > state.maxStreak) state.maxStreak = state.streak;
      removeWrongQuestion(q.globalId);
    } else {
      state.results[q.globalId] = false;
      state.streak = 0;
      rememberWrongQuestion(q.globalId);
      requestHeartLoss(q);
      pushRetryQuestion(q);
    }
  }

  function pushRetryQuestion(q) {
    const retryQuestion = { ...q, retry: true, retryOf: q.retryOf || q.globalId };
    state.questions.push(retryQuestion);
  }

  function rememberWrongQuestion(globalId) {
    try {
      const wrongs = JSON.parse(localStorage.getItem('ha_wrong_questions') || '[]');
      if (!wrongs.includes(globalId)) {
        wrongs.push(globalId);
        localStorage.setItem('ha_wrong_questions', JSON.stringify(wrongs));
      }
    } catch(e) {}
  }

  function removeWrongQuestion(globalId) {
    try {
      const wrongs = JSON.parse(localStorage.getItem('ha_wrong_questions') || '[]');
      const updated = wrongs.filter(id => id !== globalId);
      localStorage.setItem('ha_wrong_questions', JSON.stringify(updated));
    } catch(e) {}
  }

  function revealAnswer(q, selectedIdx, correct) {
    const letters = ['A', 'B', 'C', 'D'];

    const realAnswerIdx = getCorrectAnswerIndex(q);
    if (!hasValidCorrectAnswer(q)) {
      console.warn('[Quiz] Không thể tô đáp án đúng vì dữ liệu đáp án không hợp lệ:', q);
    }

    // Disable all options
    q.options.forEach((_, i) => {
      const el = document.getElementById(`opt-${i}`);
      if (!el) return;
      el.classList.remove('selecting', 'selected-pending');
      el.classList.add('disabled');

      if (i === realAnswerIdx) {
        el.classList.add('correct');
        const statusEl = document.getElementById(`optStatus-${i}`);
        if (statusEl) statusEl.innerHTML = svgCheck();
      } else if (i === selectedIdx && !correct) {
        el.classList.add('wrong');
        const statusEl = document.getElementById(`optStatus-${i}`);
        if (statusEl) statusEl.innerHTML = svgX();
      }
    });

    const resultBannerHtml = buildResultBanner(correct, q, letters, realAnswerIdx);
    renderFeedbackZone(q, resultBannerHtml);

    renderSidebar();
    updateHeader();

    if (shouldShowFinishAfterAnswer()) {
      setTimeout(showFinish, 600);
    }

    // Auto-scroll to the feedback card so the answer area feels connected.
    const feedbackZone = document.getElementById('feedbackZone');
    setTimeout(() => {
      if (feedbackZone) feedbackZone.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
  }

  // ===== RESULT BANNER =====
  function buildResultBanner(correct, q, letters, realAnswerIdx) {
    if (correct) {
      const streakMsg = state.streak >= 3 ? `Chuỗi ${state.streak} câu đúng!` : 'Chính xác!';
      const streakSub = state.streak >= 5
        ? 'Bạn đang học rất tốt, tiếp tục nhé!'
        : state.streak >= 3
        ? 'Bạn đang trong phong độ xuất sắc!'
        : 'Câu trả lời hoàn toàn chính xác.';
      return `
        <div class="result-banner correct-banner">
          <div class="result-banner-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
          <div class="result-banner-text">
            <strong>${streakMsg}</strong>
            <span>${streakSub}</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="result-banner wrong-banner">
          <div class="result-banner-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
          <div class="result-banner-text">
            <strong>Chưa đúng!</strong>
            <span>Đáp án đúng: <em>${(q.options && q.options[realAnswerIdx] !== undefined) ? (letters[realAnswerIdx] + '. ' + q.options[realAnswerIdx]) : 'Hãy xem giải thích AI'}</em></span>
          </div>
        </div>
      `;
    }
  }

  function hasNextQuestion() {
    return state.current < state.questions.length - 1;
  }

  function shouldShowFinishAfterAnswer() {
    return state.checked && !hasNextQuestion();
  }

  function buildNextAction() {
    if (!hasNextQuestion() || shouldShowFinishAfterAnswer()) return '';
    return `
      <div class="feedback-next-action">
        <button class="feedback-next-button" onclick="App.navigate(1)" aria-label="Sang câu tiếp theo">
          <span>Tiếp theo</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
    `;
  }

  // ===== AI EXPLANATION =====
  function buildAIExplanation(q) {
    const letters = ['A', 'B', 'C', 'D'];
    return `
      <div class="ai-explanation">
        <div class="ai-header">
          <div class="ai-logo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg></div>
          <div class="ai-title-group">
            <div class="ai-title">Giải thích bởi AI</div>
          </div>
        </div>
        <div class="ai-body">
          <div class="ai-explanation-text">${q.explanation}</div>
          ${q.timeline ? `
          <div class="ai-timeline">
            <div class="ai-timeline-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;vertical-align:-1px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Dòng thời gian
            </div>
            ${q.timeline.map(t => `
              <div class="timeline-item">
                <div class="timeline-year">${t.year}</div>
                <div class="timeline-event">${t.event}</div>
              </div>
            `).join('')}
          </div>` : ''}
          ${q.memotip ? `
          <div class="ai-memotip">
            <span class="memotip-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M20 12h2"/><path d="M19.78 19.78l-1.42-1.42"/><path d="M12 22v-2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M2 12h2"/><path d="M19.78 4.22l-1.42 1.42"/><circle cx="12" cy="12" r="5"/></svg></span>
            <span class="memotip-text"><strong>Mẹo nhớ:</strong> ${q.memotip}</span>
          </div>` : ''}
        </div>
        <div class="ai-footer">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Tổng hợp từ SGK Lịch sử 11 – Kết nối tri thức · NXB Giáo dục VN
        </div>
      </div>
    `;
  }

  // ===== NAVIGATE =====
  function navigate(dir) {
    const newIdx = state.current + dir;
    if (newIdx < 0 || newIdx >= state.questions.length) {
      if (dir > 0 && newIdx >= state.questions.length) showFinish();
      return;
    }
    jumpTo(newIdx);
  }

  function jumpTo(idx) {
    if (idx < 0 || idx >= state.questions.length) return;
    state.current = idx;
    state.selected = null;
    state.checked = false;
    state.isAnimating = false;
    renderQuestion();
    document.querySelector('.content-area').scrollTop = 0;
  }

  // ===== FINISH =====
  function showFinish() {
    const existing = document.getElementById('finishCelebrationOverlay');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'finishCelebrationOverlay';
    modal.className = 'lesson-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; display: flex; align-items: center; justify-content: center; background: rgba(248, 250, 255, 0.95);';
    modal.innerHTML = `
      <div class="lesson-modal-card is-finish" role="dialog" aria-modal="true" aria-labelledby="finishModalTitle">
        <div class="lesson-modal-hero" aria-hidden="true">
          <img src="/quiz/assets/congratulations_party.png" alt="" style="max-width: 100%; height: auto;" />
        </div>
        <h3 class="lesson-modal-title" id="finishModalTitle">Chúc mừng!</h3>
        <p class="lesson-modal-subtitle">Bạn đã hoàn thành bài học. Tiếp tục để nhận thành tích và quay lại lộ trình.</p>
        <button class="lesson-modal-primary" onclick="App.triggerQuizFinished()">TIẾP TỤC</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function triggerQuizFinished() {
    const modal = document.getElementById('finishCelebrationOverlay');
    if (modal) modal.remove();
    
    // Iframe message
    const params = new URLSearchParams(window.location.search);
    const hasParams = params.get('unit') && params.get('lesson');

    if (window.parent && window.parent !== window && hasParams) {
      window.parent.postMessage({ type: 'QUIZ_FINISHED', correct: state.score.correct, total: state.questions.length, maxStreak: state.maxStreak }, '*');
    } else {
      renderFinishStats();
    }
  }

  function renderFinishStats() {
    state.mode = 'finish';
    const total = state.questions.length;
    const pct = total > 0 ? Math.round((state.score.correct / total) * 100) : 0;
    const totalTime = state.startTime ? Math.round((Date.now() - state.startTime) / 1000) : 0;
    const avgTime = Object.values(state.timePerQuestion).length > 0
      ? Math.round(Object.values(state.timePerQuestion).reduce((a,b)=>a+b,0) / Object.values(state.timePerQuestion).length)
      : 0;

    const svgTrophy = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent-amber)"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;

    let grade = pct >= 90 ? 'Xuất sắc' : pct >= 75 ? 'Giỏi' : pct >= 60 ? 'Khá' : pct >= 40 ? 'Trung bình' : 'Cần cố gắng';
    let message = pct >= 90 ? 'Bạn đã nắm vững toàn bộ kiến thức Lịch sử 11!'
      : pct >= 75 ? 'Rất tốt! Xem lại những câu sai để đạt điểm cao hơn.'
      : pct >= 60 ? 'Khá tốt! Đọc kỹ phần giải thích AI để hiểu sâu hơn.'
      : pct >= 40 ? 'Hãy ôn lại từng chương, đặc biệt chú ý dòng thời gian.'
      : 'Đừng nản! Làm lại từng chương nhỏ sẽ giúp bạn tiến bộ nhanh.';

    const zone = document.getElementById('questionZone');
    zone.innerHTML = `
      <div class="finish-screen">
        <div class="finish-trophy" style="animation: bounce-trophy 0.8s cubic-bezier(0.34,1.56,0.64,1)">${svgTrophy}</div>
        <div class="finish-grade">${grade}</div>
        <div class="finish-title">Hoàn thành ${state.modeLabel}!</div>
        <p class="finish-subtitle">${message}</p>

        <div class="finish-stats">
          <div class="finish-stat-card">
            <div class="finish-stat-num" style="color:var(--accent-green)">${state.score.correct}</div>
            <div class="finish-stat-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:2px; vertical-align:-2px;"><polyline points="20 6 9 17 4 12"/></svg> Câu đúng
            </div>
          </div>
          <div class="finish-stat-card">
            <div class="finish-stat-num" style="color:var(--accent-red)">${state.score.wrong}</div>
            <div class="finish-stat-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:2px; vertical-align:-2px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Câu sai
            </div>
          </div>
          <div class="finish-stat-card">
            <div class="finish-stat-num" style="background:var(--gradient-ai);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${pct}%</div>
            <div class="finish-stat-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:2px; vertical-align:-2px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Điểm số
            </div>
          </div>
        </div>

        <div class="finish-extras">
          <div class="finish-extra-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            Chuỗi dài nhất: <strong>${state.maxStreak} câu</strong>
          </div>
          <div class="finish-extra-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Tổng thời gian: <strong>${formatTime(totalTime)}</strong>
          </div>
          <div class="finish-extra-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Trung bình/câu: <strong>${avgTime}s</strong>
          </div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:8px;">
          <button class="btn-restart" onclick="App.restartQuiz()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="1,4 1,10 7,10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 .49-4.95"></path>
            </svg>
            Làm lại
          </button>
          <button class="btn-reset" style="padding:14px 24px;font-size:14px;font-weight:600;" onclick="App.returnHome()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Trang chủ
          </button>
        </div>
      </div>
    `;

    document.getElementById('btnPrev').disabled = true;
    document.getElementById('btnNext').disabled = true;
    renderSidebar();
    updateHeader();

    // Iframe message logic has moved to triggerQuizFinished
  }

  function restartQuiz() {
    const qs = [...state.questions];
    const label = state.modeLabel;
    resetAll();
    state.questions = qs;
    state.modeLabel = label;
    state.mode = 'quiz';
    state.startTime = Date.now();
    renderTopicBar();
    renderSidebar();
    renderQuestion();
  }

  // ===== HEADER =====
  function updateHeader() {
    const total = state.questions.length;
    const answered = Object.keys(state.results).length;
    const pct = total > 0 ? Math.round((state.score.correct / Math.max(answered,1)) * 100) : 0;
    const headerProgressText = document.getElementById('headerProgressText');
    if (headerProgressText) {
      headerProgressText.textContent = `${state.modeLabel} · ${answered}/${total} đã làm`;
    }
    const scoreEl = document.getElementById('headerScore');
    if (scoreEl) {
      scoreEl.style.display = answered > 0 ? 'flex' : 'none';
      const scoreText = document.getElementById('headerScoreText');
      if (scoreText) scoreText.textContent = `${pct}%`;
    }
  }

  // ===== KEYBOARD =====
  function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (state.mode !== 'quiz') return;
      const key = e.key;

      // Navigation (only when checked or not selected)
      if (key === 'ArrowRight' || key === 'ArrowLeft') {
        e.preventDefault();
        navigate(key === 'ArrowRight' ? 1 : -1);
        return;
      }

      // Don't allow key-select after checking
      if (state.checked) return;

      // Option selection
      const map = { 'a': 0, 'A': 0, '1': 0, 'b': 1, 'B': 1, '2': 1, 'c': 2, 'C': 2, '3': 2, 'd': 3, 'D': 3, '4': 3 };
      if (map.hasOwnProperty(key)) {
        e.preventDefault();
        selectOption(map[key]);
      }
    });
  }

  // ===== HELPERS =====
  function svgCheck() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5">
      <polyline points="20 6 9 17 4 12"></polyline></svg>`;
  }
  function svgX() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  }
  function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds/60)}m ${seconds%60}s`;
  }

  // ===== PUBLIC =====
  // ===== COMPLEX INTERACTIONS =====
  function handleWordClick(wordIdx) {
    if (state.checked || state.fillBlankChecked) return;
    const q = state.questions[state.current];
    const wordEl = document.getElementById(`wordBlock-${wordIdx}`);
    if (!wordEl || wordEl.classList.contains('used')) return;

    if (state.activeBlankIdx === null || state.activeBlankIdx === undefined) {
      showFillBlankHint('Hãy chọn ô trống cần điền trước nhé.');
      const firstEmpty = q.answer.findIndex((_, idx) => state.fillBlankAnswers[idx] === undefined);
      const firstEmptyEl = document.getElementById(`blank-${firstEmpty}`);
      if (firstEmptyEl) {
        firstEmptyEl.classList.add('hint-pulse');
        setTimeout(() => firstEmptyEl.classList.remove('hint-pulse'), 650);
      }
      return;
    }

    const blankIdx = state.activeBlankIdx;
    const oldWordIdx = state.fillBlankAnswers[blankIdx];
    if (oldWordIdx !== undefined) {
      const oldWordEl = document.getElementById(`wordBlock-${oldWordIdx}`);
      if (oldWordEl) oldWordEl.classList.remove('used');
    }

    state.fillBlankAnswers[blankIdx] = wordIdx;
    wordEl.classList.add('used');

    const blankEl = document.getElementById(`blank-${blankIdx}`);
    if (blankEl) {
      blankEl.innerText = q.options[wordIdx];
      blankEl.classList.add('filled');
      blankEl.classList.remove('active-zone', 'wrong-zone', 'correct-zone');
    }

    state.activeBlankIdx = null;
    showFillBlankHint('Tốt lắm! Tiếp tục chọn ô trống còn lại.');
    updateFillBlankCheckButton();
  }

  function handleBlankClick(blankIdx) {
    if (state.checked || state.fillBlankChecked) return;

    const wordIdx = state.fillBlankAnswers[blankIdx];
    if (wordIdx !== undefined) {
      state.fillBlankAnswers[blankIdx] = undefined;
      const blankEl = document.getElementById(`blank-${blankIdx}`);
      if (blankEl) {
        blankEl.innerText = '...';
        blankEl.classList.remove('filled', 'active-zone', 'wrong-zone', 'correct-zone');
      }
      const wordEl = document.getElementById(`wordBlock-${wordIdx}`);
      if (wordEl) wordEl.classList.remove('used');
      state.activeBlankIdx = blankIdx;
    } else {
      state.activeBlankIdx = blankIdx;
    }

    document.querySelectorAll('.blank-dropzone').forEach(el => el.classList.remove('active-zone'));
    const selectedBlank = document.getElementById(`blank-${blankIdx}`);
    if (selectedBlank) selectedBlank.classList.add('active-zone');
    showFillBlankHint('Bây giờ chọn khối từ phù hợp cho ô này.');
    updateFillBlankCheckButton();
  }

  function updateFillBlankCheckButton() {
    const q = state.questions[state.current];
    const actions = document.getElementById('fillBlankActions');
    if (!q || !actions) return;

    const isComplete = q.answer.every((_, idx) => state.fillBlankAnswers[idx] !== undefined);
    actions.innerHTML = isComplete && !state.fillBlankChecked
      ? `<button class="fill-blank-check-button" onclick="App.checkFillBlankAnswer()">KIỂM TRA</button>`
      : '';
  }

  function showFillBlankHint(message) {
    const hint = document.getElementById('fillBlankHint');
    if (!hint) return;
    hint.textContent = message;
    hint.classList.add('active');
    setTimeout(() => hint.classList.remove('active'), 900);
  }

  function checkFillBlankAnswer() {
    if (state.checked || state.fillBlankChecked) return;
    const q = state.questions[state.current];
    const isComplete = q.answer.every((_, idx) => state.fillBlankAnswers[idx] !== undefined);
    if (!isComplete) {
      showFillBlankHint('Bạn cần điền đủ tất cả ô trước khi kiểm tra.');
      return;
    }

    state.fillBlankChecked = true;
    let isCorrect = true;
    for (let i = 0; i < q.answer.length; i++) {
      const blankEl = document.getElementById(`blank-${i}`);
      const correct = state.fillBlankAnswers[i] === q.answer[i];
      if (!correct) isCorrect = false;
      if (blankEl) {
        blankEl.classList.remove('active-zone');
        blankEl.classList.add(correct ? 'correct-zone' : 'wrong-zone');
      }
    }
    document.querySelectorAll('.word-block').forEach(el => el.classList.add('locked'));

    if (isCorrect) {
      submitComplexAnswer(true);
      return;
    }

    submitComplexAnswer(false, { skipRestore: true, skipFeedback: true });
    const feedbackZone = document.getElementById('feedbackZone');
    if (feedbackZone) {
      feedbackZone.innerHTML = buildFillBlankResultBanner(false, q) + buildAIExplanation(q);
    }
  }

  function buildFillBlankResultBanner(correct, q) {
    if (correct) return buildResultBanner(true, q, ['A', 'B', 'C', 'D']);
    const correctText = q.answer.map((optIdx, blankIdx) => `Ô ${blankIdx + 1}: ${q.options[optIdx]}`).join(' · ');
    return `
      <div class="result-banner wrong-banner">
        <div class="result-banner-icon">${svgX()}</div>
        <div class="result-banner-text">
          <strong>Chưa đúng!</strong>
          <span>Đáp án đúng: <em>${correctText}</em> — Đọc giải thích bên dưới nhé.</span>
        </div>
      </div>
    `;
  }

  function handleMatchAClick(idx) {
    if (state.checked || state.matchingChecked) return;
    const el = document.getElementById(`matchA-${idx}`);
    if (!el) return;

    document.querySelectorAll('#matchColA .match-item').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    state.matchingSelectedA = idx;
  }

  function handleMatchBClick(idxB) {
    if (state.checked || state.matchingChecked || state.matchingSelectedA === null) return;

    const idxA = state.matchingSelectedA;
    const elA = document.getElementById(`matchA-${idxA}`);
    const elB = document.getElementById(`matchB-${idxB}`);
    if (!elA || !elB) return;

    Object.entries(state.matchingPairs).forEach(([aIdx, bIdx]) => {
      if (Number(bIdx) === idxB && Number(aIdx) !== idxA) {
        delete state.matchingPairs[aIdx];
        const otherA = document.getElementById(`matchA-${aIdx}`);
        if (otherA) otherA.classList.remove('paired');
      }
    });

    state.matchingPairs[idxA] = idxB;
    state.matchingSelectedA = null;

    elA.classList.remove('selected');
    elA.classList.add('paired');
    elB.classList.add('paired');

    refreshMatchingVisuals();
  }

  function refreshMatchingVisuals() {
    syncMatchingPairClasses();
    drawMatchingLines();
    updateMatchingCheckButton();
  }

  function syncMatchingPairClasses() {
    document.querySelectorAll('.match-item').forEach(el => {
      if (!state.matchingChecked) {
        el.classList.remove('paired', 'correct-match', 'wrong-match-final');
      }
    });

    Object.entries(state.matchingPairs).forEach(([idxA, idxB]) => {
      const elA = document.getElementById(`matchA-${idxA}`);
      const elB = document.getElementById(`matchB-${idxB}`);
      if (elA) elA.classList.add('paired');
      if (elB) elB.classList.add('paired');
    });
  }

  function drawMatchingLines() {
    const stage = document.getElementById('matchingStage');
    const svg = document.getElementById('matchingLines');
    if (!stage || !svg) return;

    const stageRect = stage.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);
    svg.innerHTML = Object.entries(state.matchingPairs).map(([idxA, idxB]) => {
      const elA = document.getElementById(`matchA-${idxA}`);
      const elB = document.getElementById(`matchB-${idxB}`);
      if (!elA || !elB) return '';

      const rectA = elA.getBoundingClientRect();
      const rectB = elB.getBoundingClientRect();
      const x1 = rectA.right - stageRect.left;
      const y1 = rectA.top + rectA.height / 2 - stageRect.top;
      const x2 = rectB.left - stageRect.left;
      const y2 = rectB.top + rectB.height / 2 - stageRect.top;
      const status = state.matchingChecked
        ? (state.questions[state.current].answer[Number(idxA)] === Number(idxB) ? 'correct' : 'wrong')
        : 'pending';

      return `<path class="matching-line ${status}" d="M ${x1} ${y1} C ${x1 + 55} ${y1}, ${x2 - 55} ${y2}, ${x2} ${y2}" />`;
    }).join('');
  }

  function updateMatchingCheckButton() {
    const q = state.questions[state.current];
    const actions = document.getElementById('matchingActions');
    if (!actions || !q) return;

    const isComplete = Object.keys(state.matchingPairs).length === q.columnA.length;
    actions.innerHTML = isComplete && !state.matchingChecked
      ? `<button class="matching-check-button" id="matchingCheckButton" onclick="App.checkMatchingAnswer()">KIỂM TRA</button>`
      : '';
  }

  function checkMatchingAnswer() {
    if (state.checked || state.matchingChecked) return;
    const q = state.questions[state.current];
    const isComplete = Object.keys(state.matchingPairs).length === q.columnA.length;
    if (!isComplete) return;

    state.matchingChecked = true;
    let allCorrect = true;

    q.columnA.forEach((_, idxA) => {
      const idxB = state.matchingPairs[idxA];
      const correct = q.answer[idxA] === idxB;
      const elA = document.getElementById(`matchA-${idxA}`);
      const elB = document.getElementById(`matchB-${idxB}`);
      if (!correct) allCorrect = false;

      if (elA) elA.classList.add(correct ? 'correct-match' : 'wrong-match-final');
      if (elB) elB.classList.add(correct ? 'correct-match' : 'wrong-match-final');
    });

    document.querySelectorAll('.match-item').forEach(el => el.classList.add('locked'));
    drawMatchingLines();

    if (allCorrect) {
      submitComplexAnswer(true);
      return;
    }

    submitComplexAnswer(false, { skipRestore: true, skipFeedback: true });
    showMatchingWrongFeedback(q);
  }

  function showMatchingWrongFeedback(q) {
    const feedbackZone = document.getElementById('feedbackZone');
    if (!feedbackZone) return;

    feedbackZone.innerHTML = `
      <div class="matching-result-footer wrong">
        <div class="matching-footer-icon">${svgX()}</div>
        <div class="matching-footer-copy">
          <strong>Câu sai</strong>
          <span>Kiểm tra lại các đường nối màu đỏ. Câu này sẽ quay lại để bạn ôn tập.</span>
        </div>
        <button class="matching-continue-button" onclick="App.navigate(1)">TIẾP TỤC</button>
      </div>
      ${buildAIExplanation(q)}
    `;
  }

  function showHeartLossModal(detail = {}) {
    if (state.isPremium) return;

    const beforeHearts = normalizeHeartCount(detail.beforeHearts ?? state.hearts, state.maxHearts);
    const afterHearts = normalizeHeartCount(detail.afterHearts ?? state.hearts, state.maxHearts);
    const lost = Boolean(detail.lost);
    const isEmpty = afterHearts <= 0;
    const offer = detail.recoveryOffer;
    const existing = document.getElementById('heartLossOverlay');
    if (existing) existing.remove();

    const isDailyRecovery = offer === 'daily' && isEmpty && state.canUseDailyRecovery;
    const isProUpsell = (offer === 'pro' || detail.blockedNewQuestion) && isEmpty && !isDailyRecovery;
    const title = isDailyRecovery
      ? `Bạn đã hết năng lượng. Nhận ${state.dailyRecoveryAmount} năng lượng miễn phí hôm nay!`
      : isProUpsell
      ? 'Bạn đã hết năng lượng. Nâng cấp Pro để học tiếp?'
      : (isEmpty ? 'Bạn đã hết năng lượng học tập' : (lost ? 'Sai rồi! Mất 1 năng lượng' : 'Sai rồi!'));
    const body = isDailyRecovery
      ? `Bạn được hồi phục miễn phí 1 lần mỗi ngày sau khi dùng hết năng lượng. Nhận ${state.dailyRecoveryAmount} năng lượng để tiếp tục.`
      : isProUpsell
      ? 'Bạn vẫn có thể hoàn thành các câu đang làm lại, nhưng cần hồi năng lượng hoặc nâng cấp Pro để tiếp tục câu mới.'
      : (isEmpty ? 'Năng lượng đã về 0. Câu mới sẽ tạm khóa cho tới khi hồi phục.' : `Bạn còn <strong>${afterHearts}/${state.maxHearts}</strong> năng lượng. Cẩn thận hơn ở câu tiếp theo nhé!`);
    const actionMarkup = isDailyRecovery
      ? '<button class="heart-keep-going heart-free-recover" onclick="App.requestFreeHeartRecovery()">NHẬN NĂNG LƯỢNG MIỄN PHÍ</button><button class="heart-secondary-action" onclick="App.openPremiumFromHeartModal()">NÂNG CẤP PRO</button>'
      : isProUpsell
      ? '<button class="heart-keep-going heart-pro-upgrade" onclick="App.openPremiumFromHeartModal()">NÂNG CẤP PRO</button><button class="heart-secondary-action" onclick="App.closeHeartModal()">ĐỂ SAU</button>'
      : '<button class="heart-keep-going" onclick="App.closeHeartModal()">TIẾP TỤC</button>';

    const modal = document.createElement('div');
    modal.className = 'heart-loss-overlay';
    modal.id = 'heartLossOverlay';
    modal.innerHTML = `
      <div class="heart-loss-modal ${isEmpty ? 'is-empty' : ''} ${isProUpsell ? 'is-pro-upsell' : ''}" role="dialog" aria-modal="true" aria-labelledby="heartLossTitle">
        <div class="heart-row" aria-label="Còn ${afterHearts} trên ${state.maxHearts} năng lượng">
          ${renderHeartLossPreview(beforeHearts, afterHearts)}
        </div>
        <h3 id="heartLossTitle">${title}</h3>
        <p>${body}</p>
        ${actionMarkup}
      </div>
    `;
    document.body.appendChild(modal);
  }

  function closeHeartModal() {
    const modal = document.getElementById('heartLossOverlay');
    if (modal) modal.remove();
  }

  function requestFreeHeartRecovery() {
    window.parent.postMessage({ type: 'DAILY_HEART_RECOVERY_REQUEST' }, '*');
    closeHeartModal();
  }

  function openPremiumFromHeartModal() {
    window.parent.postMessage({ type: 'OPEN_PREMIUM' }, '*');
  }

  function showExitConfirm() {
    const existing = document.getElementById('exitConfirmOverlay');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'exitConfirmOverlay';
    modal.className = 'lesson-modal-overlay';
    modal.innerHTML = `
      <div class="lesson-modal-card is-exit" role="dialog" aria-modal="true" aria-labelledby="exitModalTitle">
        <div class="lesson-modal-icon" aria-hidden="true">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3 class="lesson-modal-title" id="exitModalTitle">Bạn có muốn tiếp tục bài học?</h3>
        <p class="lesson-modal-subtitle">Tiến trình hiện tại có thể bị gián đoạn nếu bạn rời khỏi bài học bây giờ.</p>
        <button class="lesson-modal-primary" onclick="App.closeExitConfirm()">TIẾP TỤC HỌC</button>
        <button class="lesson-modal-secondary" onclick="App.returnHome()">THOÁT BÀI HỌC</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function closeExitConfirm() {
    const modal = document.getElementById('exitConfirmOverlay');
    if (modal) modal.remove();
  }

  function submitComplexAnswer(correct, options = {}) {
    const q = state.questions[state.current];
    if (!canSubmitQuestionNow(q)) {
      showOutOfHeartsProGate();
      return;
    }

    state.checked = true;

    const elapsed = state.questionStartTime ? Math.round((Date.now() - state.questionStartTime) / 1000) : 0;
    state.timePerQuestion[q.globalId] = elapsed;

    recordAnswerResult(q, correct);

    if (!options.skipRestore) {
      restoreAnswerState(q);
    }
    const feedbackZone = document.getElementById('feedbackZone');
    if (!options.skipFeedback) {
      const letters = ['A', 'B', 'C', 'D'];
      const realAnswerIdx = getCorrectAnswerIndex(q);
      renderFeedbackZone(q, buildResultBanner(correct, q, letters, realAnswerIdx));
    }

    const hint = document.getElementById('navHint');
    if (hint) hint.style.display = 'flex';

    renderSidebar();
    updateHeader();

    if (shouldShowFinishAfterAnswer()) {
      setTimeout(showFinish, 600);
    }
  }

  return { init, startAll, startTopic, filterByTopic, selectOption, checkSelectedOption, navigate, jumpTo, showFinish, restartQuiz, returnHome, toggleBookmark, startBookmarked, handleWordClick, handleBlankClick, checkFillBlankAnswer, handleMatchAClick, handleMatchBClick, checkMatchingAnswer, closeHeartModal, requestFreeHeartRecovery, openPremiumFromHeartModal, showExitConfirm, closeExitConfirm, triggerQuizFinished, renderFinishStats, handleAIHintClick };

})();

document.addEventListener('DOMContentLoaded', () => {
  App.init().catch(() => App.init());
});
