// ============================================================
// Interactive Coding Tutorial — students write the classifier
// ============================================================

const TUTORIAL_CHALLENGES = [
  // ─── Challenge 1: Tokenizer ────────────────────────────
  {
    id: 'tokenize',
    title: 'Challenge 1: Turn Text Into Words',
    description: `
      <p>Before the classifier can learn anything, it needs to break a sentence into
      individual <strong>words</strong> (called <em>tokens</em>).</p>
      <p>Your job: write a function that takes a string and returns an array of
      lowercase words. We want to:</p>
      <ol>
        <li>Convert to <strong>lowercase</strong> (so "Happy" and "happy" are the same word)</li>
        <li>Remove punctuation like <code>!</code> <code>.</code> <code>,</code> <code>?</code> (but keep apostrophes and hyphens)</li>
        <li>Split on <strong>spaces</strong></li>
        <li>Remove any tokens that are just 1 character long</li>
      </ol>
    `,
    starterCode: `function tokenize(text) {
  // Step 1: Convert text to lowercase
  let result = text.toLowerCase();

  // Step 2: Replace punctuation (except ' and -) with spaces
  // YOUR CODE HERE

  // Step 3: Split the string into an array of words
  // YOUR CODE HERE

  // Step 4: Filter out any words with length <= 1
  // YOUR CODE HERE

  return result;
}`,
    solution: `function tokenize(text) {
  // Step 1: Convert text to lowercase
  let result = text.toLowerCase();

  // Step 2: Replace punctuation (except ' and -) with spaces
  result = result.replace(/[^a-z0-9'\\s-]/g, ' ');

  // Step 3: Split the string into an array of words
  result = result.split(/\\s+/);

  // Step 4: Filter out any words with length <= 1
  result = result.filter(word => word.length > 1);

  return result;
}`,
    hints: [
      'For Step 2, remember to <em>assign</em> the result back: <code>result = result.replace(...)</code>',
      'For Step 3, <code>result.split(/\\s+/)</code> splits on one or more spaces. Assign it back to <code>result</code>.',
      'For Step 4, <code>.filter(word => word.length > 1)</code> keeps only words longer than 1 character.',
    ],
    testCases: [
      {
        input: 'Hello World!',
        expected: ['hello', 'world'],
        description: 'Basic: lowercases and removes punctuation',
      },
      {
        input: "I'm so proud of you!",
        expected: ["i'm", 'so', 'proud', 'of', 'you'],
        description: 'Keeps apostrophes in contractions',
      },
      {
        input: 'a  b  cde',
        expected: ['cde'],
        description: 'Drops single-character words, handles multiple spaces',
      },
      {
        input: 'Trans rights are HUMAN rights!!!',
        expected: ['trans', 'rights', 'are', 'human', 'rights'],
        description: 'Lowercases everything, strips exclamation marks',
      },
    ],
    validateFn: function (userFn) {
      const results = [];
      for (const tc of this.testCases) {
        try {
          const actual = userFn(tc.input);
          const pass = JSON.stringify(actual) === JSON.stringify(tc.expected);
          results.push({
            pass,
            input: tc.input,
            expected: tc.expected,
            actual,
            description: tc.description,
          });
        } catch (err) {
          results.push({
            pass: false,
            input: tc.input,
            expected: tc.expected,
            actual: `Error: ${err.message}`,
            description: tc.description,
            error: err.message,
          });
        }
      }
      return results;
    },
  },

  // ─── Challenge 2: Training (word counting) ─────────────
  {
    id: 'train',
    title: 'Challenge 2: Teach the Model by Counting Words',
    description: `
      <p>Training a Naive Bayes classifier is surprisingly simple: you just
      <strong>count how many times each word appears</strong> in each category.</p>
      <p>We give you a structure called <code>classes</code> that looks like this:</p>
      <pre><code>classes = {
  "positive": { wordCounts: {}, docCount: 0, totalWords: 0 },
  "negative": { wordCounts: {}, docCount: 0, totalWords: 0 }
}</code></pre>
      <p>For each training example, you need to:</p>
      <ol>
        <li>Increase <code>docCount</code> for that label by 1</li>
        <li>Tokenize the text into words</li>
        <li>For each word, increase its count in <code>wordCounts</code> and increase <code>totalWords</code></li>
      </ol>
    `,
    starterCode: `function trainOnExample(classes, label, text, tokenize) {
  // "classes" has a key for each label (e.g. "positive", "negative")
  // Each has: { wordCounts: {}, docCount: 0, totalWords: 0 }

  let cls = classes[label];

  // Step 1: Increase the document count for this label
  // YOUR CODE HERE

  // Step 2: Tokenize the text into words
  let words = tokenize(text);

  // Step 3: Loop through each word and update counts
  // This "for...of" loop runs the code inside { } once for each word in the array
  for (let word of words) {
    // a) Add 1 to cls.wordCounts[word] (create it if it doesn't exist)
    // YOUR CODE HERE

    // b) Add 1 to cls.totalWords
    // YOUR CODE HERE
  }

}`,
    solution: `function trainOnExample(classes, label, text, tokenize) {
  let cls = classes[label];

  // Step 1: Increase the document count for this label
  cls.docCount++;

  // Step 2: Tokenize the text into words
  let words = tokenize(text);

  // Step 3: Loop through each word and update counts
  for (let word of words) {
    cls.wordCounts[word] = (cls.wordCounts[word] || 0) + 1;
    cls.totalWords++;
  }
}`,
    hints: [
      '<code>cls.docCount++</code> or <code>cls.docCount = cls.docCount + 1</code> — either works!',
      'Use a <code>for</code> loop: <code>for (let word of words) { ... }</code>',
      'To count a word: <code>cls.wordCounts[word] = (cls.wordCounts[word] || 0) + 1</code> — the <code>|| 0</code> handles the first time we see a word.',
    ],
    testCases: [
      {
        setup: () => ({
          classes: { positive: { wordCounts: {}, docCount: 0, totalWords: 0 } },
          label: 'positive',
          text: 'I am proud of you',
        }),
        check: (classes) => classes.positive.docCount === 1,
        description: 'docCount increases to 1 after one example',
      },
      {
        setup: () => ({
          classes: { positive: { wordCounts: {}, docCount: 0, totalWords: 0 } },
          label: 'positive',
          text: 'I am proud of you',
        }),
        check: (classes) => classes.positive.wordCounts['proud'] === 1,
        description: '"proud" has count of 1',
      },
      {
        setup: () => ({
          classes: { positive: { wordCounts: {}, docCount: 0, totalWords: 0 } },
          label: 'positive',
          text: 'I am proud of you',
        }),
        check: (classes) => classes.positive.totalWords === 4,
        description: 'totalWords is 4 (after filtering single-char words: "am", "proud", "of", "you")',
      },
      {
        setup: () => ({
          classes: { negative: { wordCounts: {}, docCount: 0, totalWords: 0 } },
          label: 'negative',
          text: 'That is disgusting and wrong',
        }),
        check: (classes) => classes.negative.wordCounts['disgusting'] === 1 && classes.negative.docCount === 1 && classes.negative.totalWords === 4,
        description: 'Works for negative examples too',
      },
    ],
    validateFn: function (userFn) {
      // We need the working tokenize function
      const tokenize = (text) =>
        text.toLowerCase().replace(/[^a-z0-9'\s-]/g, ' ').split(/\s+/).filter(t => t.length > 1);

      const results = [];
      for (const tc of this.testCases) {
        const { classes, label, text } = tc.setup();
        try {
          userFn(classes, label, text, tokenize);
          const pass = tc.check(classes);
          results.push({
            pass,
            description: tc.description,
            actual: pass ? 'Correct!' : `Got: ${JSON.stringify(classes[label])}`,
          });
        } catch (err) {
          results.push({
            pass: false,
            description: tc.description,
            actual: `Error: ${err.message}`,
            error: err.message,
          });
        }
      }
      return results;
    },
  },

  // ─── Challenge 3: Prediction ───────────────────────────
  {
    id: 'predict',
    title: 'Challenge 3: Make a Prediction',
    description: `
      <p>Now for the exciting part: using what the model learned to <strong>classify new text</strong>!</p>
      <p>The idea: for each category, calculate a <strong>score</strong> by adding up log-probabilities
      for each word. The category with the highest score wins.</p>
      <p>The formula for each word's contribution:</p>
      <pre><code>Math.log((wordCount + 1) / (totalWords + vocabSize))</code></pre>
      <p>The <code>+ 1</code> is called <strong>Laplace smoothing</strong> — it prevents the probability
      from being zero for words the model hasn't seen before.</p>
      <p>You need to:</p>
      <ol>
        <li>Start with a <strong>prior</strong> score: <code>Math.log(cls.docCount / totalDocs)</code></li>
        <li>For each word in the input, <strong>add</strong> its log-probability to the score</li>
        <li>Return the label with the <strong>highest</strong> score</li>
      </ol>
    `,
    starterCode: `function predictLabel(classes, text, totalDocs, vocabSize, tokenize) {
  let words = tokenize(text);
  let bestLabel = null;
  let bestScore = -Infinity;

  // Loop through each class (e.g. "positive" and "negative")
  for (let [label, cls] of Object.entries(classes)) {

    // Step 1: Start with the prior — how common is this class?
    // YOUR CODE HERE

    // Step 2: For each word, add its log-probability to the score
    // This loop goes through every word and updates the score
    for (let word of words) {
      // Get how many times this word appeared in training (0 if never seen)
      // Then add its log-probability to the score
      // Formula: Math.log((wordCount + 1) / (cls.totalWords + vocabSize))
      // YOUR CODE HERE
    }

    // Step 3: If this score is the best so far, update bestLabel and bestScore
    // YOUR CODE HERE

  }

  return bestLabel;
}`,
    solution: `function predictLabel(classes, text, totalDocs, vocabSize, tokenize) {
  let words = tokenize(text);
  let bestLabel = null;
  let bestScore = -Infinity;

  for (let [label, cls] of Object.entries(classes)) {

    // Step 1: Start with the prior
    let score = Math.log(cls.docCount / totalDocs);

    // Step 2: Add log-probability for each word
    for (let word of words) {
      let wordCount = cls.wordCounts[word] || 0;
      score += Math.log((wordCount + 1) / (cls.totalWords + vocabSize));
    }

    // Step 3: Track the best
    if (score > bestScore) {
      bestScore = score;
      bestLabel = label;
    }
  }

  return bestLabel;
}`,
    hints: [
      'Step 1: <code>let score = Math.log(cls.docCount / totalDocs);</code>',
      'Step 2: loop with <code>for (let word of words)</code>, get the count with <code>let wordCount = cls.wordCounts[word] || 0;</code>, then <code>score += Math.log((wordCount + 1) / (cls.totalWords + vocabSize));</code>',
      'Step 3: <code>if (score > bestScore) { bestScore = score; bestLabel = label; }</code>',
    ],
    testCases: [
      {
        description: 'Classifies "proud of you" as positive',
        expected: 'positive',
      },
      {
        description: 'Classifies "disgusting and wrong" as negative',
        expected: 'negative',
      },
      {
        description: 'Classifies "you are valid and loved" as positive',
        expected: 'positive',
      },
      {
        description: 'Classifies "this is unnatural" as negative',
        expected: 'negative',
      },
    ],
    validateFn: function (userFn) {
      // Build a small training set to test the prediction function
      const tokenize = (text) =>
        text.toLowerCase().replace(/[^a-z0-9'\s-]/g, ' ').split(/\s+/).filter(t => t.length > 1);

      const trainingData = [
        { text: "I'm so proud of you for coming out", label: 'positive' },
        { text: 'You are loved and valid', label: 'positive' },
        { text: 'This community is amazing and supportive', label: 'positive' },
        { text: 'Happy pride you deserve happiness', label: 'positive' },
        { text: 'That is disgusting and wrong', label: 'negative' },
        { text: 'This is unnatural and sick', label: 'negative' },
        { text: 'You are broken and confused', label: 'negative' },
        { text: 'Nobody wants to see this garbage', label: 'negative' },
      ];

      // Train
      const classes = {
        positive: { wordCounts: {}, docCount: 0, totalWords: 0 },
        negative: { wordCounts: {}, docCount: 0, totalWords: 0 },
      };
      const vocab = new Set();
      let totalDocs = 0;

      for (const { text, label } of trainingData) {
        classes[label].docCount++;
        totalDocs++;
        for (const word of tokenize(text)) {
          classes[label].wordCounts[word] = (classes[label].wordCounts[word] || 0) + 1;
          classes[label].totalWords++;
          vocab.add(word);
        }
      }

      const testInputs = [
        'proud of you',
        'disgusting and wrong',
        'you are valid and loved',
        'this is unnatural',
      ];

      const results = [];
      for (let i = 0; i < this.testCases.length; i++) {
        const tc = this.testCases[i];
        const input = testInputs[i];
        try {
          const actual = userFn(classes, input, totalDocs, vocab.size, tokenize);
          const pass = actual === tc.expected;
          results.push({
            pass,
            description: tc.description,
            actual: actual || '(returned nothing)',
            expected: tc.expected,
          });
        } catch (err) {
          results.push({
            pass: false,
            description: tc.description,
            actual: `Error: ${err.message}`,
            error: err.message,
          });
        }
      }
      return results;
    },
  },
];


// ============================================================
// Tutorial Engine — manages running & validating student code
// ============================================================

class TutorialEngine {
  constructor() {
    this.completedChallenges = new Set();
    this.currentHintIndex = {};  // { challengeId: number }
  }

  /** Run the student's code for a given challenge */
  runChallenge(challengeId, codeString) {
    const challenge = TUTORIAL_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return { success: false, error: 'Challenge not found' };

    const output = { logs: [], errors: [] };

    try {
      // Create a function from the student's code string
      // eslint-disable-next-line no-new-func
      const userFn = new Function(codeString + `\nreturn ${this._getFnName(challengeId)};`)();

      if (typeof userFn !== 'function') {
        return {
          success: false,
          error: `Expected a function called "${this._getFnName(challengeId)}" but got ${typeof userFn}.`,
          testResults: [],
        };
      }

      // Run test cases
      const testResults = challenge.validateFn(userFn);
      const allPass = testResults.every(r => r.pass);

      if (allPass) {
        this.completedChallenges.add(challengeId);
      }

      return { success: allPass, testResults, error: null };

    } catch (err) {
      return {
        success: false,
        error: err.message,
        testResults: [],
        stack: err.stack,
      };
    }
  }

  /** Get the next hint for a challenge */
  getNextHint(challengeId) {
    const challenge = TUTORIAL_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return null;

    if (!this.currentHintIndex[challengeId]) {
      this.currentHintIndex[challengeId] = 0;
    }

    const idx = this.currentHintIndex[challengeId];
    if (idx >= challenge.hints.length) return null;

    this.currentHintIndex[challengeId]++;
    return {
      hint: challenge.hints[idx],
      remaining: challenge.hints.length - idx - 1,
      total: challenge.hints.length,
      index: idx,
    };
  }

  isComplete(challengeId) {
    return this.completedChallenges.has(challengeId);
  }

  allComplete() {
    return TUTORIAL_CHALLENGES.every(c => this.completedChallenges.has(c.id));
  }

  _getFnName(challengeId) {
    const names = { tokenize: 'tokenize', train: 'trainOnExample', predict: 'predictLabel' };
    return names[challengeId];
  }
}
