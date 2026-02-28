// ============================================================
// EXAMPLE BANK — ~100 pre-written sentences for students to label
// Each has a "category" tag (not shown to students) to help the
// teacher understand the distribution, and an optional "note"
// that appears after the student labels it, prompting discussion.
// ============================================================

const EXAMPLE_BANK = [
  // ───── CLEARLY SUPPORTIVE / POSITIVE ─────
  { id: 1, text: "I'm so proud of you for coming out to your family!", category: "straightforward-positive" },
  { id: 2, text: "This community has saved my life. Thank you all.", category: "straightforward-positive" },
  { id: 3, text: "Happy Pride Month! You are loved and valid. 🌈", category: "straightforward-positive" },
  { id: 4, text: "My two moms are the best parents anyone could ask for.", category: "straightforward-positive" },
  { id: 5, text: "I finally found a therapist who understands trans issues and it's been amazing.", category: "straightforward-positive" },
  { id: 6, text: "Seeing so many people at the pride march made me feel less alone.", category: "straightforward-positive" },
  { id: 7, text: "You are valid no matter where you are in your journey.", category: "straightforward-positive" },
  { id: 8, text: "I love that my school has a GSA. It's the best part of my week.", category: "straightforward-positive" },
  { id: 9, text: "Being bisexual is a beautiful part of who I am.", category: "straightforward-positive" },
  { id: 10, text: "I'm grateful for friends who use my correct pronouns without being asked.", category: "straightforward-positive" },
  { id: 11, text: "Our support group helped me realize I'm not broken.", category: "straightforward-positive" },
  { id: 12, text: "Trans rights are human rights.", category: "straightforward-positive" },
  { id: 13, text: "I just got my name legally changed and I'm crying happy tears.", category: "straightforward-positive" },
  { id: 14, text: "My dad finally used my correct name today. Small step but it means everything.", category: "straightforward-positive" },
  { id: 15, text: "Love is love is love is love.", category: "straightforward-positive" },
  { id: 16, text: "Finding out my favorite author is also ace made my whole day.", category: "straightforward-positive" },
  { id: 17, text: "This forum is the only place I can truly be myself.", category: "straightforward-positive" },
  { id: 18, text: "Allies who show up quietly and consistently are the real ones.", category: "straightforward-positive" },
  { id: 19, text: "I wore a pride pin to school today and three people smiled at me.", category: "straightforward-positive" },
  { id: 20, text: "You deserve to take up space exactly as you are.", category: "straightforward-positive" },

  // ───── CLEARLY NEGATIVE / HARMFUL ─────
  { id: 21, text: "People like you don't deserve rights.", category: "straightforward-negative" },
  { id: 22, text: "Being gay is a choice and you should just stop.", category: "straightforward-negative" },
  { id: 23, text: "You'll never be a real woman no matter what you do.", category: "straightforward-negative" },
  { id: 24, text: "I think all of this gender stuff is just mental illness.", category: "straightforward-negative" },
  { id: 25, text: "Nobody actually believes non-binary is a real thing.", category: "straightforward-negative" },
  { id: 26, text: "Why do you people have to shove it in everyone's face?", category: "straightforward-negative" },
  { id: 27, text: "Your parents must be so disappointed in you.", category: "straightforward-negative" },
  { id: 28, text: "This is disgusting and unnatural.", category: "straightforward-negative" },
  { id: 29, text: "I refuse to use made-up pronouns.", category: "straightforward-negative" },
  { id: 30, text: "You're just doing this for attention.", category: "straightforward-negative" },
  { id: 31, text: "Kids shouldn't even know about this stuff.", category: "straightforward-negative" },
  { id: 32, text: "There are only two genders, period.", category: "straightforward-negative" },
  { id: 33, text: "Ugh, another pride month? Nobody cares.", category: "straightforward-negative" },
  { id: 34, text: "I don't want my children exposed to your lifestyle.", category: "straightforward-negative" },
  { id: 35, text: "You're confused. It's just a phase.", category: "straightforward-negative" },
  { id: 36, text: "These people need conversion therapy, not support groups.", category: "straightforward-negative" },
  { id: 37, text: "Stop trying to recruit kids into your ideology.", category: "straightforward-negative" },
  { id: 38, text: "I don't hate you, I just think your lifestyle is sinful.", category: "straightforward-negative" },
  { id: 39, text: "We shouldn't have to change our language just because you're offended.", category: "straightforward-negative" },
  { id: 40, text: "This is why society is falling apart.", category: "straightforward-negative" },

  // ───── RECLAIMED LANGUAGE (tricky — in-group affection) ─────
  { id: 41, text: "OMG you look SO queer today, I love it!", category: "reclaimed", note: "\"Queer\" used affectionately within the community. Harmful or supportive?" },
  { id: 42, text: "Me and my fellow queers are taking over brunch this Sunday 🏳️‍🌈", category: "reclaimed", note: "In-group use of 'queers' — celebratory tone." },
  { id: 43, text: "Living my best gay life and nobody can stop me.", category: "reclaimed", note: "Proud self-identification — is 'gay' positive or contextual here?" },
  { id: 44, text: "We're here, we're queer, get used to it!", category: "reclaimed", note: "Classic protest chant using reclaimed language." },
  { id: 45, text: "That's the gayest thing I've ever seen and I am HERE for it.", category: "reclaimed", note: "\"Gayest\" used as enthusiastic praise within community." },
  { id: 46, text: "Just a couple of disaster bis trying to figure life out.", category: "reclaimed", note: "Self-deprecating humor within the bisexual community." },
  { id: 47, text: "The trans agenda today: nap, eat pizza, play video games.", category: "reclaimed", note: "Humorous subversion of the 'trans agenda' trope." },
  { id: 48, text: "Dykes on Bikes is the best part of every pride parade!", category: "reclaimed", note: "\"Dykes\" is reclaimed — this references a well-known pride group." },
  { id: 49, text: "Only a fellow ace would understand the joy of a perfect garlic bread.", category: "reclaimed", note: "In-community humor about asexuality." },
  { id: 50, text: "My enby friend group chat is called 'The Gender Thieves' and I love it.", category: "reclaimed", note: "Playful in-group humor about non-binary identities." },

  // ───── SAME WORDS, HOSTILE CONTEXT ─────
  { id: 51, text: "That's so gay. What a waste of time.", category: "hostile-slang", note: "\"Gay\" used as a pejorative — classic example of casual homophobia." },
  { id: 52, text: "Lol what a queer. Can't believe people actually live like that.", category: "hostile-slang", note: "Same word as #41 but used to demean." },
  { id: 53, text: "Stop being such a drama queen about your pronouns.", category: "hostile-slang", note: "Dismissive — weaponizing stereotypes." },
  { id: 54, text: "I bet the 'trans agenda' is just grooming kids.", category: "hostile-context", note: "Compare with #47 — same phrase, very different intent." },
  { id: 55, text: "Another day, another person making their whole personality about being gay.", category: "hostile-context", note: "Dismissive framing of identity as attention-seeking." },

  // ───── SARCASM & IRONY (hard for classifiers) ─────
  { id: 56, text: "Oh sure, because LGBTQ+ people definitely have TOO many rights already.", category: "sarcasm", note: "Sarcasm supporting LGBTQ+ rights — but a classifier might read it as anti-rights." },
  { id: 57, text: "Wow, what a brave opinion to have in 2026 — that gay people are bad.", category: "sarcasm", note: "Sarcastic criticism of homophobia." },
  { id: 58, text: "Yes, my existence is definitely a political statement. I woke up and chose agenda.", category: "sarcasm", note: "Sarcastic pushback against politicization of identity." },
  { id: 59, text: "Nothing says 'family values' like disowning your kid for being gay.", category: "sarcasm", note: "Bitter sarcasm critiquing homophobic families." },
  { id: 60, text: "I just LOVE being told my identity is a phase. Really makes my day.", category: "sarcasm", note: "Sarcastic — actually expressing pain about dismissal." },
  { id: 61, text: "Thank you so much for your unsolicited opinion about my gender. Very helpful.", category: "sarcasm", note: "Sarcasm pushing back on intrusive comments." },
  { id: 62, text: "Ah yes, the classic 'I have a gay friend so I can't be homophobic' defense.", category: "sarcasm", note: "Calling out a common deflection — supportive, but the words are tricky." },

  // ───── AMBIGUOUS / CONTEXT-DEPENDENT ─────
  { id: 63, text: "I don't really understand non-binary identities but I'm trying to learn.", category: "ambiguous", note: "Genuine effort or veiled dismissal? Tone matters." },
  { id: 64, text: "My partner and I just moved in together.", category: "ambiguous", note: "Gender-neutral — a model might assume heterosexual. Nothing harmful here." },
  { id: 65, text: "I'm not sure if I'm gay or just confused.", category: "ambiguous", note: "Someone questioning their identity — vulnerable, not harmful." },
  { id: 66, text: "Is it okay to ask someone what their pronouns are?", category: "ambiguous", note: "Genuine question — supportive intent but a classifier might not know." },
  { id: 67, text: "I think everyone should just keep their sexuality private.", category: "ambiguous", note: "Could be respectful or could be 'don't ask don't tell' erasure." },
  { id: 68, text: "I support gay people but I don't think they should get married in churches.", category: "ambiguous", note: "Conditional support — is it positive or harmful?" },
  { id: 69, text: "Why do we need a whole month for pride?", category: "ambiguous", note: "Could be genuine curiosity or dismissive complaint." },
  { id: 70, text: "I don't have a problem with trans people, I just have concerns about sports.", category: "ambiguous", note: "Common framing — genuine concern or dog whistle?" },
  { id: 71, text: "My religion says homosexuality is wrong but I still love gay people.", category: "ambiguous", note: "Does 'love the sinner hate the sin' count as supportive?" },
  { id: 72, text: "I think labels are unnecessary. Why can't people just be people?", category: "ambiguous", note: "Sounds open-minded but can erase identities that need visibility." },
  { id: 73, text: "I accidentally used the wrong pronouns and felt terrible about it.", category: "ambiguous", note: "Shows good intentions despite the mistake." },
  { id: 74, text: "Do we really need so many letters in LGBTQIA+?", category: "ambiguous", note: "Could be genuine confusion or mockery of inclusivity." },

  // ───── REPORTING HARM (describing negative experiences) ─────
  { id: 75, text: "Someone called me a slur at school today and no one did anything.", category: "reporting-harm", note: "The post is about harm but the poster needs support — should a moderator flag this as 'negative'?" },
  { id: 76, text: "My parents said they'd kick me out if I'm gay. I'm scared.", category: "reporting-harm", note: "Negative situation, but the post itself is a cry for help." },
  { id: 77, text: "I've been having suicidal thoughts since I was outed at school.", category: "reporting-harm", note: "Critical — classifier must not label this as 'negative/harmful' in a moderation sense." },
  { id: 78, text: "The kids at school keep deadnaming me on purpose.", category: "reporting-harm", note: "Reporting bullying — the POST isn't harmful, the situation is." },
  { id: 79, text: "I was told I couldn't use the bathroom that matches my gender identity.", category: "reporting-harm", note: "Describing discrimination — should be flagged for support, not as harmful content." },
  { id: 80, text: "My therapist tried to convince me I'm not really trans.", category: "reporting-harm", note: "Describing a harmful experience — the person needs help." },
  { id: 81, text: "I feel like nobody will ever love me because I'm intersex.", category: "reporting-harm", note: "Expression of pain — needs empathy, not content removal." },
  { id: 82, text: "Every time I come out to someone new, I'm terrified they'll reject me.", category: "reporting-harm", note: "Vulnerability and fear — not harmful content." },

  // ───── ALLY STATEMENTS & EDUCATIONAL ─────
  { id: 83, text: "I'm straight but I'll always stand up for my LGBTQ+ friends.", category: "ally", },
  { id: 84, text: "I learned about the Stonewall riots today and it changed my perspective.", category: "ally" },
  { id: 85, text: "If your child comes out to you, the most important thing is to listen.", category: "ally" },
  { id: 86, text: "Asking for pronouns should be as normal as asking for someone's name.", category: "ally" },
  { id: 87, text: "I messed up my friend's pronouns but I corrected myself and moved on.", category: "ally" },
  { id: 88, text: "Nobody should have to hide who they are to feel safe.", category: "ally" },

  // ───── CODED / SUBTLE HARM ─────
  { id: 89, text: "I just think kids are too young to know if they're trans.", category: "coded-harm", note: "Commonly used to delay or deny gender-affirming care." },
  { id: 90, text: "I respect all people, but biologically there are only two sexes.", category: "coded-harm", note: "Uses 'biology' framing to dismiss trans and intersex identities." },
  { id: 91, text: "I don't mind gay people as long as they act normal.", category: "coded-harm", note: "Conditional acceptance with conformity as the price." },
  { id: 92, text: "What happened to just being a tomboy? Now everyone's non-binary.", category: "coded-harm", note: "Nostalgia framing to delegitimize non-binary identities." },
  { id: 93, text: "I support the LGB community. The rest is going too far.", category: "coded-harm", note: "Deliberately excluding trans and other identities." },
  { id: 94, text: "Why do they need a flag? I don't have a flag for being straight.", category: "coded-harm", note: "False equivalence that ignores historical context." },
  { id: 95, text: "With all these new identities, how is anyone supposed to keep up?", category: "coded-harm", note: "Frames inclusion as a burden." },

  // ───── MIXED / COMPLEX ─────
  { id: 96, text: "I love my gay son but I pray every night that he'll change.", category: "complex", note: "Love and rejection in the same sentence." },
  { id: 97, text: "I voted against the marriage ban even though my church told me not to.", category: "complex", note: "Supportive action despite social pressure." },
  { id: 98, text: "Being closeted at work is exhausting. I smile but inside I'm falling apart.", category: "complex", note: "Negative feelings but clear need for support." },
  { id: 99, text: "My transition has been the hardest and most beautiful experience of my life.", category: "complex", note: "Both painful and affirming." },
  { id: 100, text: "I wish people would stop calling me brave. I just want to exist.", category: "complex", note: "Frustration with being seen as 'inspirational' for existing." },
  { id: 101, text: "Sometimes I wonder if coming out was worth losing my family.", category: "complex", note: "Deep pain — but the post itself is not harmful." },
  { id: 102, text: "One moment they're nice about it, the next they're making jokes behind my back.", category: "complex", note: "Describing inconsistent allyship." },
];

// ============================================================
// HELD-OUT TEST SET — used in Part 3 to evaluate the classifier
// "expected" is the thoughtful/nuanced label, "explanation" is
// shown to students after they see the model's prediction.
// ============================================================

const TEST_SET = [
  { text: "I'm so happy my sister came out — our family loves her no matter what.", expected: "positive", explanation: "Clearly supportive family acceptance.", difficulty: "easy" },
  { text: "People who think being gay is okay are deluded.", expected: "negative", explanation: "Direct dismissal and insult.", difficulty: "easy" },
  { text: "Yaaas queen, slay! The queerest outfit I've ever seen! 💅", expected: "positive", explanation: "Celebratory in-community language. 'Queerest' is praise here.", difficulty: "medium" },
  { text: "I'm praying for you to find the right path.", expected: "negative", explanation: "Coded language implying being LGBTQ+ is wrong, despite gentle tone.", difficulty: "hard" },
  { text: "Just got called a f** at the gas station. Happy Tuesday I guess.", expected: "positive", explanation: "The person is reporting harm and needs support — the POST isn't harmful, even though it describes a slur.", difficulty: "hard" },
  { text: "Another pronoun warrior demanding special treatment.", expected: "negative", explanation: "Mocking trans/non-binary people who ask for correct pronouns.", difficulty: "medium" },
  { text: "Oh wonderful, they added ANOTHER letter to the alphabet soup.", expected: "negative", explanation: "Sarcastic mockery of LGBTQ+ inclusivity.", difficulty: "medium" },
  { text: "I never understood non-binary people until my kid came out as one. Now I get it.", expected: "positive", explanation: "Growth and acceptance through personal experience.", difficulty: "medium" },
  { text: "Not gonna lie, seeing two dads at the playground made me smile.", expected: "positive", explanation: "Genuine positive reaction to queer families.", difficulty: "easy" },
  { text: "Sure, come out at work. See how fast you get 'managed out.'", expected: "negative", explanation: "Threatening/warning about workplace discrimination — the speaker is being hostile, not supportive.", difficulty: "hard" },
  { text: "Ugh can we talk about something other than being trans for once?", expected: "negative", explanation: "Dismissive of someone's identity and experience.", difficulty: "medium" },
  { text: "My therapist told me there's no wrong way to be a boy. That helped.", expected: "positive", explanation: "Affirming therapy experience — challenges rigid gender norms.", difficulty: "easy" },
  { text: "Friendly reminder that bi people in 'straight-passing' relationships are still bi.", expected: "positive", explanation: "Countering bi erasure — supportive and educational.", difficulty: "medium" },
  { text: "I mean I don't HATE them, I just don't want to see it.", expected: "negative", explanation: "'Tolerant' framing that is actually exclusionary.", difficulty: "hard" },
  { text: "Today's been rough. Getting misgendered constantly is exhausting.", expected: "positive", explanation: "Expressing pain — this person needs support, not moderation.", difficulty: "hard" },
  { text: "We should protect kids from this gender ideology in schools.", expected: "negative", explanation: "'Protect kids' framing used to oppose LGBTQ+ inclusive education.", difficulty: "medium" },
  { text: "My gay uncle has been with his husband for 30 years. Goals honestly.", expected: "positive", explanation: "Admiration for a long-term same-sex relationship.", difficulty: "easy" },
  { text: "Oh great, another straight person explaining pride to me. Thanks so much.", expected: "positive", explanation: "Sarcastic but directed AT unhelpful allyship — speaker is LGBTQ+ and venting. Supportive context.", difficulty: "hard" },
  { text: "You're too pretty to be a lesbian.", expected: "negative", explanation: "Backhanded compliment rooted in stereotypes.", difficulty: "medium" },
  { text: "I don't care who you love, just don't make it my problem.", expected: "negative", explanation: "Sounds neutral but frames LGBTQ+ existence as a 'problem.'", difficulty: "hard" },
];
