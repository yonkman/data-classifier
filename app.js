// ============================================================
// Main Application Logic
// ============================================================

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────
  let groupName = '';
  let labeledExamples = {};      // { id: "iconic" | "basic" }
  let customExamples = [];       // [ { text, label } ]
  let classifier = null;
  let testResults = null;
  let currentFilter = 'all';

  // Fisher-Yates shuffle (in-place)
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  let bankShuffled = false;
  let bankSearchQuery = '';
  const isTestMode = new URLSearchParams(window.location.search).get('testMode') === 'true';

  const CATEGORIES = {
    'obviously-iconic':    '💅 Obviously Iconic',
    'obviously-basic':     '🥱 Obviously Basic',
    'sneaky-iconic':       '✨ Sneaky Iconic',
    'sneaky-basic':        '👀 Sneaky Basic',
    'pop-culture':         '🎬 Pop Culture',
    'dramatic':            '🎭 Dramatic',
    'wholesome':           '💖 Wholesome',
    'confident':           '💪 Confident',
    'mundane':             '🪨 Mundane',
  };

  // ── Navigation ───────────────────────────────────────────
  const steps = ['step-welcome', 'step-curate', 'step-tutorial', 'step-train', 'step-results', 'step-explainer'];
  const tutorialEngine = new TutorialEngine();
  let useTutorialClassifier = false;  // true if student completed all challenges
  let currentStep = 0;

  function showStep(idx) {
    currentStep = idx;
    steps.forEach((id, i) => {
      document.getElementById(id).classList.toggle('active', i === idx);
    });

    // Widen container for tutorial step, shrink for others
    document.querySelector('.app-container').classList.toggle('wide-for-tutorial', idx === 2);
    // Update nav dots
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
      dot.classList.toggle('completed', i < idx);
    });
    // Update nav buttons
    document.getElementById('btn-prev').disabled = idx === 0;
    const nextBtn = document.getElementById('btn-next');
    nextBtn.style.display = idx === steps.length - 1 ? 'none' : '';
    nextBtn.textContent = 'Next →';

    if (idx === 1) renderBank();
    if (idx === 2) renderTutorial();
    if (idx === 3) renderTrainStep();
    if (idx === 4) {
      // Auto-run test when entering results step
      if (classifier && !testResults) {
        testResults = classifier.evaluate(TEST_SET);
      }
      renderResults();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextStep(skipCheck) {
    if (currentStep === 2 && !skipCheck && !tutorialEngine.allComplete()) {
      alert('Please complete all tutorial challenges before continuing, or click "Skip Tutorial" to move on.');
      return;
    }
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

    const posCount = Object.values(labeledExamples).filter(l => l === 'iconic').length +
                     customExamples.filter(e => e.label === 'iconic').length;
    const negCount = Object.values(labeledExamples).filter(l => l === 'basic').length +
                     customExamples.filter(e => e.label === 'basic').length;

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
  let currentTier = 'easy';
  const savedTierCode = {};  // { tier: { challengeId: code } }

  function renderTutorial() {
    if (tutorialRendered) {
      updateTutorialProgress();
      return;
    }
    tutorialRendered = true;
    renderTutorialChallenges();
    updateTutorialProgress();
  }

  function renderTutorialChallenges() {
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
            <button class="btn btn-secondary tut-btn-reset" data-challenge="${challenge.id}" title="Reset to starter code">🔄 Reset</button>
          </div>
          <div class="tut-editor-container">
            <div class="tut-line-numbers" id="tut-lines-${challenge.id}"></div>
            <textarea class="tut-editor" id="tut-editor-${challenge.id}"
                      spellcheck="false" autocomplete="off" autocorrect="off"
                      autocapitalize="off">${challenge.starterCode}</textarea>
          </div>
        </div>
        <div class="tut-actions">
          <button class="btn btn-success tut-btn-run" data-challenge="${challenge.id}">▶ Run &amp; Test</button>
        </div>
        <div class="tut-hints" id="tut-hints-${challenge.id}"></div>
        <div class="tut-output" id="tut-output-${challenge.id}"></div>
      `;

      container.appendChild(div);
    }

    // Initialise line numbers for every editor
    for (const challenge of TUTORIAL_CHALLENGES) {
      const editor = document.getElementById(`tut-editor-${challenge.id}`);
      const gutter = document.getElementById(`tut-lines-${challenge.id}`);
      if (editor && gutter) {
        syncLineNumbers(editor, gutter);
        editor.addEventListener('input', () => syncLineNumbers(editor, gutter));
        editor.addEventListener('scroll', () => { gutter.scrollTop = editor.scrollTop; });
      }
    }
  }

  /** Update the line-number gutter to match the textarea content */
  function syncLineNumbers(editor, gutter) {
    const lineCount = editor.value.split('\n').length;
    const nums = [];
    for (let i = 1; i <= lineCount; i++) nums.push(i);
    gutter.textContent = nums.join('\n');
  }

  /** Save whatever the student typed in the current tier's editors */
  function saveTierCode() {
    if (!tutorialRendered) return;
    const snapshot = {};
    for (const challenge of TUTORIAL_CHALLENGES) {
      const editor = document.getElementById(`tut-editor-${challenge.id}`);
      if (editor) snapshot[challenge.id] = editor.value;
    }
    savedTierCode[currentTier] = snapshot;
  }

  /** Restore previously-saved code into the current tier's editors */
  function restoreTierCode(tier) {
    const snapshot = savedTierCode[tier];
    if (!snapshot) return;
    for (const challenge of TUTORIAL_CHALLENGES) {
      const editor = document.getElementById(`tut-editor-${challenge.id}`);
      const gutter = document.getElementById(`tut-lines-${challenge.id}`);
      if (editor && snapshot[challenge.id] !== undefined) {
        editor.value = snapshot[challenge.id];
        if (gutter) syncLineNumbers(editor, gutter);
      }
    }
  }

  function switchTier(tier) {
    if (tier === currentTier && tutorialRendered) return;

    // Save code from the tier we're leaving
    saveTierCode();

    currentTier = tier;

    // Update active tier card
    document.querySelectorAll('.tier-card').forEach(card => {
      card.classList.toggle('active', card.dataset.tier === tier);
    });

    // Switch the underlying data
    setTutorialTier(tier);

    // Reset the engine
    tutorialEngine.reset();

    // Re-render challenges then restore any saved code
    renderTutorialChallenges();
    restoreTierCode(tier);
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
      // Try to extract a line number from the error stack
      let lineInfo = '';
      if (result.stack) {
        // new Function() body: line numbers in stack traces like <anonymous>:LINE:COL
        const m = result.stack.match(/<anonymous>:(\d+):(\d+)/);
        if (m) {
          const errLine = parseInt(m[1], 10);
          const errCol  = parseInt(m[2], 10);
          lineInfo = ` <span class="tut-error-line">(line ${errLine}, col ${errCol})</span>`;
        }
      }
      html += `<div class="tut-error">
        <div class="tut-error-header">❌ Error${lineInfo}</div>
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
    // Re-sync line numbers after loading solution
    const gutter = document.getElementById(`tut-lines-${challengeId}`);
    if (gutter) syncLineNumbers(editor, gutter);
  }

  function resetTutorialEditor(challengeId) {
    const challenge = TUTORIAL_CHALLENGES.find(c => c.id === challengeId);
    const editor = document.getElementById(`tut-editor-${challengeId}`);
    if (!challenge || !editor) return;

    if (!confirm('Reset to starter code? This will erase everything you\'ve typed for this challenge.')) return;
    editor.value = challenge.starterCode;
    // Re-sync line numbers after reset
    const gutter = document.getElementById(`tut-lines-${challengeId}`);
    if (gutter) syncLineNumbers(editor, gutter);
    // Clear any previous output
    const output = document.getElementById(`tut-output-${challengeId}`);
    if (output) output.innerHTML = '';
  }

  // ── Bank Rendering ───────────────────────────────────────
  function getFilteredBank() {
    let items = EXAMPLE_BANK;
    if (!bankShuffled) {
      shuffleArray(items);
      bankShuffled = true;
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
          <button class="btn-label btn-iconic ${currentLabel === 'iconic' ? 'selected' : ''}" data-id="${example.id}" data-label="iconic">
            💅 Iconic
          </button>
          <button class="btn-label btn-basic ${currentLabel === 'basic' ? 'selected' : ''}" data-id="${example.id}" data-label="basic">
            🥱 Basic
          </button>
          ${currentLabel ? `<button class="btn-clear" data-id="${example.id}" title="Clear label">✕</button>` : ''}
        </div>
      `;
      container.appendChild(card);
    }

    // Update counter
    updateCounter();
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
        <span class="custom-label-badge ${ex.label}">${ex.label === 'iconic' ? '💅' : '🥱'}</span>
        <span class="custom-text">${escapeHtml(ex.text)}</span>
        <button class="btn-remove-custom" data-index="${i}" title="Remove">✕</button>
      </div>
    `).join('');
  }

  // ── Student Classifier (uses hand-written tutorial code) ──
  function getStudentFunction(challengeId) {
    const names = { tokenize: 'tokenize', train: 'trainOnExample', predict: 'predictLabel' };
    const editor = document.getElementById(`tut-editor-${challengeId}`);
    if (!editor) return null;
    try {
      return new Function(editor.value + `\nreturn ${names[challengeId]};`)();
    } catch (e) {
      return null;
    }
  }

  /**
   * A classifier that wraps the student's hand-written tokenize,
   * trainOnExample, and predictLabel functions so they conform to
   * the same interface the rest of the app expects.
   */
  class StudentClassifier {
    constructor(tokenizeFn, trainFn, predictFn) {
      this._tokenize = tokenizeFn;
      this._trainFn = trainFn;
      this._predictFn = predictFn;
      this.classes = {};
      this.vocabulary = new Set();
      this.totalDocs = 0;
    }

    tokenize(text) {
      return this._tokenize(text);
    }

    train(examples) {
      this.classes = {};
      this.vocabulary = new Set();
      this.totalDocs = 0;

      // Initialize classes
      const labels = [...new Set(examples.map(e => e.label))];
      for (const l of labels) {
        this.classes[l] = { wordCounts: {}, docCount: 0, totalWords: 0 };
      }

      for (const { text, label } of examples) {
        this._trainFn(this.classes, label, text, this._tokenize);
        this.totalDocs++;
        // Track vocabulary
        for (const word of this._tokenize(text)) {
          this.vocabulary.add(word);
        }
      }
    }

    predict(text) {
      const label = this._predictFn(
        this.classes, text, this.totalDocs, this.vocabulary.size, this._tokenize
      );

      // Compute scores & confidence (mirrors NaiveBayesClassifier)
      const tokens = this._tokenize(text);
      const vocabSize = this.vocabulary.size;
      const scores = {};
      for (const [cn, cls] of Object.entries(this.classes)) {
        let logProb = Math.log(cls.docCount / this.totalDocs);
        for (const word of tokens) {
          const wc = cls.wordCounts[word] || 0;
          logProb += Math.log((wc + 1) / (cls.totalWords + vocabSize));
        }
        scores[cn] = logProb;
      }
      const classNames = Object.keys(scores);
      const maxScore = Math.max(...Object.values(scores));
      const expScores = classNames.map(c => Math.exp(scores[c] - maxScore));
      const sumExp = expScores.reduce((a, b) => a + b, 0);
      const confidence = {};
      classNames.forEach((c, i) => { confidence[c] = expScores[i] / sumExp; });

      return { label, confidence, scores };
    }

    predictWithDetails(text) {
      const tokens = this._tokenize(text);
      const vocabSize = this.vocabulary.size;

      const wordDetails = tokens.map(word => {
        const entry = { word, scores: {} };
        for (const [cn, cls] of Object.entries(this.classes)) {
          const wc = cls.wordCounts[word] || 0;
          entry.scores[cn] = Math.log((wc + 1) / (cls.totalWords + vocabSize));
        }
        if (entry.scores['iconic'] !== undefined && entry.scores['basic'] !== undefined) {
          entry.influence = entry.scores['iconic'] - entry.scores['basic'];
        }
        return entry;
      });

      const prediction = this.predict(text);
      return { ...prediction, wordDetails };
    }

    evaluate(testSet) {
      const results = testSet.map(item => {
        const prediction = this.predictWithDetails(item.text);
        return {
          text: item.text,
          expected: item.expected,
          predicted: prediction.label,
          confidence: prediction.confidence,
          correct: prediction.label === item.expected,
          explanation: item.explanation || '',
          difficulty: item.difficulty || 'medium',
          wordDetails: prediction.wordDetails,
        };
      });
      const correct = results.filter(r => r.correct).length;
      const accuracy = results.length > 0 ? correct / results.length : 0;
      return { results, accuracy, correct, total: results.length };
    }

    getStats() {
      const stats = { totalDocs: this.totalDocs, vocabSize: this.vocabulary.size, classes: {} };
      for (const [cn, cls] of Object.entries(this.classes)) {
        stats.classes[cn] = { docCount: cls.docCount, uniqueWords: Object.keys(cls.wordCounts).length };
      }
      return stats;
    }
  }

  // ── Train Step ───────────────────────────────────────────
  function renderTrainStep() {
    const data = getAllTrainingData();
    const count = data.length;
    const posCount = data.filter(d => d.label === 'iconic').length;
    const negCount = data.filter(d => d.label === 'basic').length;

    document.getElementById('train-total').textContent = count;
    document.getElementById('train-iconic').textContent = posCount;
    document.getElementById('train-basic').textContent = negCount;

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
      balanceWarning.textContent = '⚠️ You need examples in both categories (iconic AND basic) to train.';;
      balanceWarning.style.display = 'block';
    }

    // Reset results
    document.getElementById('train-output').style.display = 'none';
  }

  function trainModel() {
    const data = getAllTrainingData();
    if (data.length < 2) {
      alert('You need at least 2 labeled examples to train.');
      return;
    }

    const posCount = data.filter(d => d.label === 'iconic').length;
    const negCount = data.filter(d => d.label === 'basic').length;
    if (posCount === 0 || negCount === 0) {
      alert('You need at least one example in each category (iconic and basic).');
      return;
    }

    // Animate training
    const btn = document.getElementById('btn-train');
    const output = document.getElementById('train-output');
    btn.disabled = true;
    btn.textContent = '⏳ Training...';

    setTimeout(() => {
      // Use student-written code if they completed the tutorial
      if (useTutorialClassifier) {
        const tokenizeFn = getStudentFunction('tokenize');
        const trainFn    = getStudentFunction('train');
        const predictFn  = getStudentFunction('predict');

        if (tokenizeFn && trainFn && predictFn) {
          classifier = new StudentClassifier(tokenizeFn, trainFn, predictFn);
        } else {
          // Fallback if editors are unavailable
          classifier = new NaiveBayesClassifier();
        }
      } else {
        classifier = new NaiveBayesClassifier();
      }
      classifier.train(data);

      const stats = classifier.getStats();

      output.style.display = 'block';
      const usingStudent = useTutorialClassifier && classifier instanceof StudentClassifier;
      output.innerHTML = `
        <div class="train-stats">
          <h3>✅ Model Trained!</h3>
          ${usingStudent ? '<p style="color:var(--green); font-weight:600; margin-bottom:.5rem">🧑‍💻 Using YOUR hand-written classifier code!</p>' : ''}
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
              <div class="stat-value">${stats.classes['iconic']?.docCount || 0}</div>
              <div class="stat-label">💅 Iconic Examples</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.classes['basic']?.docCount || 0}</div>
              <div class="stat-label">🥱 Basic Examples</div>
            </div>
          </div>
        </div>
      `;

      btn.disabled = false;
      btn.textContent = '🔄 Retrain Model';

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
    const iconicConf = (result.confidence['iconic'] * 100).toFixed(1);
    const basicConf = (result.confidence['basic'] * 100).toFixed(1);

    output.innerHTML = `
      <div class="try-result ${result.label}">
        <span class="prediction-badge ${result.label}">
          ${result.label === 'iconic' ? '💅 Iconic' : '🥱 Basic'}
        </span>
        <div class="confidence-bars">
          <div class="conf-row">
            <span>Iconic</span>
            <div class="conf-bar"><div class="conf-fill iconic" style="width: ${iconicConf}%"></div></div>
            <span>${iconicConf}%</span>
          </div>
          <div class="conf-row">
            <span>Basic</span>
            <div class="conf-bar"><div class="conf-fill basic" style="width: ${basicConf}%"></div></div>
            <span>${basicConf}%</span>
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
    showStep(4);
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

      // Build word influence breakdown
      let wordBreakdownHtml = '';
      if (r.wordDetails && r.wordDetails.length > 0) {
        // Sort words by absolute influence (most impactful first)
        const sortedWords = [...r.wordDetails].sort((a, b) => Math.abs(b.influence || 0) - Math.abs(a.influence || 0));
        const wordTags = sortedWords.map(w => {
          const inf = w.influence || 0;
          let cls, arrow;
          if (inf > 0.3) { cls = 'word-strong-pos'; arrow = '↑↑'; }
          else if (inf > 0) { cls = 'word-pos'; arrow = '↑'; }
          else if (inf < -0.3) { cls = 'word-strong-neg'; arrow = '↓↓'; }
          else if (inf < 0) { cls = 'word-neg'; arrow = '↓'; }
          else { cls = 'word-neutral'; arrow = '·'; }
          return `<span class="word-chip ${cls}" title="Toward iconic: ${w.scores['iconic']?.toFixed(2) || '?'} | Toward basic: ${w.scores['basic']?.toFixed(2) || '?'} | Net: ${inf >= 0 ? '+' : ''}${inf.toFixed(2)}">${escapeHtml(w.word)} <span class="word-arrow">${arrow}</span></span>`;
        });
        wordBreakdownHtml = `
          <div class="word-breakdown">
            <div class="word-breakdown-label">Why? Word influence <span class="word-legend"> <span class="word-chip word-pos">↑ iconic</span> <span class="word-chip word-neg">↓ basic</span></span></div>
            <div class="word-chips">${wordTags.join(' ')}</div>
          </div>`;
      }

      card.innerHTML = `
        <p class="result-text">"${escapeHtml(r.text)}"</p>
        <div class="result-labels">
          <span class="result-expected">Expected: <strong>${r.expected === 'iconic' ? '💅 Iconic' : '🥱 Basic'}</strong></span>
          <span class="result-predicted ${r.correct ? '' : 'wrong'}">Model said: <strong>${r.predicted === 'iconic' ? '💅 Iconic' : '🥱 Basic'}</strong></span>
          <span class="result-verdict">${r.correct ? '✅' : '❌'}</span>
        </div>
        <div class="result-confidence">
          <small>Confidence — Iconic: ${(r.confidence['iconic'] * 100).toFixed(0)}% · Basic: ${(r.confidence['basic'] * 100).toFixed(0)}%</small>
        </div>
        ${wordBreakdownHtml}
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
    if (target.matches('.tut-btn-reset') || target.closest('.tut-btn-reset')) {
      const btn = target.closest('.tut-btn-reset') || target;
      resetTutorialEditor(btn.dataset.challenge);
      return;
    }
    if (target.id === 'btn-skip-tutorial' || target.closest('#btn-skip-tutorial')) {
      useTutorialClassifier = false;
      nextStep(true);
      return;
    }

    // Nav dots
    if (target.matches('.nav-dot')) {
      const idx = parseInt(target.dataset.step);
      if (idx <= currentStep) showStep(idx);
    }

    // Tier selector
    if (target.matches('.tier-card') || target.closest('.tier-card')) {
      const card = target.closest('.tier-card') || target;
      const tier = card.dataset.tier;
      if (tier) switchTier(tier);
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
    // Auto-label all bank examples based on category
    const iconicCategories = new Set([
      'obviously-iconic', 'sneaky-iconic', 'pop-culture', 'dramatic', 'wholesome', 'confident'
    ]);
    const basicCategories = new Set([
      'obviously-basic', 'sneaky-basic', 'mundane'
    ]);

    for (const ex of EXAMPLE_BANK) {
      if (iconicCategories.has(ex.category)) {
        labeledExamples[ex.id] = 'iconic';
      } else if (basicCategories.has(ex.category)) {
        labeledExamples[ex.id] = 'basic';
      }
    }

    groupName = 'Test Mode';
    document.querySelectorAll('.group-name-display').forEach(el => el.textContent = groupName);

    // Train
    classifier = new NaiveBayesClassifier();
    classifier.train(getAllTrainingData());
    testResults = classifier.evaluate(TEST_SET);
    showStep(4);
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
