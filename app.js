// ============================================================
// Main Application Logic
// ============================================================

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────
  let groupName = '';
  let labeledExamples = {};      // { id: "positive" | "negative" }
  let customExamples = [];       // [ { text, label } ]
  let classifier = null;
  let testResults = null;
  let currentFilter = 'all';
  let bankSearchQuery = '';
  const isTestMode = new URLSearchParams(window.location.search).get('testMode') === 'true';

  const CATEGORIES = {
    'straightforward-positive': '✅ Clearly Supportive',
    'straightforward-negative': '🚫 Clearly Harmful',
    'reclaimed':               '🔄 Reclaimed Language',
    'hostile-slang':           '⚠️ Hostile Use of Slang',
    'hostile-context':         '⚠️ Hostile Context',
    'sarcasm':                 '🎭 Sarcasm & Irony',
    'ambiguous':               '❓ Ambiguous',
    'reporting-harm':          '📢 Reporting Harm',
    'ally':                    '🤝 Ally / Educational',
    'coded-harm':              '🔍 Coded / Subtle Harm',
    'complex':                 '🧩 Mixed / Complex',
  };

  // ── Navigation ───────────────────────────────────────────
  const steps = ['step-welcome', 'step-curate', 'step-tutorial', 'step-train', 'step-explainer', 'step-results'];
  const tutorialEngine = new TutorialEngine();
  let useTutorialClassifier = false;  // true if student completed all challenges
  let currentStep = 0;

  function showStep(idx) {
    currentStep = idx;
    steps.forEach((id, i) => {
      document.getElementById(id).classList.toggle('active', i === idx);
    });
    // Update nav dots
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
      dot.classList.toggle('completed', i < idx);
    });
    // Update nav buttons
    document.getElementById('btn-prev').disabled = idx === 0;
    document.getElementById('btn-next').textContent = idx === steps.length - 1 ? 'Done' : 'Next →';

    if (idx === 1) renderBank();
    if (idx === 2) renderTutorial();
    if (idx === 3) renderTrainStep();
    if (idx === 5) renderResults();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextStep() {
    if (currentStep === 0) {
      const input = document.getElementById('group-name-input');
      groupName = input.value.trim() || 'Team ' + Math.floor(Math.random() * 100);
      document.querySelectorAll('.group-name-display').forEach(el => el.textContent = groupName);
    }
    if (currentStep === 1) {
      const count = getLabeledCount();
      if (count < 10) {
        if (!confirm(`You've only labeled ${count} examples. We recommend at least 20 for decent results. Continue anyway?`)) return;
      }
    }
    if (currentStep === 3) {
      if (!classifier) {
        alert('Please train your model first!');
        return;
      }
    }
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 0) showStep(currentStep - 1);
  }

  // ── Helpers ──────────────────────────────────────────────
  function getLabeledCount() {
    return Object.keys(labeledExamples).length + customExamples.length;
  }

  function getAllTrainingData() {
    const data = [];
    for (const [id, label] of Object.entries(labeledExamples)) {
      const ex = EXAMPLE_BANK.find(e => e.id === parseInt(id));
      if (ex) data.push({ text: ex.text, label });
    }
    for (const ex of customExamples) {
      data.push({ text: ex.text, label: ex.label });
    }
    return data;
  }

  function updateCounter() {
    const count = getLabeledCount();
    document.querySelectorAll('.label-count').forEach(el => el.textContent = count);

    const posCount = Object.values(labeledExamples).filter(l => l === 'positive').length +
                     customExamples.filter(e => e.label === 'positive').length;
    const negCount = Object.values(labeledExamples).filter(l => l === 'negative').length +
                     customExamples.filter(e => e.label === 'negative').length;

    document.querySelectorAll('.pos-count').forEach(el => el.textContent = posCount);
    document.querySelectorAll('.neg-count').forEach(el => el.textContent = negCount);

    // Progress bar
    const pct = Math.min(100, Math.round((count / 20) * 100));
    const bar = document.getElementById('progress-fill');
    if (bar) {
      bar.style.width = pct + '%';
      bar.setAttribute('data-count', count);
    }
  }

  // ── Tutorial Rendering ───────────────────────────────────
  let tutorialRendered = false;

  function renderTutorial() {
    if (tutorialRendered) {
      updateTutorialProgress();
      return;
    }
    tutorialRendered = true;

    const container = document.getElementById('tutorial-challenges');
    if (!container) return;

    container.innerHTML = '';

    for (const challenge of TUTORIAL_CHALLENGES) {
      const div = document.createElement('div');
      div.className = 'tut-challenge';
      div.id = `tut-${challenge.id}`;

      div.innerHTML = `
        <div class="tut-challenge-header">
          <div class="tut-status" id="tut-status-${challenge.id}">
            <span class="tut-status-icon">⬜</span>
          </div>
          <div>
            <h3>${challenge.title}</h3>
          </div>
        </div>
        <div class="tut-description">${challenge.description}</div>
        <div class="tut-editor-wrapper">
          <div class="tut-editor-toolbar">
            <span class="tut-editor-label">📝 Your Code</span>
            <button class="btn btn-secondary tut-btn-hint" data-challenge="${challenge.id}">💡 Hint</button>
            <button class="btn btn-secondary tut-btn-solution" data-challenge="${challenge.id}">👀 Show Solution</button>
          </div>
          <textarea class="tut-editor" id="tut-editor-${challenge.id}"
                    spellcheck="false" autocomplete="off" autocorrect="off"
                    autocapitalize="off">${challenge.starterCode}</textarea>
        </div>
        <div class="tut-actions">
          <button class="btn btn-success tut-btn-run" data-challenge="${challenge.id}">▶ Run &amp; Test</button>
        </div>
        <div class="tut-hints" id="tut-hints-${challenge.id}"></div>
        <div class="tut-output" id="tut-output-${challenge.id}"></div>
      `;

      container.appendChild(div);
    }

    updateTutorialProgress();
  }

  function updateTutorialProgress() {
    const done = TUTORIAL_CHALLENGES.filter(c => tutorialEngine.isComplete(c.id)).length;
    const total = TUTORIAL_CHALLENGES.length;
    const text = document.getElementById('tut-progress-text');
    const fill = document.getElementById('tut-progress-fill');
    if (text) text.textContent = `${done} / ${total} challenges completed`;
    if (fill) fill.style.width = `${Math.round((done / total) * 100)}%`;

    // Update status icons
    for (const c of TUTORIAL_CHALLENGES) {
      const icon = document.querySelector(`#tut-status-${c.id} .tut-status-icon`);
      if (icon) {
        icon.textContent = tutorialEngine.isComplete(c.id) ? '✅' : '⬜';
      }
    }

    // Show completion banner
    const banner = document.getElementById('tutorial-complete-banner');
    if (banner) {
      banner.style.display = tutorialEngine.allComplete() ? 'block' : 'none';
    }
  }

  function runTutorialChallenge(challengeId) {
    const editor = document.getElementById(`tut-editor-${challengeId}`);
    const outputEl = document.getElementById(`tut-output-${challengeId}`);
    if (!editor || !outputEl) return;

    const code = editor.value;
    const result = tutorialEngine.runChallenge(challengeId, code);

    let html = '';

    if (result.error) {
      html += `<div class="tut-error">
        <div class="tut-error-header">❌ Error</div>
        <pre class="tut-error-msg">${escapeHtml(result.error)}</pre>
      </div>`;
    }

    if (result.testResults && result.testResults.length > 0) {
      html += '<div class="tut-test-results">';
      for (const tr of result.testResults) {
        html += `<div class="tut-test ${tr.pass ? 'pass' : 'fail'}">
          <span class="tut-test-icon">${tr.pass ? '✅' : '❌'}</span>
          <div class="tut-test-body">
            <div class="tut-test-desc">${tr.description}</div>
            ${tr.input !== undefined ? `<div class="tut-test-io"><code>Input: "${escapeHtml(String(tr.input))}"</code></div>` : ''}
            ${tr.expected !== undefined ? `<div class="tut-test-io"><code>Expected: ${escapeHtml(JSON.stringify(tr.expected))}</code></div>` : ''}
            ${tr.actual !== undefined ? `<div class="tut-test-io"><code>Your output: ${escapeHtml(typeof tr.actual === 'string' ? tr.actual : JSON.stringify(tr.actual))}</code></div>` : ''}
          </div>
        </div>`;
      }
      html += '</div>';
    }

    if (result.success) {
      html += `<div class="tut-success">🎉 All tests passed!</div>`;
      if (tutorialEngine.allComplete()) {
        useTutorialClassifier = true;
      }
    }

    outputEl.innerHTML = html;
    outputEl.style.display = 'block';
    updateTutorialProgress();
  }

  function showTutorialHint(challengeId) {
    const hintData = tutorialEngine.getNextHint(challengeId);
    const container = document.getElementById(`tut-hints-${challengeId}`);
    if (!container || !hintData) return;

    const hintEl = document.createElement('div');
    hintEl.className = 'tut-hint';
    hintEl.innerHTML = `<span class="tut-hint-label">💡 Hint ${hintData.index + 1}/${hintData.total}:</span> ${hintData.hint}`;
    container.appendChild(hintEl);
  }

  function showTutorialSolution(challengeId) {
    const challenge = TUTORIAL_CHALLENGES.find(c => c.id === challengeId);
    const editor = document.getElementById(`tut-editor-${challengeId}`);
    if (!challenge || !editor) return;

    if (!confirm('Are you sure? Try the hints first! This will replace your code with the solution.')) return;
    editor.value = challenge.solution;
  }

  // ── Bank Rendering ───────────────────────────────────────
  function getFilteredBank() {
    let items = EXAMPLE_BANK;
    if (currentFilter !== 'all') {
      items = items.filter(e => e.category === currentFilter);
    }
    if (bankSearchQuery) {
      const q = bankSearchQuery.toLowerCase();
      items = items.filter(e => e.text.toLowerCase().includes(q));
    }
    return items;
  }

  function renderBank() {
    const container = document.getElementById('bank-cards');
    if (!container) return;

    const items = getFilteredBank();
    container.innerHTML = '';

    if (items.length === 0) {
      container.innerHTML = '<p class="empty-state">No matching examples. Try a different filter or search term.</p>';
      return;
    }

    for (const example of items) {
      const card = document.createElement('div');
      card.className = 'example-card';
      const currentLabel = labeledExamples[example.id];
      if (currentLabel) card.classList.add('labeled', 'labeled-' + currentLabel);

      card.innerHTML = `
        <p class="example-text">${escapeHtml(example.text)}</p>
        ${example.note ? `<p class="example-note" style="display:${currentLabel ? 'block' : 'none'}">${escapeHtml(example.note)}</p>` : ''}
        <div class="label-buttons">
          <button class="btn-label btn-positive ${currentLabel === 'positive' ? 'selected' : ''}" data-id="${example.id}" data-label="positive">
            👍 Supportive
          </button>
          <button class="btn-label btn-negative ${currentLabel === 'negative' ? 'selected' : ''}" data-id="${example.id}" data-label="negative">
            👎 Harmful
          </button>
          ${currentLabel ? `<button class="btn-clear" data-id="${example.id}" title="Clear label">✕</button>` : ''}
        </div>
      `;
      container.appendChild(card);
    }

    // Category filter counts
    renderCategoryFilters();
    updateCounter();
  }

  function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    const allCount = EXAMPLE_BANK.length;
    let html = `<button class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">All (${allCount})</button>`;

    const catCounts = {};
    for (const ex of EXAMPLE_BANK) {
      catCounts[ex.category] = (catCounts[ex.category] || 0) + 1;
    }

    for (const [cat, name] of Object.entries(CATEGORIES)) {
      if (catCounts[cat]) {
        html += `<button class="filter-chip ${currentFilter === cat ? 'active' : ''}" data-filter="${cat}">${name} (${catCounts[cat]})</button>`;
      }
    }

    container.innerHTML = html;
  }

  // ── Custom Examples ──────────────────────────────────────
  function addCustomExample() {
    const textInput = document.getElementById('custom-text');
    const labelSelect = document.getElementById('custom-label');
    const text = textInput.value.trim();
    const label = labelSelect.value;

    if (!text) { textInput.focus(); return; }

    customExamples.push({ text, label, id: 'custom-' + Date.now() });
    textInput.value = '';
    renderCustomList();
    updateCounter();
  }

  function renderCustomList() {
    const container = document.getElementById('custom-list');
    if (!container) return;

    if (customExamples.length === 0) {
      container.innerHTML = '<p class="empty-state">No custom examples yet. Write some above!</p>';
      return;
    }

    container.innerHTML = customExamples.map((ex, i) => `
      <div class="custom-item ${ex.label}">
        <span class="custom-label-badge ${ex.label}">${ex.label === 'positive' ? '👍' : '👎'}</span>
        <span class="custom-text">${escapeHtml(ex.text)}</span>
        <button class="btn-remove-custom" data-index="${i}" title="Remove">✕</button>
      </div>
    `).join('');
  }

  // ── Train Step ───────────────────────────────────────────
  function renderTrainStep() {
    const data = getAllTrainingData();
    const count = data.length;
    const posCount = data.filter(d => d.label === 'positive').length;
    const negCount = data.filter(d => d.label === 'negative').length;

    document.getElementById('train-total').textContent = count;
    document.getElementById('train-positive').textContent = posCount;
    document.getElementById('train-negative').textContent = negCount;

    // Balance warning
    const balanceWarning = document.getElementById('balance-warning');
    if (posCount > 0 && negCount > 0) {
      const ratio = Math.max(posCount, negCount) / Math.min(posCount, negCount);
      if (ratio > 2.5) {
        balanceWarning.textContent = `⚠️ Your data is imbalanced (${ratio.toFixed(1)}:1 ratio). This might cause the model to be biased toward the larger class.`;
        balanceWarning.style.display = 'block';
      } else {
        balanceWarning.style.display = 'none';
      }
    } else {
      balanceWarning.textContent = '⚠️ You need examples in both categories (supportive AND harmful) to train.';
      balanceWarning.style.display = 'block';
    }

    // Reset results
    document.getElementById('train-output').style.display = 'none';
    document.getElementById('btn-test').disabled = true;
  }

  function trainModel() {
    const data = getAllTrainingData();
    if (data.length < 2) {
      alert('You need at least 2 labeled examples to train.');
      return;
    }

    const posCount = data.filter(d => d.label === 'positive').length;
    const negCount = data.filter(d => d.label === 'negative').length;
    if (posCount === 0 || negCount === 0) {
      alert('You need at least one example in each category (supportive and harmful).');
      return;
    }

    // Animate training
    const btn = document.getElementById('btn-train');
    const output = document.getElementById('train-output');
    btn.disabled = true;
    btn.textContent = '⏳ Training...';

    setTimeout(() => {
      classifier = new NaiveBayesClassifier();
      classifier.train(data);

      const stats = classifier.getStats();

      output.style.display = 'block';
      output.innerHTML = `
        <div class="train-stats">
          <h3>✅ Model Trained!</h3>
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-value">${stats.totalDocs}</div>
              <div class="stat-label">Training Examples</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.vocabSize}</div>
              <div class="stat-label">Unique Words Learned</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.classes['positive']?.docCount || 0}</div>
              <div class="stat-label">Supportive Examples</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.classes['negative']?.docCount || 0}</div>
              <div class="stat-label">Harmful Examples</div>
            </div>
          </div>
        </div>
      `;

      btn.disabled = false;
      btn.textContent = '🔄 Retrain Model';
      document.getElementById('btn-test').disabled = false;

      // Also enable the try-it-out area
      document.getElementById('try-it-section').style.display = 'block';
    }, 800 + Math.random() * 700);  // fake a brief delay for dramatic effect
  }

  function tryPredict() {
    if (!classifier) return;
    const input = document.getElementById('try-input');
    const text = input.value.trim();
    if (!text) return;

    const result = classifier.predict(text);
    const output = document.getElementById('try-output');
    const posConf = (result.confidence['positive'] * 100).toFixed(1);
    const negConf = (result.confidence['negative'] * 100).toFixed(1);

    output.innerHTML = `
      <div class="try-result ${result.label}">
        <span class="prediction-badge ${result.label}">
          ${result.label === 'positive' ? '👍 Supportive' : '👎 Harmful'}
        </span>
        <div class="confidence-bars">
          <div class="conf-row">
            <span>Supportive</span>
            <div class="conf-bar"><div class="conf-fill positive" style="width: ${posConf}%"></div></div>
            <span>${posConf}%</span>
          </div>
          <div class="conf-row">
            <span>Harmful</span>
            <div class="conf-bar"><div class="conf-fill negative" style="width: ${negConf}%"></div></div>
            <span>${negConf}%</span>
          </div>
        </div>
      </div>
    `;
    output.style.display = 'block';
  }

  // ── Results Step ─────────────────────────────────────────
  function runTest() {
    if (!classifier) return;
    testResults = classifier.evaluate(TEST_SET);
    showStep(5);
  }

  function renderResults() {
    if (!testResults) return;

    const { results, accuracy, correct, total } = testResults;

    // Score display
    const pctScore = Math.round(accuracy * 100);
    document.getElementById('score-value').textContent = `${correct}/${total}`;
    document.getElementById('score-pct').textContent = `${pctScore}%`;
    document.getElementById('score-ring-fill').style.strokeDasharray = `${pctScore} ${100 - pctScore}`;

    // Color the ring
    const ring = document.getElementById('score-ring-fill');
    if (pctScore >= 80) ring.style.stroke = 'var(--green)';
    else if (pctScore >= 60) ring.style.stroke = 'var(--yellow)';
    else ring.style.stroke = 'var(--red)';

    // Result cards
    const container = document.getElementById('result-cards');
    container.innerHTML = '';

    // Sort: wrong answers first so they see the interesting failures
    const sorted = [...results].sort((a, b) => {
      if (a.correct === b.correct) return 0;
      return a.correct ? 1 : -1;
    });

    for (const r of sorted) {
      const card = document.createElement('div');
      card.className = `result-card ${r.correct ? 'correct' : 'incorrect'}`;

      card.innerHTML = `
        <p class="result-text">"${escapeHtml(r.text)}"</p>
        <div class="result-labels">
          <span class="result-expected">Expected: <strong>${r.expected === 'positive' ? '👍 Supportive' : '👎 Harmful'}</strong></span>
          <span class="result-predicted ${r.correct ? '' : 'wrong'}">Model said: <strong>${r.predicted === 'positive' ? '👍 Supportive' : '👎 Harmful'}</strong></span>
          <span class="result-verdict">${r.correct ? '✅' : '❌'}</span>
        </div>
        <div class="result-confidence">
          <small>Confidence — Supportive: ${(r.confidence['positive'] * 100).toFixed(0)}% · Harmful: ${(r.confidence['negative'] * 100).toFixed(0)}%</small>
        </div>
        ${r.explanation ? `<p class="result-explanation">💡 ${escapeHtml(r.explanation)}</p>` : ''}
        <span class="difficulty-badge ${r.difficulty}">${r.difficulty}</span>
      `;
      container.appendChild(card);
    }

    // Summary stats
    const easyResults = results.filter(r => r.difficulty === 'easy');
    const medResults = results.filter(r => r.difficulty === 'medium');
    const hardResults = results.filter(r => r.difficulty === 'hard');

    document.getElementById('easy-score').textContent =
      `${easyResults.filter(r => r.correct).length}/${easyResults.length}`;
    document.getElementById('medium-score').textContent =
      `${medResults.filter(r => r.correct).length}/${medResults.length}`;
    document.getElementById('hard-score').textContent =
      `${hardResults.filter(r => r.correct).length}/${hardResults.length}`;
  }

  // ── Utility ──────────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Event Delegation ─────────────────────────────────────
  document.addEventListener('click', (e) => {
    const target = e.target;

    // Label buttons in bank
    if (target.matches('.btn-label')) {
      const id = target.dataset.id;
      const label = target.dataset.label;
      labeledExamples[id] = label;
      renderBank();
      return;
    }

    // Clear label
    if (target.matches('.btn-clear')) {
      delete labeledExamples[target.dataset.id];
      renderBank();
      return;
    }

    // Category filter
    if (target.matches('.filter-chip')) {
      currentFilter = target.dataset.filter;
      renderBank();
      return;
    }

    // Remove custom example
    if (target.matches('.btn-remove-custom')) {
      customExamples.splice(parseInt(target.dataset.index), 1);
      renderCustomList();
      updateCounter();
      return;
    }

    // Navigation
    if (target.id === 'btn-next' || target.closest('#btn-next')) { nextStep(); return; }
    if (target.id === 'btn-prev' || target.closest('#btn-prev')) { prevStep(); return; }

    // Train
    if (target.id === 'btn-train' || target.closest('#btn-train')) { trainModel(); return; }

    // Test
    if (target.id === 'btn-test' || target.closest('#btn-test')) { runTest(); return; }

    // Try prediction
    if (target.id === 'btn-try' || target.closest('#btn-try')) { tryPredict(); return; }

    // Add custom
    if (target.id === 'btn-add-custom' || target.closest('#btn-add-custom')) { addCustomExample(); return; }

    // Tutorial buttons
    if (target.matches('.tut-btn-run') || target.closest('.tut-btn-run')) {
      const btn = target.closest('.tut-btn-run') || target;
      runTutorialChallenge(btn.dataset.challenge);
      return;
    }
    if (target.matches('.tut-btn-hint') || target.closest('.tut-btn-hint')) {
      const btn = target.closest('.tut-btn-hint') || target;
      showTutorialHint(btn.dataset.challenge);
      return;
    }
    if (target.matches('.tut-btn-solution') || target.closest('.tut-btn-solution')) {
      const btn = target.closest('.tut-btn-solution') || target;
      showTutorialSolution(btn.dataset.challenge);
      return;
    }
    if (target.id === 'btn-skip-tutorial' || target.closest('#btn-skip-tutorial')) {
      useTutorialClassifier = false;
      nextStep();
      return;
    }

    // Nav dots
    if (target.matches('.nav-dot')) {
      const idx = parseInt(target.dataset.step);
      if (idx <= currentStep) showStep(idx);
    }
  });

  // Search input for bank
  document.addEventListener('input', (e) => {
    if (e.target.id === 'bank-search') {
      bankSearchQuery = e.target.value.trim();
      renderBank();
    }
  });

  // Enter key for custom example
  document.addEventListener('keydown', (e) => {
    if (e.target.id === 'custom-text' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addCustomExample();
    }
    if (e.target.id === 'try-input' && e.key === 'Enter') {
      e.preventDefault();
      tryPredict();
    }
    // Tab support in tutorial code editors
    if (e.target.matches('.tut-editor') && e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = start + 2;
    }
  });

  // ── Test Mode: skip training ─────────────────────────────
  function skipTraining() {
    // Auto-label all bank examples with "correct" labels based on category
    const positiveCategories = new Set([
      'straightforward-positive', 'reclaimed', 'reporting-harm', 'ally', 'complex'
    ]);
    const negativeCategories = new Set([
      'straightforward-negative', 'hostile-slang', 'hostile-context', 'coded-harm'
    ]);

    for (const ex of EXAMPLE_BANK) {
      if (positiveCategories.has(ex.category)) {
        labeledExamples[ex.id] = 'positive';
      } else if (negativeCategories.has(ex.category)) {
        labeledExamples[ex.id] = 'negative';
      } else if (ex.category === 'sarcasm') {
        labeledExamples[ex.id] = 'positive';  // sarcasm here is pro-LGBTQ+
      } else if (ex.category === 'ambiguous') {
        // Skip ambiguous — let the model struggle with the test set
      }
    }

    groupName = 'Test Mode';
    document.querySelectorAll('.group-name-display').forEach(el => el.textContent = groupName);

    // Train
    classifier = new NaiveBayesClassifier();
    classifier.train(getAllTrainingData());
    testResults = classifier.evaluate(TEST_SET);
    showStep(5);
  }

  // ── Init ─────────────────────────────────────────────────
  if (isTestMode) {
    const skipBtn = document.getElementById('btn-skip-training');
    if (skipBtn) skipBtn.style.display = 'inline-flex';
  }

  document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-skip-training' || e.target.closest('#btn-skip-training')) {
      skipTraining();
    }
  });

  showStep(0);
})();
