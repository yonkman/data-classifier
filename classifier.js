// ============================================================
// Naive Bayes Text Classifier — runs entirely in-browser
// ============================================================

class NaiveBayesClassifier {
  constructor() {
    this.classes = {};        // { className: { wordCounts: {}, docCount: 0, totalWords: 0 } }
    this.vocabulary = new Set();
    this.totalDocs = 0;
  }

  // ── Tokenizer ──────────────────────────────────────────────
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9'\s-]/g, ' ')   // keep apostrophes & hyphens
      .split(/\s+/)
      .filter(t => t.length > 1);         // drop single chars
  }

  // ── Training ───────────────────────────────────────────────
  train(examples) {
    // examples = [ { text: "...", label: "positive" | "negative" }, … ]
    this.classes = {};
    this.vocabulary = new Set();
    this.totalDocs = 0;

    for (const { text, label } of examples) {
      if (!this.classes[label]) {
        this.classes[label] = { wordCounts: {}, docCount: 0, totalWords: 0 };
      }

      const cls = this.classes[label];
      cls.docCount++;
      this.totalDocs++;

      for (const word of this.tokenize(text)) {
        cls.wordCounts[word] = (cls.wordCounts[word] || 0) + 1;
        cls.totalWords++;
        this.vocabulary.add(word);
      }
    }
  }

  // ── Prediction ─────────────────────────────────────────────
  predict(text) {
    const tokens = this.tokenize(text);
    const vocabSize = this.vocabulary.size;
    const scores = {};

    for (const [className, cls] of Object.entries(this.classes)) {
      // Log prior  P(class)
      let logProb = Math.log(cls.docCount / this.totalDocs);

      // Log likelihood with Laplace smoothing
      for (const word of tokens) {
        const wordCount = cls.wordCounts[word] || 0;
        logProb += Math.log((wordCount + 1) / (cls.totalWords + vocabSize));
      }

      scores[className] = logProb;
    }

    // Pick class with highest log probability
    let bestClass = null;
    let bestScore = -Infinity;
    for (const [className, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestClass = className;
      }
    }

    // Compute a simple confidence (softmax of log probs)
    const classNames = Object.keys(scores);
    const maxScore = Math.max(...Object.values(scores));
    const expScores = classNames.map(c => Math.exp(scores[c] - maxScore));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const confidence = {};
    classNames.forEach((c, i) => {
      confidence[c] = expScores[i] / sumExp;
    });

    return { label: bestClass, confidence, scores };
  }

  // ── Evaluation against a test set ──────────────────────────
  evaluate(testSet) {
    // testSet = [ { text: "...", expected: "positive" | "negative" }, … ]
    const results = testSet.map(item => {
      const prediction = this.predict(item.text);
      return {
        text: item.text,
        expected: item.expected,
        predicted: prediction.label,
        confidence: prediction.confidence,
        correct: prediction.label === item.expected,
        explanation: item.explanation || '',
        difficulty: item.difficulty || 'medium',
      };
    });

    const correct = results.filter(r => r.correct).length;
    const accuracy = results.length > 0 ? correct / results.length : 0;

    return { results, accuracy, correct, total: results.length };
  }

  // ── Stats for display ──────────────────────────────────────
  getStats() {
    const stats = { totalDocs: this.totalDocs, vocabSize: this.vocabulary.size, classes: {} };
    for (const [className, cls] of Object.entries(this.classes)) {
      stats.classes[className] = { docCount: cls.docCount, uniqueWords: Object.keys(cls.wordCounts).length };
    }
    return stats;
  }
}
