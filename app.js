(function () {
  "use strict";

  // ── State ────────────────────────────────────────────────────────────────
  let candidateName = "";
  let currentIndex = 0;
  let answers = []; // { questionId, correct }

  // ── Element refs ─────────────────────────────────────────────────────────
  const screenStart = document.getElementById("screen-start");
  const screenTest = document.getElementById("screen-test");
  const screenResults = document.getElementById("screen-results");

  const inputName = document.getElementById("candidate-name");
  const nameError = document.getElementById("name-error");
  const btnStart = document.getElementById("btn-start");

  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");
  const headerName = document.getElementById("header-name");
  const sectionBadge = document.getElementById("section-badge");
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const codeBlockWrap = document.getElementById("code-block-wrap");
  const codeBlock = document.getElementById("code-block");
  const btnNext = document.getElementById("btn-next");
  const navHint = document.getElementById("nav-hint");

  const resultsName = document.getElementById("results-name");
  const scorePct = document.getElementById("score-pct");
  const scoreSub = document.getElementById("score-sub");
  const ringFill = document.getElementById("ring-fill");
  const sectionScores = document.getElementById("section-scores");
  const verdictEl = document.getElementById("verdict");
  const btnRestart = document.getElementById("btn-restart");

  // ── Navigation ───────────────────────────────────────────────────────────
  function showScreen(screen) {
    [screenStart, screenTest, screenResults].forEach((s) =>
      s.classList.remove("active")
    );
    screen.classList.add("active");
  }

  // ── Start ────────────────────────────────────────────────────────────────
  btnStart.addEventListener("click", startAssessment);
  inputName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startAssessment();
  });

  function startAssessment() {
    const val = inputName.value.trim();
    if (!val) {
      nameError.textContent = "Please enter your name to begin.";
      inputName.focus();
      return;
    }
    if (val.length < 2) {
      nameError.textContent = "Name must be at least 2 characters.";
      inputName.focus();
      return;
    }
    nameError.textContent = "";
    candidateName = val;
    currentIndex = 0;
    answers = [];
    headerName.textContent = candidateName;
    showScreen(screenTest);
    renderQuestion();
  }

  // ── Question rendering ───────────────────────────────────────────────────
  function renderQuestion() {
    const q = QUESTIONS[currentIndex];
    const total = QUESTIONS.length;

    // Progress
    const pct = (currentIndex / total) * 100;
    progressFill.style.width = pct + "%";
    progressLabel.textContent = `Question ${currentIndex + 1} of ${total}`;

    // Section badge
    sectionBadge.textContent = SECTIONS[q.section];
    sectionBadge.className = "section-badge section-" + q.section.toLowerCase();

    // Question
    questionText.textContent = q.text;

    // Code block
    if (q.code) {
      codeBlock.textContent = q.code;
      codeBlockWrap.style.display = "block";
    } else {
      codeBlockWrap.style.display = "none";
    }

    // Options — shuffle each render
    const shuffled = [...q.options].sort(() => Math.random() - 0.5);
    optionsContainer.innerHTML = "";
    shuffled.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.dataset.correct = opt.correct;
      btn.innerHTML = `<span class="opt-letter">${String.fromCharCode(65 + i)}</span><span class="opt-text">${opt.text}</span>`;
      btn.addEventListener("click", () => selectOption(btn, q));
      optionsContainer.appendChild(btn);
    });

    btnNext.disabled = true;
    btnNext.textContent =
      currentIndex === total - 1 ? "See Results" : "Next Question";
    navHint.textContent = "";
  }

  function selectOption(selected, q) {
    // Prevent re-selection
    if (optionsContainer.querySelector(".option-btn.selected")) return;

    const correct = selected.dataset.correct === "true";
    selected.classList.add("selected", correct ? "correct" : "incorrect");

    // Reveal correct answer if wrong
    if (!correct) {
      optionsContainer.querySelectorAll(".option-btn").forEach((btn) => {
        if (btn.dataset.correct === "true") btn.classList.add("correct");
      });
    }

    // Disable all
    optionsContainer.querySelectorAll(".option-btn").forEach((btn) => {
      btn.disabled = true;
    });

    // Store answer
    answers.push({ questionId: q.id, section: q.section, correct });

    // Show explanation hint
    navHint.textContent = q.explanation;
    navHint.className = "nav-hint" + (correct ? " hint-correct" : " hint-wrong");

    btnNext.disabled = false;
  }

  btnNext.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex < QUESTIONS.length) {
      renderQuestion();
    } else {
      showResults();
    }
  });

  // ── Results ──────────────────────────────────────────────────────────────
  function showResults() {
    const total = QUESTIONS.length;
    const correct = answers.filter((a) => a.correct).length;
    const pct = Math.round((correct / total) * 100);

    // Progress fill to 100%
    progressFill.style.width = "100%";

    resultsName.textContent = candidateName;
    scorePct.textContent = pct + "%";
    scoreSub.textContent = `${correct} / ${total} correct`;

    // Animate ring
    const circumference = 326.7;
    const offset = circumference - (pct / 100) * circumference;
    // Set colour class
    ringFill.className =
      "ring-fill " + (pct >= 80 ? "ring-green" : pct >= 50 ? "ring-amber" : "ring-red");
    setTimeout(() => {
      ringFill.style.strokeDashoffset = offset;
    }, 100);

    // Per-section scores
    const sections = Object.keys(SECTIONS);
    sectionScores.innerHTML = sections
      .map((sec) => {
        const secAnswers = answers.filter((a) => a.section === sec);
        const secCorrect = secAnswers.filter((a) => a.correct).length;
        const secTotal = secAnswers.length;
        const secPct = secTotal ? Math.round((secCorrect / secTotal) * 100) : 0;
        return `<div class="sec-score">
          <span class="sec-label">${SECTIONS[sec]}</span>
          <div class="sec-bar"><div class="sec-fill" style="width:${secPct}%;background:${barColor(secPct)}"></div></div>
          <span class="sec-pct">${secCorrect}/${secTotal}</span>
        </div>`;
      })
      .join("");

    // Verdict
    let verdictText, verdictClass;
    if (pct >= 80) {
      verdictText = "Excellent work! Strong technical foundation — a great fit for the support team.";
      verdictClass = "verdict-pass";
    } else if (pct >= 50) {
      verdictText = "Good effort. Some areas to strengthen before joining the team.";
      verdictClass = "verdict-mid";
    } else {
      verdictText = "There are significant gaps. We recommend revisiting the fundamentals covered in this assessment.";
      verdictClass = "verdict-fail";
    }
    verdictEl.textContent = verdictText;
    verdictEl.className = "verdict " + verdictClass;

    showScreen(screenResults);
  }

  function barColor(pct) {
    if (pct >= 80) return "#22c55e";
    if (pct >= 50) return "#f59e0b";
    return "#ef4444";
  }

  btnRestart.addEventListener("click", () => {
    inputName.value = "";
    showScreen(screenStart);
    inputName.focus();
  });
})();
