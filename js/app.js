// 奧林匹亞競賽試題主應用程式核心控制器
class OlympiadApp {
  constructor() {
    this.meta = window.OlympiadMeta;
    this.allQuestions = [];
    this.state = {
      grade: null,              // 選中的年級物件
      competition: null,        // 選中的賽事物件
      year: 'all',              // 選中年份 ('all' 或 2017~2026)
      topic: 'all',             // 選中主題
      style: 'intuitive',       // 當前解析難度/風格
      viewMode: 'practice',     // 'practice' | 'exam' | 'lab' | 'bookmarks'
      activeQuestionId: null,   // 當前詳解查看的題目 ID
      userAnswers: {},          // 答題記錄 { [qId]: { selected: 'A', correct: true, time: ... } }
      revealedHints: {},        // 各題已解鎖提示數量 { [qId]: 1 }
      bookmarks: [],            // 收藏題清單
      streak: 0,                // 當前連勝數
      maxStreak: 0,             // 歷史最高連勝
      points: 0,                // 積分 / XP
      showAllExplanations: {},   // 記錄展開全部 4 種年齡講解的題目 ID
      // 考場模式計時
      exam: {
        active: false,
        totalTime: 45 * 60,     // 45 分鐘
        timeLeft: 45 * 60,
        timerId: null,
        submitted: false
      }
    };
  }

  init() {
    // 載入題庫
    this.loadQuestionBank();

    // 載入本地存檔
    this.loadStorage();

    // 初始化草稿紙
    window.scratchpad.init();

    // 檢查 URL 參數或歷史記錄
    this.render();

    // 綁定鍵盤快捷鍵 (Esc 關閉彈窗, 左右切換題目)
    this.bindKeyboardShortcuts();
  }

  loadQuestionBank() {
    const g6 = window.OlympiadQuestionsG6 || [];
    const other = window.OlympiadQuestionsOther || [];
    this.allQuestions = [...g6, ...other];
  }

  loadStorage() {
    try {
      const saved = localStorage.getItem('olympiad_app_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.gradeId) {
          this.state.grade = this.meta.grades.find(g => g.id === parsed.gradeId) || null;
        }
        if (parsed.competitionId) {
          this.state.competition = this.meta.competitions.find(c => c.id === parsed.competitionId) || null;
        }
        if (parsed.style) this.state.style = parsed.style;
        if (parsed.userAnswers) this.state.userAnswers = parsed.userAnswers;
        if (parsed.bookmarks) this.state.bookmarks = parsed.bookmarks;
        if (parsed.streak) this.state.streak = parsed.streak;
        if (parsed.maxStreak) this.state.maxStreak = parsed.maxStreak;
        if (parsed.points) this.state.points = parsed.points;
      }
    } catch (e) {
      console.warn("Could not load local storage", e);
    }
  }

  saveStorage() {
    try {
      const toSave = {
        gradeId: this.state.grade ? this.state.grade.id : null,
        competitionId: this.state.competition ? this.state.competition.id : null,
        style: this.state.style,
        userAnswers: this.state.userAnswers,
        bookmarks: this.state.bookmarks,
        streak: this.state.streak,
        maxStreak: this.state.maxStreak,
        points: this.state.points
      };
      localStorage.setItem('olympiad_app_state', JSON.stringify(toSave));
    } catch (e) {}
  }

  // ------------------------------------------------
  // 畫面路由切換
  // ------------------------------------------------
  render() {
    const sGrade = document.getElementById('screen-grade-select');
    const sComp = document.getElementById('screen-competition-select');
    const sHub = document.getElementById('screen-hub');

    sGrade.classList.add('hidden');
    sComp.classList.add('hidden');
    sHub.classList.add('hidden');

    if (!this.state.grade) {
      sGrade.classList.remove('hidden');
      this.renderGradeSelection();
    } else if (!this.state.competition) {
      sComp.classList.remove('hidden');
      this.renderCompetitionSelection();
    } else {
      sHub.classList.remove('hidden');
      this.renderHub();
    }

    this.renderTopHeader();
    this.renderMathJax();
  }

  renderTopHeader() {
    const topBar = document.getElementById('global-header');
    if (!topBar) return;

    if (!this.state.grade) {
      topBar.classList.add('opacity-0', 'pointer-events-none');
      return;
    }
    topBar.classList.remove('opacity-0', 'pointer-events-none');

    // 年級指示按鈕
    const gradePill = document.getElementById('header-grade-pill');
    if (gradePill && this.state.grade) {
      gradePill.innerHTML = `
        <span class="mr-1">${this.state.grade.icon}</span>
        <span class="font-semibold">${this.state.grade.short}</span>
        <span class="text-xs text-slate-400 ml-1">換年級▾</span>
      `;
    }

    // 賽事指示按鈕
    const compPill = document.getElementById('header-comp-pill');
    if (compPill) {
      if (this.state.competition) {
        compPill.classList.remove('hidden');
        compPill.innerHTML = `
          <span class="mr-1">${this.state.competition.icon}</span>
          <span class="font-semibold">${this.state.competition.short}</span>
          <span class="text-xs text-slate-400 ml-1">換賽事▾</span>
        `;
      } else {
        compPill.classList.add('hidden');
      }
    }

    // 當前講解風格下拉或標籤
    const stylePill = document.getElementById('header-style-pill');
    if (stylePill) {
      const curStyle = this.meta.explanationStyles[this.state.style];
      stylePill.innerHTML = `
        <span class="mr-1">${curStyle.icon}</span>
        <span class="font-bold text-amber-900">${curStyle.name.split(' ')[1]}</span>
        <span class="text-xs text-amber-700 ml-1">切換講解▾</span>
      `;
    }

    // 連續答對與積分
    const streakEl = document.getElementById('header-streak-badge');
    if (streakEl) {
      streakEl.innerHTML = `🔥 <span class="font-bold">${this.state.streak}</span> 連對`;
    }

    const xpEl = document.getElementById('header-xp-badge');
    if (xpEl) {
      xpEl.innerHTML = `⭐ <span class="font-bold">${this.state.points}</span> XP`;
    }
  }

  // ------------------------------------------------
  // 步驟一：選擇年齡與年級
  // ------------------------------------------------
  renderGradeSelection() {
    const container = document.getElementById('grade-cards-container');
    if (!container) return;

    container.innerHTML = this.meta.grades.map(grade => {
      const isFeatured = grade.featured;
      const defStyle = this.meta.explanationStyles[grade.defaultStyle];
      return `
        <div onclick="app.selectGrade(${grade.id})" 
             class="relative group cursor-pointer rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl border ${
               isFeatured 
                 ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10' 
                 : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
             }">
          
          ${isFeatured ? `
            <div class="absolute -top-3.5 right-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
              <span>★ 推薦旗艦</span>
              <span>10 年歷屆試題</span>
            </div>
          ` : ''}

          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-gradient-to-br ${grade.color} text-white shrink-0 group-hover:scale-110 transition-transform">
              ${grade.icon}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">${grade.category}</span>
                <span class="text-xs text-slate-500 font-medium">${grade.ageRange}</span>
              </div>
              <h3 class="text-xl font-bold text-slate-800 mt-1 group-hover:text-blue-600 transition-colors">
                ${grade.name}
              </h3>
              <p class="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                ${grade.description}
              </p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400">專屬講解視角：</span>
              <span class="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">${defStyle.icon} ${defStyle.name.split(' ')[1]}</span>
            </div>
            <span class="text-blue-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center">
              開始探索 →
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  selectGrade(gradeId) {
    sound.click();
    this.state.grade = this.meta.grades.find(g => g.id === gradeId);
    // 自動將預設解說視角切換至該年級適配的模式
    if (this.state.grade && this.state.grade.defaultStyle) {
      this.state.style = this.state.grade.defaultStyle;
    }
    this.saveStorage();
    this.render();
  }

  changeGrade() {
    sound.click();
    this.state.grade = null;
    this.state.competition = null;
    this.saveStorage();
    this.render();
  }

  // ------------------------------------------------
  // 步驟二：選擇賽事
  // ------------------------------------------------
  renderCompetitionSelection() {
    const container = document.getElementById('competition-cards-container');
    const gradeBadge = document.getElementById('comp-grade-hint');
    if (gradeBadge && this.state.grade) {
      gradeBadge.innerHTML = `
        <span class="text-sm text-slate-500">已選年級：</span>
        <button onclick="app.changeGrade()" class="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          <span>${this.state.grade.icon} ${this.state.grade.name}</span>
          <span class="text-xs underline ml-1">更換</span>
        </button>
      `;
    }

    if (!container) return;

    container.innerHTML = this.meta.competitions.map(comp => {
      const isOlympiad = comp.id === 'olympiad';
      const yearCount = comp.years.length;
      return `
        <div onclick="app.selectCompetition('${comp.id}')"
             class="group cursor-pointer rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl border ${
               isOlympiad 
                 ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border-amber-400 shadow-md ring-2 ring-amber-400/40' 
                 : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
             }">
          
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-full ${
              isOlympiad ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600'
            }">
              ${comp.badge}
            </span>
            <span class="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
              收錄 ${yearCount} 年真題
            </span>
          </div>

          <div class="flex items-center gap-4 mt-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
              ${comp.icon}
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                ${comp.name}
              </h3>
              <p class="text-xs text-amber-700 font-semibold mt-0.5">
                ${comp.tag}
              </p>
            </div>
          </div>

          <p class="text-sm text-slate-600 mt-4 leading-relaxed">
            ${comp.description}
          </p>

          <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500">涵蓋年份：${comp.years[comp.years.length - 1]} ~ ${comp.years[0]}</span>
            <span class="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
              進入試題庫 →
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  selectCompetition(compId) {
    sound.click();
    this.state.competition = this.meta.competitions.find(c => c.id === compId);
    this.saveStorage();
    this.render();
  }

  changeCompetition() {
    sound.click();
    this.state.competition = null;
    this.saveStorage();
    this.render();
  }

  // ------------------------------------------------
  // 步驟三：題庫主控台與試題研習
  // ------------------------------------------------
  renderHub() {
    this.renderYearFilterPills();
    this.renderTopicFilterPills();
    this.renderStyleSwitchTabs();
    this.renderQuestionList();
    this.renderStatsBanner();
  }

  renderStyleSwitchTabs() {
    const container = document.getElementById('explanation-style-switcher');
    if (!container) return;

    container.innerHTML = Object.values(this.meta.explanationStyles).map(style => {
      const isSelected = this.state.style === style.id;
      return `
        <button onclick="app.setStyle('${style.id}')" 
                class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/20 scale-[1.02]' 
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }">
          <span class="text-base">${style.icon}</span>
          <span class="whitespace-nowrap">${style.name.split(' ')[1]}</span>
          ${isSelected ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>' : ''}
        </button>
      `;
    }).join('');
  }

  setStyle(styleId) {
    sound.click();
    this.state.style = styleId;
    this.saveStorage();
    this.renderTopHeader();
    this.renderStyleSwitchTabs();
    this.renderQuestionList();
    this.renderMathJax();
  }

  renderYearFilterPills() {
    const container = document.getElementById('year-filter-container');
    if (!container || !this.state.competition) return;

    const years = ['all', ...this.state.competition.years];
    container.innerHTML = years.map(yr => {
      const isSelected = this.state.year === yr;
      let label = yr === 'all' ? '全部 10 年' : `${yr} 年`;
      if (yr === 2026) label = '2026 (今年最新)';
      if (yr === 2025) label = '2025 (去年)';
      if (yr === 2024) label = '2024 (前年)';

      return `
        <button onclick="app.setYearFilter('${yr}')" 
                class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border whitespace-nowrap ${
                  isSelected 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }">
          ${label}
        </button>
      `;
    }).join('');
  }

  setYearFilter(year) {
    sound.click();
    this.state.year = year === 'all' ? 'all' : parseInt(year);
    this.renderYearFilterPills();
    this.renderQuestionList();
  }

  renderTopicFilterPills() {
    const container = document.getElementById('topic-filter-container');
    if (!container) return;

    const topics = ['all', '數論', '幾何', '行程', '組合', '邏輯', '應用', '數列'];
    container.innerHTML = topics.map(tp => {
      const isSelected = this.state.topic === tp;
      const label = tp === 'all' ? '全部模組' : tp;
      return `
        <button onclick="app.setTopicFilter('${tp}')" 
                class="px-3 py-1 rounded-lg text-xs font-medium transition-colors border whitespace-nowrap ${
                  isSelected 
                    ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold' 
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }">
          ${label}
        </button>
      `;
    }).join('');
  }

  setTopicFilter(topic) {
    sound.click();
    this.state.topic = topic;
    this.renderTopicFilterPills();
    this.renderQuestionList();
  }

  // 取得過濾後的題目
  getFilteredQuestions() {
    return this.allQuestions.filter(q => {
      // 年級匹配：優先精確匹配，若該年級無題目則放寬顯示相鄰
      const matchesGrade = this.state.grade ? q.grade === this.state.grade.id : true;
      // 賽事匹配
      const matchesComp = this.state.competition ? q.competition === this.state.competition.id : true;
      // 年份過濾
      const matchesYear = this.state.year === 'all' || q.year === this.state.year;
      // 主題過濾
      const matchesTopic = this.state.topic === 'all' || q.topic === this.state.topic;
      // 模式特定過濾 (如只看收藏)
      const matchesBookmarks = this.state.viewMode !== 'bookmarks' || this.state.bookmarks.includes(q.id);

      return matchesGrade && matchesComp && matchesYear && matchesTopic && matchesBookmarks;
    });
  }

  renderStatsBanner() {
    const statsContainer = document.getElementById('hub-stats-banner');
    if (!statsContainer) return;

    const totalQuestions = this.getFilteredQuestions().length;
    const answeredCount = Object.keys(this.state.userAnswers).filter(id => {
      return this.allQuestions.some(q => q.id === id && (this.state.grade ? q.grade === this.state.grade.id : true));
    }).length;

    const correctCount = Object.values(this.state.userAnswers).filter(a => a.correct).length;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    statsContainer.innerHTML = `
      <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-2 text-blue-300 text-xs font-semibold tracking-wider uppercase">
            <span>${this.state.grade ? this.state.grade.name : ''}</span>
            <span>•</span>
            <span>${this.state.competition ? this.state.competition.name : ''}</span>
          </div>
          <h2 class="text-2xl font-black mt-1 tracking-tight flex items-center gap-2">
            <span>歷屆真題庫挑戰</span>
            <span class="text-xs bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full">10 年收錄</span>
          </h2>
          <p class="text-sm text-slate-300 mt-1 max-w-xl">
            當前解說鏡頭：<strong class="text-amber-300">${this.meta.explanationStyles[this.state.style].name}</strong>
            （可隨時在右上角切換不同的難度解說！）
          </p>
        </div>

        <div class="flex items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/10 shrink-0">
          <div class="text-center">
            <div class="text-xs text-slate-300">題庫容量</div>
            <div class="text-xl font-black text-white mt-0.5">${totalQuestions} <span class="text-xs font-normal">題</span></div>
          </div>
          <div class="w-px h-8 bg-white/20"></div>
          <div class="text-center">
            <div class="text-xs text-slate-300">已挑戰</div>
            <div class="text-xl font-black text-amber-400 mt-0.5">${answeredCount}</div>
          </div>
          <div class="w-px h-8 bg-white/20"></div>
          <div class="text-center">
            <div class="text-xs text-slate-300">正確率</div>
            <div class="text-xl font-black text-emerald-400 mt-0.5">${accuracy}%</div>
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------
  // 試題列表渲染與互動
  // ------------------------------------------------
  renderQuestionList() {
    const listContainer = document.getElementById('question-cards-list');
    if (!listContainer) return;

    const questions = this.getFilteredQuestions();

    if (questions.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div class="text-5xl">🔍</div>
          <h3 class="text-lg font-bold text-slate-700 mt-3">在此篩選條件下暫無題目</h3>
          <p class="text-sm text-slate-500 mt-1">請嘗試切換年份或模組，或點選六年級旗艦題庫。</p>
          <button onclick="app.setYearFilter('all'); app.setTopicFilter('all');" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
            重置全部篩選
          </button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = questions.map((q, idx) => {
      const userAns = this.state.userAnswers[q.id];
      const isBookmarked = this.state.bookmarks.includes(q.id);
      const hintsCount = this.state.revealedHints[q.id] || 0;
      const curStyleKey = this.state.style;
      const curExplanation = q.explanations[curStyleKey] || q.explanations['standard'];
      const styleMeta = this.meta.explanationStyles[curStyleKey];

      // 難度星號
      const stars = '★'.repeat(q.difficulty) + '☆'.repeat(5 - q.difficulty);

      return `
        <div id="q-card-${q.id}" class="bg-white rounded-2xl border ${userAns ? (userAns.correct ? 'border-emerald-200 shadow-emerald-500/5' : 'border-rose-200 shadow-rose-500/5') : 'border-slate-200 hover:border-slate-300'} p-6 sm:p-7 shadow-sm transition-all duration-200">
          
          <!-- 題目頂部標籤 -->
          <div class="flex items-center justify-between gap-2 flex-wrap pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-md text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                ${q.year} 年真題
              </span>
              <span class="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                ${q.topic}
              </span>
              <span class="text-amber-500 text-xs tracking-tighter" title="難度等級 ${q.difficulty}/5">
                ${stars}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <!-- 收藏按鈕 -->
              <button onclick="app.toggleBookmark('${q.id}')" class="text-slate-400 hover:text-amber-500 transition-colors p-1" title="${isBookmarked ? '取消收藏' : '收藏此題'}">
                ${isBookmarked ? '★ 已收藏' : '☆ 收藏'}
              </button>

              <!-- 草稿紙按鈕 -->
              <button onclick="window.scratchpad.toggle()" class="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 font-medium">
                <span>📝</span>
                <span>草稿紙</span>
              </button>
            </div>
          </div>

          <!-- 題目標題與題幹 -->
          <div class="mt-4">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="text-blue-600 font-black">第 ${idx + 1} 題.</span>
              <span>${q.title}</span>
            </h3>
            
            <div class="text-base text-slate-800 mt-3 leading-relaxed font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-100 question-math-content">
              ${q.question}
            </div>
          </div>

          <!-- 正確答案與解答醒目標誌 (學習解答模式或已答題時顯示) -->
          <div class="mt-4 p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-500/80 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                ✓
              </span>
              <div>
                <span class="text-xs text-emerald-700 font-bold uppercase tracking-wider block">標準解答與答案</span>
                <span class="text-base font-black text-emerald-900">
                  正確答案：<span class="text-emerald-700 underline underline-offset-2">選項 ${q.answer}</span>（數值：<span class="text-emerald-800 font-mono">${q.answerVal}</span>）
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 self-end sm:self-center">
              <button onclick="app.openLabModal('${q.id}')" class="px-3 py-1 rounded-lg text-xs font-bold bg-white hover:bg-emerald-100/80 text-emerald-800 border border-emerald-300 transition-colors flex items-center gap-1 shadow-xs">
                <span>🔍</span>
                <span>跨年齡 4 維解析對照</span>
              </button>
            </div>
          </div>

          <!-- 四個選項展示 -->
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${q.options.map(opt => {
              const isCorrectOpt = opt.val === q.answer;
              let optClass = isCorrectOpt 
                ? 'bg-emerald-50/90 border-2 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400/20 shadow-xs' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
              let optBadge = isCorrectOpt ? '<span class="ml-auto text-emerald-700 font-bold text-xs bg-emerald-100 px-2 py-0.5 rounded-md">✓ 正確答案</span>' : '';

              if (userAns) {
                if (opt.val === userAns.selected && !isCorrectOpt) {
                  optClass = 'bg-rose-50 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-500/30';
                  optBadge = '<span class="ml-auto text-rose-600 font-bold text-xs">✗ 你的選擇</span>';
                }
              }

              return `
                <div class="flex items-center p-3.5 rounded-xl border text-sm font-medium transition-all duration-200 text-left ${optClass}">
                  <span class="w-7 h-7 rounded-lg flex items-center justify-center font-black mr-3 ${
                    isCorrectOpt ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }">
                    ${opt.val}
                  </span>
                  <span class="flex-1">${opt.text}</span>
                  ${optBadge}
                </div>
              `;
            }).join('')}
          </div>

          <!-- 提示指引小精靈 -->
          <div class="mt-4 pt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-slate-500">遇到困難？思考提示：</span>
              <button onclick="app.revealHint('${q.id}')" 
                      class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1 transition-colors">
                <span>💡</span>
                <span>解鎖提示 (${hintsCount}/${q.hints.length})</span>
              </button>
            </div>

            ${userAns ? `
              <div class="text-xs font-semibold ${userAns.correct ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1">
                <span>${userAns.correct ? '🎉 答對了！' : '❌ 差一點！快看解析學習巧思'}</span>
              </div>
            ` : ''}
          </div>

          <!-- 展開的提示內容 -->
          ${hintsCount > 0 ? `
            <div class="mt-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-900 space-y-1.5 animate-fadeIn">
              <div class="font-bold flex items-center gap-1 text-amber-800">
                <span>💡 AI 思考引導：</span>
              </div>
              ${q.hints.slice(0, hintsCount).map((h, hIdx) => `
                <div class="flex items-start gap-1.5 text-amber-900/90">
                  <span class="font-bold shrink-0">提示 ${hIdx + 1}：</span>
                  <span>${h}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- 解析區塊：核心亮點！可切換 4 種難度/視角 或 一次展開全部 -->
          <div class="mt-5 pt-5 border-t border-slate-100">
            <!-- 解析難度切換小標籤與全部展開按鈕 -->
            <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-800">📖 解答說明與推導：</span>
                <button onclick="app.toggleShowAllExplanations('${q.id}')" 
                        class="text-xs px-2.5 py-1 rounded-md font-semibold ${
                          this.state.showAllExplanations && this.state.showAllExplanations[q.id]
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                        } transition-colors">
                  ${this.state.showAllExplanations && this.state.showAllExplanations[q.id] ? '收合為單一視角' : '⚡ 一次並排看 4 種年齡講解'}
                </button>
              </div>

              <!-- 單重視角切換按鈕 -->
              <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                ${Object.keys(this.meta.explanationStyles).map(sKey => {
                  const sObj = this.meta.explanationStyles[sKey];
                  const isActive = curStyleKey === sKey;
                  return `
                    <button onclick="app.setStyle('${sKey}')" 
                            title="${sObj.subtitle}"
                            class="px-2 py-0.5 rounded text-xs font-medium transition-all ${
                              isActive ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                            }">
                      ${sObj.icon} ${sObj.name.split(' ')[1]}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            ${this.state.showAllExplanations && this.state.showAllExplanations[q.id] ? `
              <!-- 四種不同年齡解法同時展示 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                ${Object.keys(this.meta.explanationStyles).map(sKey => {
                  const sObj = this.meta.explanationStyles[sKey];
                  const exp = q.explanations[sKey] || q.explanations['standard'];
                  return `
                    <div class="rounded-xl border p-4 ${sObj.color} flex flex-col justify-between">
                      <div>
                        <div class="flex items-center justify-between pb-2 border-b border-black/10">
                          <span class="font-bold text-sm flex items-center gap-1.5">
                            <span>${sObj.icon}</span>
                            <span>${exp.title}</span>
                          </span>
                          <span class="text-xs px-2 py-0.5 rounded-full bg-white/80 border border-black/10 font-medium">
                            ${sObj.badge}
                          </span>
                        </div>
                        <div class="mt-3 text-xs leading-relaxed math-rendered-body">
                          ${this.formatMarkdownText(exp.content)}
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <!-- 單一選定視角卡片內容 -->
              <div class="rounded-xl border p-4 sm:p-5 ${styleMeta.color} transition-all duration-300">
                <div class="flex items-center justify-between pb-2 border-b border-black/10">
                  <span class="font-bold text-sm flex items-center gap-1.5">
                    <span>${styleMeta.icon}</span>
                    <span>${curExplanation.title}</span>
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-white/80 border border-black/10 font-medium">
                    ${styleMeta.badge}
                  </span>
                </div>

                <!-- 解題內文 -->
                <div class="mt-3 text-xs sm:text-sm leading-relaxed math-rendered-body">
                  ${this.formatMarkdownText(curExplanation.content)}
                </div>

                <!-- 奧數核心心法金色卡片 -->
                <div class="mt-4 p-3 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-950 text-xs flex items-center gap-2">
                  <span class="text-base shrink-0">🎯</span>
                  <div>
                    <strong class="font-bold">奧數通關心法：</strong>
                    <span>${q.keyTakeaway}</span>
                  </div>
                </div>
              </div>
            `}
          </div>

        </div>
      `;
    }).join('');

    this.renderMathJax();
  }

  toggleShowAllExplanations(qId) {
    sound.click();
    if (!this.state.showAllExplanations) this.state.showAllExplanations = {};
    this.state.showAllExplanations[qId] = !this.state.showAllExplanations[qId];
    this.renderQuestionList();
  }

  // ------------------------------------------------
  // 答題與評分邏輯
  // ------------------------------------------------
  submitAnswer(qId, selectedVal) {
    const question = this.allQuestions.find(q => q.id === qId);
    if (!question) return;

    const isCorrect = selectedVal === question.answer;

    if (isCorrect) {
      sound.correct();
      this.state.streak += 1;
      if (this.state.streak > this.state.maxStreak) {
        this.state.maxStreak = this.state.streak;
      }
      this.state.points += 10 + (this.state.streak > 1 ? 5 : 0);
      this.triggerConfetti();
    } else {
      sound.wrong();
      this.state.streak = 0;
    }

    this.state.userAnswers[qId] = {
      selected: selectedVal,
      correct: isCorrect,
      time: Date.now()
    };

    this.saveStorage();
    this.renderTopHeader();
    this.renderQuestionList();
  }

  revealHint(qId) {
    sound.click();
    const cur = this.state.revealedHints[qId] || 0;
    const question = this.allQuestions.find(q => q.id === qId);
    if (!question) return;

    if (cur < question.hints.length) {
      this.state.revealedHints[qId] = cur + 1;
      this.renderQuestionList();
    }
  }

  toggleBookmark(qId) {
    sound.click();
    const idx = this.state.bookmarks.indexOf(qId);
    if (idx >= 0) {
      this.state.bookmarks.splice(idx, 1);
    } else {
      this.state.bookmarks.push(qId);
    }
    this.saveStorage();
    this.renderQuestionList();
  }

  // ------------------------------------------------
  // 視角對照實驗室 (Explanation Comparison Lab)
  // ------------------------------------------------
  openLabModal(qId) {
    const question = this.allQuestions.find(q => q.id === qId);
    if (!question) return;

    const modal = document.getElementById('comparison-lab-modal');
    const content = document.getElementById('comparison-lab-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              ${question.year} 年 • ${question.topic}
            </span>
            <h2 class="text-xl font-black text-slate-900 mt-2">${question.title}</h2>
          </div>
          <button onclick="app.closeLabModal()" class="text-slate-400 hover:text-slate-700 text-2xl font-bold p-1">
            ✕
          </button>
        </div>

        <div class="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-800">
          <strong>題目：</strong> ${question.question}
        </div>

        <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${Object.keys(this.meta.explanationStyles).map(sKey => {
            const sMeta = this.meta.explanationStyles[sKey];
            const exp = question.explanations[sKey];
            return `
              <div class="rounded-xl border p-4 ${sMeta.color}">
                <div class="flex items-center justify-between pb-2 border-b border-black/10">
                  <h4 class="font-bold text-sm flex items-center gap-1.5">
                    <span>${sMeta.icon}</span>
                    <span>${exp ? exp.title : sMeta.name}</span>
                  </h4>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-white/70 border border-black/10">
                    ${sMeta.badge}
                  </span>
                </div>
                <div class="mt-2 text-xs leading-relaxed math-rendered-body">
                  ${exp ? this.formatMarkdownText(exp.content) : '暫無特殊解析'}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    this.renderMathJax();
  }

  closeLabModal() {
    const modal = document.getElementById('comparison-lab-modal');
    if (modal) modal.classList.add('hidden');
  }

  // ------------------------------------------------
  // 數學排版 KaTeX / MathJax 動態觸發
  // ------------------------------------------------
  renderMathJax() {
    if (window.renderMathInElement) {
      setTimeout(() => {
        try {
          window.renderMathInElement(document.body, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        } catch (e) {}
      }, 50);
    } else if (window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => {
        window.MathJax.typesetPromise().catch(() => {});
      }, 50);
    }
  }

  formatMarkdownText(text) {
    if (!text) return '';
    return text
      .trim()
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n- /g, '<br>• ')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.scratchpad.close();
        this.closeLabModal();
      }
    });
  }
}

// 實例化全域控制器
window.app = new OlympiadApp();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
