(function () {
  "use strict";

  const STORAGE_KEY = "ipaper_assessment_results";

  // ── localStorage helpers ─────────────────────────────────────────────────
  function loadResults() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }
  function saveResult(entry) {
    const all = loadResults();
    all.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
  function clearResults() { localStorage.removeItem(STORAGE_KEY); }

  // ── Admin mode ───────────────────────────────────────────────────────────
  if (location.search.includes("admin")) {
    document.getElementById("screen-start").classList.remove("active");
    document.getElementById("screen-admin").classList.add("active");
    renderAdmin();
    document.getElementById("btn-clear-all").addEventListener("click", () => {
      if (confirm("Delete ALL candidate results? This cannot be undone.")) {
        clearResults();
        renderAdmin();
      }
    });
    return;
  }

  // ── State ────────────────────────────────────────────────────────────────
  let candidateName = "";
  let sectionKeys = Object.keys(SECTIONS);        // ["JS","IFRAME","IPAPER"]
  let activeSection = sectionKeys[0];
  let sectionIndexMap = {};                        // section -> current q index within section
  let sectionAnswers  = {};                        // section -> [{questionId, correct, selectedText}]
  let sectionDone     = {};                        // section -> bool

  // ── Element refs ─────────────────────────────────────────────────────────
  const screenStart   = document.getElementById("screen-start");
  const screenTest    = document.getElementById("screen-test");
  const screenResults = document.getElementById("screen-results");

  const inputName  = document.getElementById("candidate-name");
  const nameError  = document.getElementById("name-error");
  const btnStart   = document.getElementById("btn-start");

  const tabBar        = document.getElementById("tab-bar");
  const progressFill  = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");
  const headerName    = document.getElementById("header-name");
  const sectionBadge  = document.getElementById("section-badge");
  const questionText  = document.getElementById("question-text");
  const optionsCont   = document.getElementById("options-container");

  const codeDisplayWrap   = document.getElementById("code-display-wrap");
  const codeDisplayLang   = document.getElementById("code-display-lang");
  const codeBrokenLabel   = document.getElementById("code-broken-label");
  const codeDisplayEl     = document.getElementById("code-display");

  const fixEditorWrap = document.getElementById("fix-editor-wrap");
  const codeEditor    = document.getElementById("code-editor");
  const editorGutter  = document.getElementById("editor-gutter");
  const btnCheckFix   = document.getElementById("btn-check-fix");

  const navHint   = document.getElementById("nav-hint");
  const btnNext   = document.getElementById("btn-next");

  // Results
  const resultsName   = document.getElementById("results-name");
  const scorePct      = document.getElementById("score-pct");
  const scoreSub      = document.getElementById("score-sub");
  const ringFill      = document.getElementById("ring-fill");
  const sectionScores = document.getElementById("section-scores");
  const verdictEl     = document.getElementById("verdict");
  const btnRestart    = document.getElementById("btn-restart");

  // ── Simple syntax highlighter ─────────────────────────────────────────────
  function highlight(code, lang) {
    let s = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    if (lang === "js") {
      s = s
        .replace(/(\/\/[^\n]*)/g, '<span class="hl-cmt">$1</span>')
        .replace(/\b(const|let|var|function|return|if|else|for|while|new|this|typeof|true|false|null|undefined)\b/g, '<span class="hl-kw">$1</span>')
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="hl-str">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="hl-num">$1</span>')
        .replace(/\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, '<span class="hl-fn">$1</span>');
    } else if (lang === "html") {
      s = s
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="hl-cmt">$1</span>')
        .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="hl-tag">$2</span>')
        .replace(/([\w-]+)(\s*=\s*)("(?:[^"]*)"|'(?:[^']*)')/g, '<span class="hl-attr">$1</span>$2<span class="hl-str">$3</span>');
    }
    return s;
  }

  // ── Editor gutter line numbers ─────────────────────────────────────────
  function updateGutter() {
    const lines = codeEditor.value.split("\n").length;
    editorGutter.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
  }

  // ── Start ────────────────────────────────────────────────────────────────
  btnStart.addEventListener("click", startAssessment);
  inputName.addEventListener("keydown", (e) => { if (e.key === "Enter") startAssessment(); });

  function startAssessment() {
    const val = inputName.value.trim();
    if (!val || val.length < 2) {
      nameError.textContent = val ? "Name must be at least 2 characters." : "Please enter your name to begin.";
      inputName.focus();
      return;
    }
    nameError.textContent = "";
    candidateName = val;

    // Init per-section state
    sectionKeys.forEach((sec) => {
      sectionIndexMap[sec] = 0;
      sectionAnswers[sec]  = [];
      sectionDone[sec]     = false;
    });
    activeSection = sectionKeys[0];

    headerName.textContent = candidateName;
    buildTabs();
    showScreen(screenTest);
    renderQuestion();
  }

  // ── Screens ──────────────────────────────────────────────────────────────
  function showScreen(screen) {
    [screenStart, screenTest, screenResults].forEach((s) => s.classList.remove("active"));
    screen.classList.add("active");
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────
  function buildTabs() {
    tabBar.innerHTML = "";
    sectionKeys.forEach((sec, i) => {
      const btn = document.createElement("button");
      btn.className = "tab-btn";
      btn.dataset.section = sec;
      btn.innerHTML = `<span class="tab-num">${i + 1}</span><span class="tab-label">${SECTIONS[sec]}</span><span class="tab-check" id="tab-check-${sec}"></span>`;
      btn.addEventListener("click", () => switchTab(sec));
      tabBar.appendChild(btn);
    });
    refreshTabs();
  }

  function refreshTabs() {
    sectionKeys.forEach((sec, i) => {
      const btn = tabBar.querySelector(`[data-section="${sec}"]`);
      if (!btn) return;
      btn.classList.toggle("active", sec === activeSection);
      // Lock: only unlock next section if previous is done
      const unlocked = i === 0 || sectionDone[sectionKeys[i - 1]];
      btn.classList.toggle("locked", !unlocked);
      btn.disabled = !unlocked;

      const check = document.getElementById(`tab-check-${sec}`);
      if (check) check.textContent = sectionDone[sec] ? "✓" : "";
    });
  }

  function switchTab(sec) {
    const idx = sectionKeys.indexOf(sec);
    if (idx > 0 && !sectionDone[sectionKeys[idx - 1]]) return; // locked
    activeSection = sec;
    refreshTabs();
    renderQuestion();
  }

  // ── Question rendering ───────────────────────────────────────────────────
  function getSecQuestions(sec) {
    return QUESTIONS.filter((q) => q.section === sec);
  }

  function renderQuestion() {
    const qs    = getSecQuestions(activeSection);
    const idx   = sectionIndexMap[activeSection];
    const q     = qs[idx];
    const total = qs.length;

    // Overall progress across all sections
    const totalQ   = QUESTIONS.length;
    const doneQ    = sectionKeys.reduce((acc, sec) => acc + sectionAnswers[sec].length, 0);
    progressFill.style.width = (doneQ / totalQ * 100) + "%";
    progressLabel.textContent = `Q${doneQ + 1} of ${totalQ}`;

    // Section badge
    sectionBadge.textContent = `${SECTIONS[activeSection]} — ${idx + 1} / ${total}`;
    sectionBadge.className = "section-badge section-" + activeSection.toLowerCase();

    questionText.textContent = q.text;

    // Reset UI
    navHint.textContent = "";
    navHint.className = "nav-hint";
    btnNext.disabled = true;

    // Hide both panels first
    codeDisplayWrap.style.display = "none";
    fixEditorWrap.style.display   = "none";
    optionsCont.innerHTML         = "";
    btnCheckFix.disabled          = false;
    btnCheckFix.textContent       = "Check Fix";

    if (q.type === "mcq") {
      if (q.code) {
        codeDisplayWrap.style.display = "block";
        codeDisplayLang.textContent   = q.lang === "html" ? "HTML" : "JavaScript";
        codeBrokenLabel.style.display = "none";
        codeDisplayEl.innerHTML = highlight(q.code, q.lang || "js");
      }
      renderMCQ(q);
    } else {
      renderFix(q);
    }

    // Update next button label
    const allSectionsDone = sectionKeys.slice(0, sectionKeys.indexOf(activeSection)).every((s) => sectionDone[s]);
    const isLastInSection = idx === total - 1;
    const isLastSection   = activeSection === sectionKeys[sectionKeys.length - 1];
    btnNext.textContent = (isLastInSection && isLastSection) ? "See Results" : isLastInSection ? "Next Section →" : "Next Question";
  }

  function renderMCQ(q) {
    const shuffled = [...q.options].sort(() => Math.random() - 0.5);
    shuffled.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.dataset.correct = opt.correct;
      btn.innerHTML = `<span class="opt-letter">${String.fromCharCode(65 + i)}</span><span class="opt-text">${opt.text}</span>`;
      btn.addEventListener("click", () => selectMCQ(btn, q));
      optionsCont.appendChild(btn);
    });
  }

  function selectMCQ(selected, q) {
    if (optionsCont.querySelector(".option-btn.selected")) return;
    const correct = selected.dataset.correct === "true";
    selected.classList.add("selected", correct ? "correct" : "incorrect");
    if (!correct) {
      optionsCont.querySelectorAll(".option-btn").forEach((b) => {
        if (b.dataset.correct === "true") b.classList.add("correct");
      });
    }
    optionsCont.querySelectorAll(".option-btn").forEach((b) => (b.disabled = true));

    const selectedText = selected.querySelector(".opt-text").textContent;
    sectionAnswers[activeSection].push({ questionId: q.id, section: activeSection, correct, selectedText });

    showHint(q.explanation, correct);
    btnNext.disabled = false;
  }

  function renderFix(q) {
    codeDisplayWrap.style.display = "block";
    codeDisplayLang.textContent   = q.lang === "html" ? "HTML" : "JavaScript";
    codeBrokenLabel.style.display = "inline";
    codeDisplayEl.innerHTML = highlight(q.brokenCode, q.lang || "js");

    fixEditorWrap.style.display = "block";
    codeEditor.value = q.brokenCode;
    updateGutter();
    codeEditor.addEventListener("input", updateGutter);

    btnCheckFix.onclick = () => checkFix(q);
  }

  function checkFix(q) {
    const userCode = codeEditor.value;
    const correct  = q.validate(userCode);

    btnCheckFix.disabled = true;
    btnCheckFix.textContent = correct ? "✓ Correct!" : "✗ Not quite";
    btnCheckFix.className = "btn btn-check " + (correct ? "check-pass" : "check-fail");

    if (!correct && q.fixHint) {
      showHint(q.fixHint, false);
      // Allow retry
      btnCheckFix.disabled = false;
      btnCheckFix.textContent = "Try Again";
      btnCheckFix.className = "btn btn-check";
      return;
    }

    const selectedText = correct ? "(fixed correctly)" : "(submitted with bug)";
    sectionAnswers[activeSection].push({ questionId: q.id, section: activeSection, correct, selectedText });
    showHint(q.explanation, correct);
    btnNext.disabled = false;
    codeEditor.disabled = true;
  }

  function showHint(text, correct) {
    navHint.textContent = text;
    navHint.className = "nav-hint " + (correct ? "hint-correct" : "hint-wrong");
  }

  // ── Next button ──────────────────────────────────────────────────────────
  btnNext.addEventListener("click", () => {
    const qs    = getSecQuestions(activeSection);
    const idx   = sectionIndexMap[activeSection];

    if (idx < qs.length - 1) {
      sectionIndexMap[activeSection]++;
      renderQuestion();
    } else {
      // Section complete
      sectionDone[activeSection] = true;
      refreshTabs();

      const nextSecIdx = sectionKeys.indexOf(activeSection) + 1;
      if (nextSecIdx < sectionKeys.length) {
        activeSection = sectionKeys[nextSecIdx];
        refreshTabs();
        renderQuestion();
      } else {
        showResults();
      }
    }
  });

  // ── Results ──────────────────────────────────────────────────────────────
  function showResults() {
    const allAnswers = sectionKeys.flatMap((s) => sectionAnswers[s]);
    const total   = allAnswers.length;
    const correct = allAnswers.filter((a) => a.correct).length;
    const pct     = Math.round((correct / total) * 100);

    progressFill.style.width = "100%";
    resultsName.textContent  = candidateName;
    scorePct.textContent     = pct + "%";
    scoreSub.textContent     = `${correct} / ${total} correct`;

    const circumference = 326.7;
    ringFill.className  = "ring-fill " + (pct >= 80 ? "ring-green" : pct >= 50 ? "ring-amber" : "ring-red");
    setTimeout(() => { ringFill.style.strokeDashoffset = circumference - (pct / 100) * circumference; }, 100);

    sectionScores.innerHTML = sectionKeys.map((sec) => {
      const sa   = sectionAnswers[sec];
      const sc   = sa.filter((a) => a.correct).length;
      const sp   = sa.length ? Math.round((sc / sa.length) * 100) : 0;
      return `<div class="sec-score">
        <span class="sec-label">${SECTIONS[sec]}</span>
        <div class="sec-bar"><div class="sec-fill" style="width:${sp}%;background:${barColor(sp)}"></div></div>
        <span class="sec-pct">${sc}/${sa.length}</span>
      </div>`;
    }).join("");

    let verdictText, verdictClass;
    if (pct >= 80)      { verdictText = "Excellent work! Strong technical foundation — a great fit for the support team."; verdictClass = "verdict-pass"; }
    else if (pct >= 50) { verdictText = "Good effort. Some areas to strengthen before joining the team."; verdictClass = "verdict-mid"; }
    else                { verdictText = "Significant gaps present. We recommend revisiting the fundamentals covered here."; verdictClass = "verdict-fail"; }

    verdictEl.textContent = verdictText;
    verdictEl.className   = "verdict " + verdictClass;

    saveResult({
      id: Date.now(),
      name: candidateName,
      date: new Date().toISOString(),
      score: pct,
      correct,
      total,
      answers: allAnswers,
    });

    showScreen(screenResults);
  }

  function barColor(pct) {
    return pct >= 80 ? "#39ff14" : pct >= 50 ? "#ffab00" : "#ff1744";
  }

  btnRestart.addEventListener("click", () => {
    inputName.value = "";
    showScreen(screenStart);
    inputName.focus();
  });

  // ── Sync editor gutter on scroll ─────────────────────────────────────────
  if (codeEditor) {
    codeEditor.addEventListener("scroll", () => {
      editorGutter.scrollTop = codeEditor.scrollTop;
    });
  }

})();

// ── Admin renderer ─────────────────────────────────────────────────────────
function renderAdmin() {
  const STORAGE_KEY = "ipaper_assessment_results";
  const container = document.getElementById("admin-scoreboard");
  const empty     = document.getElementById("admin-empty");
  let results;
  try { results = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { results = []; }

  if (!results.length) { container.innerHTML = ""; empty.style.display = "block"; return; }
  empty.style.display = "none";
  results.sort((a, b) => b.id - a.id);

  container.innerHTML = results.map((r) => {
    const date       = new Date(r.date).toLocaleString();
    const scoreClass = r.score >= 80 ? "score-pass" : r.score >= 50 ? "score-mid" : "score-fail";
    const sectionKeys = Object.keys(SECTIONS);

    const sectionPills = sectionKeys.map((sec) => {
      const sa = (r.answers || []).filter((a) => a.section === sec);
      const sc = sa.filter((a) => a.correct).length;
      return `<span class="admin-sec-pill sec-${sec.toLowerCase()}">${SECTIONS[sec]}: ${sc}/${sa.length}</span>`;
    }).join("");

    const answerRows = (r.answers || []).map((a) => {
      const q = QUESTIONS.find((q) => q.id === a.questionId);
      if (!q) return "";
      const correctOpt = q.type === "fix" ? "(fixed correctly)" : (q.options || []).find((o) => o.correct)?.text || "—";
      return `<tr class="${a.correct ? "ans-correct" : "ans-wrong"}">
        <td><span class="section-badge section-${a.section.toLowerCase()}">${SECTIONS[a.section]}</span></td>
        <td class="ans-q">${escHtml(q.text)}</td>
        <td class="ans-type">${q.type === "fix" ? "✏ Fix" : "MCQ"}</td>
        <td>${escHtml(a.selectedText || "—")}</td>
        <td class="ans-mark">${a.correct ? "✓" : "✗"}</td>
        ${!a.correct ? `<td class="ans-correct-val">${escHtml(correctOpt)}</td>` : "<td></td>"}
      </tr>`;
    }).join("");

    return `<div class="admin-card">
      <div class="admin-card-header">
        <div class="admin-name">${escHtml(r.name)}</div>
        <div class="admin-meta">${date}</div>
        <div class="admin-score ${scoreClass}">${r.score}% <small>${r.correct}/${r.total}</small></div>
      </div>
      <div class="admin-sections">${sectionPills}</div>
      <details class="admin-answers">
        <summary>View all answers</summary>
        <div class="table-wrap">
          <table class="ans-table">
            <thead><tr><th>Section</th><th>Question</th><th>Type</th><th>Selected / Submitted</th><th></th><th>Correct Answer</th></tr></thead>
            <tbody>${answerRows}</tbody>
          </table>
        </div>
      </details>
    </div>`;
  }).join("");
}

function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
