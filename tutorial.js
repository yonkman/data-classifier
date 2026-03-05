// ============================================================
// Interactive Coding Tutorial — 3 difficulty tiers
// Easy: heavy scaffolding, 1-2 lines at a time, loops provided
// Medium: less guidance, students write loops
// Hard: just an overview, students implement everything
// ============================================================

// -- Shared helper tokenize (used by validation only) -------
const _tutorialTokenize = (text) =>
  text.toLowerCase().replace(/[^a-z0-9'\s-]/g, ' ').split(/\s+/).filter(t => t.length > 1);

// -- Shared test cases --------------------------------------
const TOKENIZE_TEST_CASES = [
  { input: 'Hello World!', expected: ['hello', 'world'], description: 'Basic: lowercases and removes punctuation' },
  { input: "I'm so proud of you!", expected: ["i'm", 'so', 'proud', 'of', 'you'], description: 'Keeps apostrophes in contractions' },
  { input: 'a  b  cde', expected: ['cde'], description: 'Drops single-character words, handles multiple spaces' },
  { input: 'Trans rights are HUMAN rights!!!', expected: ['trans', 'rights', 'are', 'human', 'rights'], description: 'Lowercases everything, strips exclamation marks' },
];

const TRAIN_TEST_CASES = [
  {
    setup: () => ({ classes: { iconic: { wordCounts: {}, docCount: 0, totalWords: 0 } }, label: 'iconic', text: 'They absolutely slayed that look' }),
    check: (classes) => classes.iconic.docCount === 1,
    description: 'docCount increases to 1 after one example',
  },
  {
    setup: () => ({ classes: { iconic: { wordCounts: {}, docCount: 0, totalWords: 0 } }, label: 'iconic', text: 'They absolutely slayed that look' }),
    check: (classes) => classes.iconic.wordCounts['slayed'] === 1,
    description: '"slayed" has count of 1',
  },
  {
    setup: () => ({ classes: { iconic: { wordCounts: {}, docCount: 0, totalWords: 0 } }, label: 'iconic', text: 'They absolutely slayed that look' }),
    check: (classes) => classes.iconic.totalWords === 5,
    description: 'totalWords is 5 (words longer than 1 char: "they", "absolutely", "slayed", "that", "look")',
  },
  {
    setup: () => ({ classes: { basic: { wordCounts: {}, docCount: 0, totalWords: 0 } }, label: 'basic', text: 'Just a regular Tuesday nothing special' }),
    check: (classes) => classes.basic.wordCounts['regular'] === 1 && classes.basic.docCount === 1 && classes.basic.totalWords === 5,
    description: 'Works for basic examples too',
  },
];

const PREDICT_TEST_CASES = [
  { description: 'Classifies "they slayed that look" as iconic', expected: 'iconic' },
  { description: 'Classifies "just went to the store" as basic', expected: 'basic' },
  { description: 'Classifies "absolutely legendary and incredible" as iconic', expected: 'iconic' },
  { description: 'Classifies "it was fine I guess" as basic', expected: 'basic' },
];

// -- Shared validation functions ----------------------------
function validateTokenize(userFn) {
  const results = [];
  for (const tc of TOKENIZE_TEST_CASES) {
    try {
      const actual = userFn(tc.input);
      const pass = JSON.stringify(actual) === JSON.stringify(tc.expected);
      results.push({ pass, input: tc.input, expected: tc.expected, actual, description: tc.description });
    } catch (err) {
      results.push({ pass: false, input: tc.input, expected: tc.expected, actual: 'Error: ' + err.message, description: tc.description, error: err.message });
    }
  }
  return results;
}

function validateTrain(userFn) {
  const results = [];
  for (const tc of TRAIN_TEST_CASES) {
    const { classes, label, text } = tc.setup();
    try {
      userFn(classes, label, text, _tutorialTokenize);
      const pass = tc.check(classes);
      results.push({ pass, description: tc.description, actual: pass ? 'Correct!' : 'Got: ' + JSON.stringify(classes[label]) });
    } catch (err) {
      results.push({ pass: false, description: tc.description, actual: 'Error: ' + err.message, error: err.message });
    }
  }
  return results;
}

function validatePredict(userFn) {
  const trainingData = [
    { text: 'They absolutely slayed that whole entire look', label: 'iconic' },
    { text: 'Giving main character energy with that outfit', label: 'iconic' },
    { text: 'The drama the audacity the absolute legendary entrance', label: 'iconic' },
    { text: 'That was incredible iconic and totally unforgettable', label: 'iconic' },
    { text: 'Just went to the store for milk', label: 'basic' },
    { text: 'It was fine I guess nothing special', label: 'basic' },
    { text: 'Had cereal for breakfast like every morning', label: 'basic' },
    { text: 'Watched some TV and went to bed early', label: 'basic' },
  ];

  const classes = {
    iconic: { wordCounts: {}, docCount: 0, totalWords: 0 },
    basic: { wordCounts: {}, docCount: 0, totalWords: 0 },
  };
  const vocab = new Set();
  let totalDocs = 0;

  for (const d of trainingData) {
    classes[d.label].docCount++;
    totalDocs++;
    for (const word of _tutorialTokenize(d.text)) {
      classes[d.label].wordCounts[word] = (classes[d.label].wordCounts[word] || 0) + 1;
      classes[d.label].totalWords++;
      vocab.add(word);
    }
  }

  const testInputs = [
    'they slayed that look',
    'just went to the store',
    'absolutely legendary and incredible',
    'it was fine I guess',
  ];

  const results = [];
  for (let i = 0; i < PREDICT_TEST_CASES.length; i++) {
    const tc = PREDICT_TEST_CASES[i];
    const input = testInputs[i];
    try {
      const actual = userFn(classes, input, totalDocs, vocab.size, _tutorialTokenize);
      const pass = actual === tc.expected;
      results.push({ pass, description: tc.description, actual: actual || '(returned nothing)', expected: tc.expected });
    } catch (err) {
      results.push({ pass: false, description: tc.description, actual: 'Error: ' + err.message, error: err.message });
    }
  }
  return results;
}


// ============================================================
//  EASY TIER  -  Lots of hints, 1-2 lines at a time
// ============================================================

const EASY_CHALLENGES = [
  {
    id: 'tokenize',
    title: 'Challenge 1: Turn Text Into Words',
    description: '<p>Our classifier decides whether a sentence is "iconic" or "basic" by looking at individual <strong>words</strong>. But raw text is messy — it has capitals, punctuation, and extra spaces. Before the classifier can work, we need to clean the text up. This process is called <em>tokenization</em>.</p><p>For example, <code>"Hello World!"</code> should become <code>["hello", "world"]</code> — no capitals, no punctuation, just clean words the classifier can count.</p><p>Your job: fill in the missing lines below. Step 1 is already done for you — you just need to write one line of code for each remaining step.</p><ol><li>Convert to <strong>lowercase</strong> (so "Happy" and "happy" count as the same word) — <em>already done for you!</em></li><li>Remove punctuation like <code>!</code> <code>.</code> <code>,</code> <code>?</code> (but keep apostrophes and hyphens, since they\'re part of real words like "I\'m")</li><li>Split the text into an <strong>array of words</strong> wherever there\'s a space</li><li>Remove any tiny tokens that are just 1 character long (like "a" — they don\'t tell us much)</li></ol>',
    starterCode: 'function tokenize(text) {\n  // Step 1: Convert text to lowercase (done for you!)\n  let result = text.toLowerCase();\n\n  // Step 2: Replace punctuation (except \' and -) with spaces\n  //   Use .replace() with the regex /[^a-z0-9\'\\s-]/g\n  //   Assign the result back to "result"\n  // YOUR CODE HERE\n\n  // Step 3: Split the string into an array of words\n  //   Use .split() with the regex /\\s+/ (one or more spaces)\n  // YOUR CODE HERE\n\n  // Step 4: Filter out any words with length <= 1\n  //   Use .filter() with a condition checking word.length\n  // YOUR CODE HERE\n\n  return result;\n}',
    solution: 'function tokenize(text) {\n  let result = text.toLowerCase();\n  result = result.replace(/[^a-z0-9\'\\s-]/g, \' \');\n  result = result.split(/\\s+/);\n  result = result.filter(word => word.length > 1);\n  return result;\n}',
    hints: [
      'For Step 2, remember to <em>assign</em> the result back: <code>result = result.replace(...)</code>',
      'For Step 3, <code>result.split(/\\s+/)</code> splits on one or more spaces. Assign it back to <code>result</code>.',
      'For Step 4, <code>.filter(word => word.length > 1)</code> keeps only words longer than 1 character.',
    ],
    testCases: TOKENIZE_TEST_CASES,
    validateFn: function (userFn) { return validateTokenize(userFn); },
  },
  {
    id: 'train',
    title: 'Challenge 2: Teach the Model by Counting Words',
    description: '<p>Now that we can break sentences into words, it\'s time to <strong>teach the model</strong>! "Training" a classifier just means showing it labeled examples so it can learn patterns.</p><p>Our classifier learns by <strong>counting</strong>. For example, if the word "slay" shows up 10 times in iconic sentences and 0 times in basic ones, the model learns that seeing "slay" is a strong clue that a sentence is iconic.</p><p>We store everything the model learns in an object called <code>classes</code>:</p><pre><code>classes = {\n  "iconic": { wordCounts: {}, docCount: 0, totalWords: 0 },\n  "basic": { wordCounts: {}, docCount: 0, totalWords: 0 }\n}</code></pre><p>This function gets called once for each training sentence. The code below already has the loop that goes through each word — you just need to fill in <strong>3 short lines</strong>:</p><ol><li>Record that you\'ve seen one more sentence for this label (<code>docCount</code>)</li><li>For each word, increase its count in <code>wordCounts</code> (the tricky part: use <code>|| 0</code> so words we\'ve never seen start at 0)</li><li>For each word, also bump <code>totalWords</code> by 1</li></ol>',
    starterCode: 'function trainOnExample(classes, label, text, tokenize) {\n  // "classes" has a key for each label (e.g. "iconic", "basic")\n  // Each has: { wordCounts: {}, docCount: 0, totalWords: 0 }\n\n  let cls = classes[label];\n\n  // Step 1: Increase the document count for this label\n  //   cls.docCount is a number — add 1 to it\n  // YOUR CODE HERE\n\n  // Step 2: Tokenize the text into words (done for you!)\n  let words = tokenize(text);\n\n  // Step 3: Loop through each word and update counts\n  for (let word of words) {\n    // a) Add 1 to cls.wordCounts[word]\n    //    If the word hasn\'t been seen yet, treat it as 0 first\n    //    Hint: (someValue || 0) gives 0 when someValue is undefined\n    // YOUR CODE HERE\n\n    // b) Add 1 to cls.totalWords\n    // YOUR CODE HERE\n  }\n\n}',
    solution: 'function trainOnExample(classes, label, text, tokenize) {\n  let cls = classes[label];\n  cls.docCount++;\n  let words = tokenize(text);\n  for (let word of words) {\n    cls.wordCounts[word] = (cls.wordCounts[word] || 0) + 1;\n    cls.totalWords++;\n  }\n}',
    hints: [
      '<code>cls.docCount++</code> or <code>cls.docCount = cls.docCount + 1</code> \u2014 either works!',
      'To count a word: <code>cls.wordCounts[word] = (cls.wordCounts[word] || 0) + 1</code> \u2014 the <code>|| 0</code> handles the first time we see a word.',
      'Don\'t forget <code>cls.totalWords++</code> inside the loop too!',
    ],
    testCases: TRAIN_TEST_CASES,
    validateFn: function (userFn) { return validateTrain(userFn); },
  },
  {
    id: 'predict',
    title: 'Challenge 3: Make a Prediction',
    description: '<p>The model has counted all the words from training — now it\'s time to use those counts to <strong>classify a brand-new sentence</strong> it\'s never seen before!</p><p>The idea is simple: for each possible label ("iconic" and "basic"), the model calculates a <strong>score</strong>. Whichever label gets the higher score wins.</p><p>After training, the <code>classes</code> object might look like:</p><pre><code>classes = {\n  "iconic": {\n    wordCounts: { "slay": 3, "queen": 2, ... },\n    docCount: 5, totalWords: 28\n  },\n  "basic": {\n    wordCounts: { "just": 4, "went": 2, ... },\n    docCount: 4, totalWords: 22\n  }\n}</code></pre><p><strong>We\'ve given you two helper functions</strong> so you don\'t have to worry about the math:</p><ul><li><code>getBaseScore(cls, totalDocs)</code> — returns a starting score for this label based on how common it was in training</li><li><code>getWordScore(word, cls, vocabSize)</code> — returns a score for one word based on how often it appeared in this label\'s training data</li></ul><p>All you need to do is:</p><ol><li><strong>Get the base score</strong> — call <code>getBaseScore(cls, totalDocs)</code> and store it in a variable called <code>score</code></li><li><strong>Add word scores</strong> — for each word, call <code>getWordScore</code> and <strong>add</strong> the result to <code>score</code> using <code>+=</code></li><li><strong>Pick the winner</strong> — if this label\'s <code>score</code> is bigger than <code>bestScore</code>, update <code>bestScore</code> and <code>bestLabel</code></li></ol>',
    starterCode: 'function predictLabel(classes, text, totalDocs, vocabSize, tokenize) {\n  let words = tokenize(text);\n  let bestLabel = null;\n  let bestScore = -Infinity;\n\n  // Helper functions (already written for you!)\n  function getBaseScore(cls, totalDocs) {\n    return Math.log(cls.docCount / totalDocs);\n  }\n  function getWordScore(word, cls, vocabSize) {\n    let wordCount = cls.wordCounts[word] || 0;\n    return Math.log((wordCount + 1) / (cls.totalWords + vocabSize));\n  }\n\n  // Loop through each class (e.g. "iconic" and "basic")\n  for (let [label, cls] of Object.entries(classes)) {\n\n    // Step 1: Get the base score for this label\n    //   Call getBaseScore(cls, totalDocs) and store it in \"score\"\n    // YOUR CODE HERE\n\n    // Step 2: For each word, add its score\n    for (let word of words) {\n      // Call getWordScore(word, cls, vocabSize)\n      //   and ADD the result to score using +=\n      // YOUR CODE HERE\n    }\n\n    // Step 3: If score is better than bestScore, update\n    //   bestScore and bestLabel\n    // YOUR CODE HERE\n\n  }\n\n  return bestLabel;\n}',
    solution: 'function predictLabel(classes, text, totalDocs, vocabSize, tokenize) {\n  let words = tokenize(text);\n  let bestLabel = null;\n  let bestScore = -Infinity;\n\n  function getBaseScore(cls, totalDocs) {\n    return Math.log(cls.docCount / totalDocs);\n  }\n  function getWordScore(word, cls, vocabSize) {\n    let wordCount = cls.wordCounts[word] || 0;\n    return Math.log((wordCount + 1) / (cls.totalWords + vocabSize));\n  }\n\n  for (let [label, cls] of Object.entries(classes)) {\n    let score = getBaseScore(cls, totalDocs);\n    for (let word of words) {\n      score += getWordScore(word, cls, vocabSize);\n    }\n    if (score > bestScore) {\n      bestScore = score;\n      bestLabel = label;\n    }\n  }\n\n  return bestLabel;\n}',
    hints: [
      'Step 1: <code>let score = getBaseScore(cls, totalDocs);</code> — just call the helper and store the result!',
      'Step 2: <code>score += getWordScore(word, cls, vocabSize);</code> — the <code>+=</code> adds each word\'s score to the running total.',
      'Step 3: <code>if (score > bestScore) { bestScore = score; bestLabel = label; }</code>',
    ],
    testCases: PREDICT_TEST_CASES,
    validateFn: function (userFn) { return validatePredict(userFn); },
  },
];


// ============================================================
//  MEDIUM TIER  -  Less hand-holding, students write the loops
// ============================================================

const MEDIUM_CHALLENGES = [
  {
    id: 'tokenize',
    title: 'Challenge 1: Build a Tokenizer',
    description: '<p>Our classifier works by looking at individual <strong>words</strong> in a sentence. But raw text is messy — it has capitals, punctuation, and extra spaces. This first step, called <em>tokenization</em>, cleans the text so the classifier can work with it.</p><p>For example, <code>"Hello World!"</code> should become <code>["hello", "world"]</code> — clean, lowercase words in an array.</p><p>Write a function that:</p><ol><li>Lowercases the text (so "Happy" and "happy" count as the same word)</li><li>Replaces punctuation (except apostrophes <code>\'</code> and hyphens <code>-</code>) with spaces</li><li>Splits on whitespace into an array of words</li><li>Removes words that are only 1 character long (they don\'t tell us much)</li></ol><p>Check the <strong>JavaScript Reference</strong> panel for help with <code>.toLowerCase()</code>, <code>.replace()</code>, <code>.split()</code>, and <code>.filter()</code>. The starter code has regex hints in the comments.</p>',
    starterCode: 'function tokenize(text) {\n  // 1. Lowercase the text\n  // 2. Replace punctuation (except \' and -) with spaces\n  //    Regex hint: /[^a-z0-9\'\\s-]/g matches unwanted characters\n  // 3. Split on whitespace into an array\n  //    Regex hint: /\\s+/ splits on one or more spaces\n  // 4. Filter out short words (length <= 1)\n\n  // YOUR CODE HERE \u2014 chain or assign each step to a variable\n\n}',
    solution: 'function tokenize(text) {\n  let result = text.toLowerCase();\n  result = result.replace(/[^a-z0-9\'\\s-]/g, \' \');\n  result = result.split(/\\s+/);\n  result = result.filter(word => word.length > 1);\n  return result;\n}',
    hints: [
      'Start with <code>let result = text.toLowerCase();</code> then keep reassigning <code>result</code> for each step.',
      'Filter: <code>result = result.filter(word => word.length > 1);</code> \u2014 and don\'t forget to <code>return result;</code>',
    ],
    testCases: TOKENIZE_TEST_CASES,
    validateFn: function (userFn) { return validateTokenize(userFn); },
  },
  {
    id: 'train',
    title: 'Challenge 2: Train the Model',
    description: '<p>"Training" a classifier means <strong>showing it labeled examples so it can learn patterns</strong>. Our classifier learns by counting — it tallies how often each word appears in "iconic" sentences vs. "basic" sentences. For example, if "slay" shows up 10 times in iconic training data and 0 times in basic, the model learns that "slay" is a strong signal for iconic.</p><p>Here\'s what the <code>classes</code> object looks like:</p><pre><code>classes = {\n  "iconic": { wordCounts: {}, docCount: 0, totalWords: 0 },\n  "basic":  { wordCounts: {}, docCount: 0, totalWords: 0 }\n}</code></pre><p>This function gets called once for each training sentence. You\'re given:</p><ul><li><code>classes</code> — stores everything learned so far. Each label has: <code>wordCounts</code> (how often each word appeared), <code>docCount</code> (how many sentences seen), and <code>totalWords</code></li><li><code>label</code> — the category for this sentence (e.g. <code>"iconic"</code>)</li><li><code>text</code> — the sentence to learn from</li><li><code>tokenize</code> — the function from Challenge 1 — call it to break the sentence into words</li></ul><p>You need to: increment <code>docCount</code>, tokenize the text, then write a loop that goes through each word to update <code>wordCounts</code> and <code>totalWords</code>. The starter code provides <code>cls</code> for you — you write the rest.</p>',
    starterCode: 'function trainOnExample(classes, label, text, tokenize) {\n  let cls = classes[label];\n\n  // Increment the document count for this label\n\n  // Tokenize the text into an array of words\n\n  // Loop through each word:\n  //   - Add 1 to cls.wordCounts[word] (use || 0 for first-time words)\n  //   - Add 1 to cls.totalWords\n\n  // YOUR CODE HERE\n\n}',
    solution: 'function trainOnExample(classes, label, text, tokenize) {\n  let cls = classes[label];\n  cls.docCount++;\n  let words = tokenize(text);\n  for (let word of words) {\n    cls.wordCounts[word] = (cls.wordCounts[word] || 0) + 1;\n    cls.totalWords++;\n  }\n}',
    hints: [
      'Use <code>for (let word of words) { ... }</code> to loop through the array of tokenized words.',
      'The counting pattern: <code>cls.wordCounts[word] = (cls.wordCounts[word] || 0) + 1;</code>',
    ],
    testCases: TRAIN_TEST_CASES,
    validateFn: function (userFn) { return validateTrain(userFn); },
  },
  {
    id: 'predict',
    title: 'Challenge 3: Predict a Label',
    description: '<p>The model has counted words from training — now use those counts to <strong>classify a brand-new sentence</strong>! For each label ("iconic" and "basic"), calculate a score that represents how likely the sentence belongs to that category. Whichever label scores highest wins.</p><p>After training, the <code>classes</code> object might look like:</p><pre><code>classes = {\n  "iconic": {\n    wordCounts: { "slay": 3, "queen": 2, ... },\n    docCount: 5, totalWords: 28\n  },\n  "basic": {\n    wordCounts: { "just": 4, "went": 2, ... },\n    docCount: 4, totalWords: 22\n  }\n}</code></pre><p><strong>How scoring works:</strong></p><ol><li><strong>Base score</strong> — <code>Math.log(cls.docCount / totalDocs)</code> gives a head start to whichever label had more training examples</li><li><strong>Word scores</strong> — For each word, add <code>Math.log((wordCount + 1) / (cls.totalWords + vocabSize))</code>. The <code>+ 1</code> is "Laplace smoothing" — it prevents the math from breaking on words the model has never seen</li><li><strong>Pick the winner</strong> — Track the highest score and return that label</li></ol><p>We use <code>Math.log</code> because multiplying tiny probabilities would give numbers too small for the computer. Adding logs is mathematically equivalent but keeps numbers manageable.</p><p>The starter code gives you <code>words</code>, <code>bestLabel</code>, and <code>bestScore</code>. You need to write the loops and scoring logic. Use <code>Object.entries(classes)</code> to loop through each <code>[label, cls]</code> pair.</p>',
    starterCode: 'function predictLabel(classes, text, totalDocs, vocabSize, tokenize) {\n  let words = tokenize(text);\n  let bestLabel = null;\n  let bestScore = -Infinity;\n\n  // Loop through each class using Object.entries(classes)\n  // For each class:\n  //   1. Calculate a base score from docCount\n  //   2. Loop through words and add each word\'s log-probability\n  //   3. If this score beats bestScore, update bestLabel and bestScore\n\n  // YOUR CODE HERE\n\n  return bestLabel;\n}',
    solution: 'function predictLabel(classes, text, totalDocs, vocabSize, tokenize) {\n  let words = tokenize(text);\n  let bestLabel = null;\n  let bestScore = -Infinity;\n\n  for (let [label, cls] of Object.entries(classes)) {\n    let score = Math.log(cls.docCount / totalDocs);\n    for (let word of words) {\n      let wordCount = cls.wordCounts[word] || 0;\n      score += Math.log((wordCount + 1) / (cls.totalWords + vocabSize));\n    }\n    if (score > bestScore) {\n      bestScore = score;\n      bestLabel = label;\n    }\n  }\n\n  return bestLabel;\n}',
    hints: [
      'Outer loop: <code>for (let [label, cls] of Object.entries(classes)) { ... }</code>',
      'Word count lookup: <code>let wordCount = cls.wordCounts[word] || 0;</code> \u2014 the <code>|| 0</code> handles unseen words.',
    ],
    testCases: PREDICT_TEST_CASES,
    validateFn: function (userFn) { return validatePredict(userFn); },
  },
];


// ============================================================
//  HARD TIER  -  Just an overview, implement everything
// ============================================================

const HARD_CHALLENGES = [
  {
    id: 'tokenize',
    title: 'Challenge 1: Implement a Tokenizer',
    description: '<p>A classifier works by looking at individual <strong>words</strong> in a sentence. But before it can do that, we need to clean up the raw text — this process is called <em>tokenization</em>.</p><p>Think of it like this: the sentence <code>"Hello World!"</code> needs to become the array <code>["hello", "world"]</code> — no capitals, no punctuation, just clean words the classifier can count.</p><p><strong>Your function should:</strong></p><ul><li>Lowercase everything (so "Happy" and "happy" count as the same word)</li><li>Strip punctuation like <code>!</code> <code>.</code> <code>,</code> <code>?</code> (but keep apostrophes and hyphens, since they\'re part of real words like "I\'m" or "self-care")</li><li>Split the text into separate words wherever there\'s whitespace</li><li>Throw away any tiny tokens that are just 1 character long (like "a" or "I" — they don\'t tell us much)</li></ul>',
    starterCode: 'function tokenize(text) {\n  // Implement the tokenizer\n  // Return an array of cleaned, lowercase words\n\n}',
    solution: 'function tokenize(text) {\n  return text\n    .toLowerCase()\n    .replace(/[^a-z0-9\'\\s-]/g, \' \')\n    .split(/\\s+/)\n    .filter(w => w.length > 1);\n}',
    hints: [
      'Use <code>.replace()</code> with a regex to strip punctuation, <code>.split(/\\s+/)</code> to break on spaces, and <code>.filter()</code> to drop short words.',
    ],
    testCases: TOKENIZE_TEST_CASES,
    validateFn: function (userFn) { return validateTokenize(userFn); },
  },
  {
    id: 'train',
    title: 'Challenge 2: Implement Training',
    description: '<p>"Training" a classifier just means <strong>showing it labeled examples so it can learn patterns</strong>. Our classifier learns by counting — specifically, it counts how often each word appears in "iconic" sentences vs. "basic" sentences.</p><p>For example, if the word "slay" shows up 10 times in iconic examples and 0 times in basic ones, the model learns that "slay" is a strong signal for iconic.</p><p>Here\'s what the <code>classes</code> object looks like:</p><pre><code>classes = {\n  "iconic": { wordCounts: {}, docCount: 0, totalWords: 0 },\n  "basic":  { wordCounts: {}, docCount: 0, totalWords: 0 }\n}</code></pre><p>This function gets called once for each training example. You\'re given:</p><ul><li><code>classes</code> — an object that stores everything the model has learned so far. Each label (like <code>"iconic"</code>) has: <code>wordCounts</code> (how many times each word appeared), <code>docCount</code> (how many sentences it\'s seen), and <code>totalWords</code> (total word count)</li><li><code>label</code> — the category this sentence belongs to (e.g. <code>"iconic"</code>)</li><li><code>text</code> — the actual sentence</li><li><code>tokenize</code> — the function you wrote in Challenge 1 — call it to break the sentence into words</li></ul><p><strong>What to do:</strong> Record that you\'ve seen one more sentence for this label. Break the sentence into words. Then for each word, update how many times it\'s been seen and bump the total word count.</p>',
    starterCode: 'function trainOnExample(classes, label, text, tokenize) {\n  // Implement the training logic\n\n}',
    solution: 'function trainOnExample(classes, label, text, tokenize) {\n  let cls = classes[label];\n  cls.docCount++;\n  let words = tokenize(text);\n  for (let word of words) {\n    cls.wordCounts[word] = (cls.wordCounts[word] || 0) + 1;\n    cls.totalWords++;\n  }\n}',
    hints: [
      'Access the class data with <code>classes[label]</code>. Use <code>|| 0</code> when initializing word counts to handle words seen for the first time.',
    ],
    testCases: TRAIN_TEST_CASES,
    validateFn: function (userFn) { return validateTrain(userFn); },
  },
  {
    id: 'predict',
    title: 'Challenge 3: Implement Prediction',
    description: '<p>Now the fun part: the model has learned word counts from training — time to use them to <strong>classify a brand-new sentence</strong> it\'s never seen before.</p><p>The idea is simple: for each possible label ("iconic" and "basic"), ask <em>"how likely is it that this sentence belongs here, given the words in it?"</em> Whichever label gets the higher score wins.</p><p>After training, the <code>classes</code> object might look like:</p><pre><code>classes = {\n  "iconic": {\n    wordCounts: { "slay": 3, "queen": 2, ... },\n    docCount: 5, totalWords: 28\n  },\n  "basic": {\n    wordCounts: { "just": 4, "went": 2, ... },\n    docCount: 4, totalWords: 22\n  }\n}</code></pre><p><strong>How scoring works:</strong></p><ol><li><strong>Start with a base score</strong> for each label: <code>Math.log(cls.docCount / totalDocs)</code>. This reflects how common each label was in training — if 70% of your examples were iconic, "iconic" starts with a head start.</li><li><strong>For each word in the sentence</strong>, look up how often it appeared in this label\'s training data, and add: <code>Math.log((wordCount + 1) / (cls.totalWords + vocabSize))</code>. The <code>+ 1</code> is called "Laplace smoothing" — it makes sure a word the model has never seen doesn\'t break the math by producing a zero.</li><li><strong>Return the label</strong> with the highest total score.</li></ol><p>We use <code>Math.log</code> (logarithms) because multiplying many tiny probabilities together would give a number too small for the computer to handle. Adding logs is mathematically the same thing but keeps the numbers manageable.</p><p><strong>Parameters:</strong></p><ul><li><code>classes</code> — the trained data (same shape as Challenge 2)</li><li><code>text</code> — the sentence to classify</li><li><code>totalDocs</code> — total number of training examples across all labels</li><li><code>vocabSize</code> — how many unique words the model saw during training</li><li><code>tokenize</code> — your tokenizer function</li></ul>',
    starterCode: 'function predictLabel(classes, text, totalDocs, vocabSize, tokenize) {\n  // Implement Naive Bayes prediction\n  // Return the label with the highest log-probability score\n\n}',
    solution: 'function predictLabel(classes, text, totalDocs, vocabSize, tokenize) {\n  let words = tokenize(text);\n  let bestLabel = null;\n  let bestScore = -Infinity;\n  for (let [label, cls] of Object.entries(classes)) {\n    let score = Math.log(cls.docCount / totalDocs);\n    for (let word of words) {\n      let wordCount = cls.wordCounts[word] || 0;\n      score += Math.log((wordCount + 1) / (cls.totalWords + vocabSize));\n    }\n    if (score > bestScore) {\n      bestScore = score;\n      bestLabel = label;\n    }\n  }\n  return bestLabel;\n}',
    hints: [
      'Use <code>Object.entries(classes)</code> to iterate labels. Track the best score with <code>-Infinity</code> as the initial value.',
    ],
    testCases: PREDICT_TEST_CASES,
    validateFn: function (userFn) { return validatePredict(userFn); },
  },
];


// ============================================================
//  TIER REGISTRY & ACTIVE STATE
// ============================================================

const TUTORIAL_TIERS = {
  easy:   { label: '\u{1F331} Easy',   tagline: 'Guided step-by-step \u2014 fill in 1\u20132 lines at a time', challenges: EASY_CHALLENGES },
  medium: { label: '\u{1F33F} Medium', tagline: 'Less hand-holding \u2014 you write more code', challenges: MEDIUM_CHALLENGES },
  hard:   { label: '\u{1F333} Hard',   tagline: 'Just the spec \u2014 implement everything yourself', challenges: HARD_CHALLENGES },
};

let selectedTutorialTier = 'easy';
let TUTORIAL_CHALLENGES = EASY_CHALLENGES;

function setTutorialTier(tier) {
  if (!TUTORIAL_TIERS[tier]) return;
  selectedTutorialTier = tier;
  TUTORIAL_CHALLENGES = TUTORIAL_TIERS[tier].challenges;
}


// ============================================================
// Tutorial Engine
// ============================================================

class TutorialEngine {
  constructor() {
    this.completedChallenges = new Set();
    this.currentHintIndex = {};
  }

  reset() {
    this.completedChallenges.clear();
    this.currentHintIndex = {};
  }

  runChallenge(challengeId, codeString) {
    const challenge = TUTORIAL_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return { success: false, error: 'Challenge not found' };

    try {
      const userFn = new Function(codeString + '\nreturn ' + this._getFnName(challengeId) + ';')();

      if (typeof userFn !== 'function') {
        return {
          success: false,
          error: 'Expected a function called "' + this._getFnName(challengeId) + '" but got ' + typeof userFn + '.',
          testResults: [],
        };
      }

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
