// ============================================================
// APP.JS v2.0 — Instant Feedback + Optimized UX
// Không còn nút "Kiểm tra đáp án" — Click là biết ngay
// ============================================================

let activeQuizData = typeof QUIZ_DATA !== 'undefined' ? QUIZ_DATA : { topics: [] };
let activeAllQuestions = typeof ALL_QUESTIONS !== 'undefined' ? ALL_QUESTIONS : [];

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
    bookmarks: new Set()
  };

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

  // ===== INIT =====
  function init() {
    loadBookmarks();
    
    // Fetch from backend
    fetch('http://localhost:8000/api/v1/quizzes/topics')
      .then(res => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(topics => {
        console.log('Loaded quiz data from database:', topics);
        activeQuizData = {
          title: "Trắc nghiệm Lịch Sử 11",
          subtitle: "Sách Kết Nối Tri Thức – Cả Năm Học",
          totalQuestions: topics.reduce((acc, t) => acc + (t.questions ? t.questions.length : 0), 0),
          topics: topics
        };
        
        // Flatten questions to build activeAllQuestions
        activeAllQuestions = [];
        let globalId = 1;
        activeQuizData.topics.forEach(topic => {
          if (topic.questions) {
            topic.questions.forEach(q => {
              activeAllQuestions.push({
                ...q,
                globalId: globalId++,
                topicId: topic.id,
                topicName: topic.name,
                topicTitle: topic.title,
                topicIcon: topic.icon,
                topicColor: topic.color
              });
            });
          }
        });
      })
      .catch(err => {
        console.warn('Using static fallback quiz data due to error:', err);
      })
      .finally(() => {
        renderHomeTopics();
        updateHomeBookmarkButton();
        showHome();
        setupKeyboard();
      });
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
    state.questions = activeAllQuestions.filter(q => state.bookmarks.has(q.globalId));
    state.modeLabel = 'Câu hỏi đã lưu';
    state.currentTopicFilter = 'bookmarks';
    beginQuiz();
  }

  // ===== HOME =====
  function renderHomeTopics() {
    const grid = document.getElementById('homeTopicsGrid');
    grid.innerHTML = activeQuizData.topics.map(topic => `
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
    document.getElementById('headerProgressText').textContent = 'Chọn chủ đề để bắt đầu';
    document.getElementById('headerScore').style.display = 'none';
  }

  function returnHome() {
    const exitModal = document.getElementById('exitConfirmOverlay');
    if (exitModal) exitModal.remove();
    
    // Bỏ qua confirm mặc định vì đã có showExitConfirm    resetAll();
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
  }

  // ===== START =====
  function startAll() {
    resetAll();
    state.questions = [...activeAllQuestions];
    state.modeLabel = 'Toàn bộ 130 câu';
    state.currentTopicFilter = 'all';
    beginQuiz();
  }

  function startTopic(topicId) {
    resetAll();
    const topic = activeQuizData.topics.find(t => t.id === topicId);
    if (!topic) return;
    state.questions = activeAllQuestions.filter(q => q.topicId === topicId);
    state.modeLabel = topic.name;
    state.currentTopicFilter = topicId;
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
    if (state.checked && !confirm('Chuyển chủ đề sẽ reset tiến độ. Tiếp tục?')) return;
    state.currentTopicFilter = topicId;
    if (topicId === 'all') {
      state.questions = [...activeAllQuestions];
      state.modeLabel = 'Toàn bộ 130 câu';
    } else {
      const topic = activeQuizData.topics.find(t => t.id === topicId);
      state.questions = activeAllQuestions.filter(q => q.topicId === topicId);
      state.modeLabel = topic ? topic.name : '';
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

  // ===== RENDER QUESTION =====
  function renderQuestion() {
    const q = state.questions[state.current];
    if (!q) { showFinish(); return; }

    state.selected = null;
    state.checked = false;
    state.isAnimating = false;
    state.questionStartTime = Date.now();

    const zone = document.getElementById('questionZone');
    const letters = ['A', 'B', 'C', 'D'];
    const isAnswered = state.results.hasOwnProperty(q.globalId);

    const isBookmarked = state.bookmarks.has(q.globalId);

    zone.innerHTML = `
      <div class="question-header">
        <div class="qh-left">
          <div class="q-number-badge">Câu ${state.current + 1} / ${state.questions.length}</div>
          <div class="q-instruction-badge">
            Chọn để trả lời
          </div>
        </div>
        <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" id="btnBookmark" onclick="App.toggleBookmark(${q.globalId})" title="Lưu câu hỏi này">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
        </button>
      </div>

      <div class="question-card">
        <div class="question-text">${q.question}</div>
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

      <div id="feedbackZone"></div>
    `;

    // Restore if already answered
    if (isAnswered) {
      state.checked = true;
      restoreAnswerState(q);
    }

    renderSidebar();
    updateHeader();
    document.querySelector('.content-area').scrollTop = 0;
  }

  function restoreAnswerState(q) {
    // Show correct answer highlighted, no wrong mark (since we don't track what was selected)
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
    document.getElementById('feedbackZone').innerHTML = buildAIExplanation(q) + buildNextAction();
  }

  // ===== SELECT OPTION (INSTANT FEEDBACK) =====
  function selectOption(idx) {
    if (state.checked || state.isAnimating) return;

    // Debounce
    state.isAnimating = true;
    state.selected = idx;
    state.checked = true;

    const q = state.questions[state.current];
    const selectedIdx = state.selected;
    const realAnswerIdx = getCorrectAnswerIndex(q);
    if (!hasValidCorrectAnswer(q)) {
      console.warn('[NoidungQuiz] Không xác định được đáp án đúng cho câu hỏi:', q);
      state.isAnimating = false;
      state.checked = false;
      return;
    }
    const correct = selectedIdx === realAnswerIdx;
    const elapsed = state.questionStartTime ? Math.round((Date.now() - state.questionStartTime) / 1000) : 0;
    state.timePerQuestion[q.globalId] = elapsed;

    // Record result
    if (!state.results.hasOwnProperty(q.globalId)) {
      state.results[q.globalId] = correct;
      if (correct) {
        state.score.correct++;
        state.streak++;
        if (state.streak > state.maxStreak) state.maxStreak = state.streak;
      } else {
        state.score.wrong++;
        state.streak = 0;
      }
    }

    // Immediate visual feedback with animation
    const selectedEl = document.getElementById(`opt-${idx}`);
    if (selectedEl) {
      selectedEl.classList.add('selecting');
    }

    // Short delay for animation to feel natural (not instant jarring)
    setTimeout(() => {
      revealAnswer(q, idx, correct);
      state.isAnimating = false;
    }, 180);
  }

  function revealAnswer(q, selectedIdx, correct) {
    const letters = ['A', 'B', 'C', 'D'];

    const realAnswerIdx = getCorrectAnswerIndex(q);
    if (!hasValidCorrectAnswer(q)) {
      console.warn('[NoidungQuiz] Không thể tô đáp án đúng vì dữ liệu đáp án không hợp lệ:', q);
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

    const feedbackZone = document.getElementById('feedbackZone');
    feedbackZone.innerHTML = buildResultBanner(correct, q, letters, realAnswerIdx) + buildAIExplanation(q) + buildNextAction();

    renderSidebar();
    updateHeader();

    // Auto-scroll to explanation
    setTimeout(() => {
      feedbackZone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 250);
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

  function buildNextAction() {
    if (state.current >= state.questions.length - 1) return '';
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
            <div class="ai-title">Giải thích chuyên sâu · AI</div>
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
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 9999; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
      <div style="background: white; width: 90%; max-width: 340px; border-radius: 28px; padding: 32px 24px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3); animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
        <style>
          @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          .game-btn { font-family: 'Nunito', system-ui, sans-serif; width: 100%; padding: 16px; border-radius: 16px; font-weight: 800; font-size: 15px; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.1s; margin-bottom: 12px; display: block; }
          .game-btn-blue { background: #1cb0f6; color: white; box-shadow: 0 4px 0 #1899d6; }
          .game-btn-blue:active { transform: translateY(4px); box-shadow: 0 0 0 #1899d6; }
        </style>
        <div style="font-size: 64px; margin-bottom: 16px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));">🎉</div>
        <h3 style="margin-bottom: 28px; font-size: 22px; color: #374151; font-family: 'Nunito', system-ui, sans-serif; font-weight: 800; line-height: 1.4;">Hoàn thành xuất sắc!<br/>Bài học kết thúc</h3>
        <button class="game-btn game-btn-blue" onclick="App.triggerQuizFinished()">TIẾP TỤC</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function closeHeartModal() {
    const modal = document.getElementById('heartLossOverlay');
    if (modal) modal.remove();
  }

  function showExitConfirm() {
    const existing = document.getElementById('exitConfirmOverlay');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'exitConfirmOverlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 9999; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
      <div style="background: #111827; width: 90%; max-width: 320px; border-radius: 28px; padding: 32px 24px; text-align: center; border: 2px solid #374151; box-shadow: 0 10px 40px rgba(0,0,0,0.5); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
        <style>
          @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          .game-btn { font-family: 'Nunito', system-ui, sans-serif; width: 100%; padding: 16px; border-radius: 16px; font-weight: 800; font-size: 15px; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.1s; margin-bottom: 12px; display: block; }
          .game-btn-blue { background: #1cb0f6; color: white; box-shadow: 0 4px 0 #1899d6; }
          .game-btn-blue:active { transform: translateY(4px); box-shadow: 0 0 0 #1899d6; }
          .game-btn-danger { background: transparent; color: #ff4b4b; }
          .game-btn-danger:active { background: rgba(255, 75, 75, 0.15); }
        </style>
        <div style="width: 64px; height: 64px; background: rgba(255, 75, 75, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff4b4b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h3 style="margin-bottom: 8px; font-size: 20px; color: #f3f4f6; font-family: 'Nunito', system-ui, sans-serif; font-weight: 800;">Bạn muốn thoát thật sao?</h3>
        <p style="margin-bottom: 24px; font-size: 14px; color: #9ca3af; font-family: 'Nunito', system-ui, sans-serif; line-height: 1.5;">Toàn bộ tiến trình bài học này sẽ bị mất nếu bạn thoát bây giờ.</p>
        <button class="game-btn game-btn-blue" onclick="App.closeExitConfirm()">TIẾP TỤC HỌC</button>
        <button class="game-btn game-btn-danger" onclick="App.returnHome()">THOÁT BÀI HỌC</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function closeExitConfirm() {
    const modal = document.getElementById('exitConfirmOverlay');
    if (modal) modal.remove();
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
      : pct >= 40 ? 'Hãy ôn lại từng chủ đề, đặc biệt chú ý dòng thời gian.'
      : 'Đừng nản! Làm lại từng chủ đề nhỏ sẽ giúp bạn tiến bộ nhanh.';

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
    document.getElementById('headerProgressText').textContent =
      `${state.modeLabel} · ${answered}/${total} đã làm`;
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
  return { init, startAll, startTopic, filterByTopic, selectOption, navigate, jumpTo, showFinish, restartQuiz, returnHome, toggleBookmark, startBookmarked, closeHeartModal, showExitConfirm, closeExitConfirm, triggerQuizFinished, renderFinishStats };

})();

document.addEventListener('DOMContentLoaded', () => App.init());
// Force Update Timestamp for Github
