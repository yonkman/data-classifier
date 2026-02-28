// ============================================================
// EXAMPLE BANK — ~100 fun, silly sentences for students to label
// Label them as "iconic" (queer-coded energy) or "basic" (not queer-coded).
// Every sentence is positive/neutral — nothing harmful!
// Reflects a range of gender identities, not just one stereotype.
// Pop culture refs are 2024-2026 so teens will actually get them.
// ============================================================

const EXAMPLE_BANK = [
  // ───── OBVIOUSLY ICONIC (queer energy across identities) ─────
  { id: 1, text: "I bedazzled my phone case during math and honestly it's my best work this semester.", category: "obviously-iconic" },
  { id: 2, text: "They changed their pronouns on the group chat and everyone just updated it immediately — we love to see it.", category: "obviously-iconic" },
  { id: 3, text: "Rocking a suit with platform boots to prom because gender is a spectrum and I'm the whole rainbow.", category: "obviously-iconic" },
  { id: 4, text: "I made a Spotify playlist called 'main character energy' and it has 200 songs.", category: "obviously-iconic" },
  { id: 5, text: "Just cut my own hair at 2 AM and you know what? It actually slaps.", category: "obviously-iconic" },
  { id: 6, text: "My flannel collection is CURATED. There are tiers.", category: "obviously-iconic" },
  { id: 7, text: "Showed up to class in a full cape today. Not Halloween. Just a Tuesday.", category: "obviously-iconic" },
  { id: 8, text: "OBSESSED with this new eyeliner. The wings could cut steel.", category: "obviously-iconic" },
  { id: 9, text: "I walked into the cafeteria like it was a runway and I have zero regrets.", category: "obviously-iconic" },
  { id: 10, text: "Made friendship bracelets for my entire found family and they each have a colour theme.", category: "obviously-iconic" },
  { id: 11, text: "I don't have a 'type' — I have an elaborate tier list that I update monthly.", category: "obviously-iconic" },
  { id: 12, text: "Slay. That's it. That's the sentence.", category: "obviously-iconic" },
  { id: 13, text: "I painted my nails in bi flag colours and nobody can stop me.", category: "obviously-iconic" },
  { id: 14, text: "This outfit? Curated. This hair? Intentional. This energy? Unstoppable.", category: "obviously-iconic" },
  { id: 15, text: "I organized my bookshelf by queer subgenre and vibe. Yes there are subsections.", category: "obviously-iconic" },
  { id: 16, text: "The vibes today are immaculate and I will not let anyone ruin them.", category: "obviously-iconic" },
  { id: 17, text: "I have strong opinions about Doc Martens lacing patterns and I'm not afraid to share them.", category: "obviously-iconic" },
  { id: 18, text: "Cottagecore lesbian energy: I crocheted a frog and gave it to my crush.", category: "obviously-iconic" },
  { id: 19, text: "I don't walk into rooms, I make entrances.", category: "obviously-iconic" },
  { id: 20, text: "Just choreographed a dance routine to Chappell Roan in my bedroom and it SLAPS.", category: "obviously-iconic" },

  // ───── OBVIOUSLY BASIC ─────
  { id: 21, text: "Gonna do some homework and then probably go to bed.", category: "obviously-basic" },
  { id: 22, text: "Grabbing a double-double at Tim's before practice.", category: "obviously-basic" },
  { id: 23, text: "The WiFi went down again. Restarted the router.", category: "obviously-basic" },
  { id: 24, text: "I studied for the math test for like 20 minutes.", category: "obviously-basic" },
  { id: 25, text: "Watching the hockey game tonight. Go Leafs.", category: "obviously-basic" },
  { id: 26, text: "Just scrolled TikTok for an hour and learned nothing.", category: "obviously-basic" },
  { id: 27, text: "Had a ham sandwich for lunch. It was fine.", category: "obviously-basic" },
  { id: 28, text: "The substitute teacher just put on a movie again.", category: "obviously-basic" },
  { id: 29, text: "I charged my phone to 100% and immediately unplugged it. Felt efficient.", category: "obviously-basic" },
  { id: 30, text: "I put my backpack on the floor and sat in my usual spot.", category: "obviously-basic" },
  { id: 31, text: "The weather is supposed to be 12 degrees tomorrow so that's something.", category: "obviously-basic" },
  { id: 32, text: "I've been meaning to clean my room for three weeks.", category: "obviously-basic" },
  { id: 33, text: "Bus was late again. Stood there for 15 minutes.", category: "obviously-basic" },
  { id: 34, text: "Finished my chores and now I'm just sitting here.", category: "obviously-basic" },
  { id: 35, text: "Went to the library to print something. That's the whole story.", category: "obviously-basic" },
  { id: 36, text: "Sorted the recycling and took out the garbage.", category: "obviously-basic" },
  { id: 37, text: "I had cereal for dinner. No regrets, no flavour.", category: "obviously-basic" },
  { id: 38, text: "My screen time report came in and I don't want to talk about it.", category: "obviously-basic" },
  { id: 39, text: "Walked to the corner store for chips. Came back. End of story.", category: "obviously-basic" },
  { id: 40, text: "Did a load of laundry and forgot about it in the washer.", category: "obviously-basic" },

  // ───── SNEAKY ICONIC (sounds normal but has queer energy) ─────
  { id: 41, text: "I have a very specific ranking of every season of Drag Race and I WILL debate you.", category: "sneaky-iconic", note: "Deep Drag Race knowledge? Iconic behaviour." },
  { id: 42, text: "I genuinely sobbed during the last season of Heartstopper.", category: "sneaky-iconic", note: "Emotional investment in a beloved queer show." },
  { id: 43, text: "I know the entire Chappell Roan discography in order and quiz my friends on it.", category: "sneaky-iconic", note: "Chappell Roan stan culture is iconic energy." },
  { id: 44, text: "I refer to my house plants by name and they each have backstories.", category: "sneaky-iconic", note: "Elaborate plant parenthood is iconic energy." },
  { id: 45, text: "I know at least three different types of tea and I don't mean Earl Grey.", category: "sneaky-iconic", note: "'Tea' as gossip — iconic double meaning." },
  { id: 46, text: "My Halloween costume takes six months of planning minimum.", category: "sneaky-iconic", note: "Dedication to costume craft? That's iconic." },
  { id: 47, text: "I've reread every single Sapphic YA novel on that one Goodreads list.", category: "sneaky-iconic", note: "Deep investment in queer literature across identities." },
  { id: 48, text: "I spent three hours making a moodboard for an outfit I'll wear once.", category: "sneaky-iconic", note: "Moodboard dedication for a single outfit is peak queer energy." },
  { id: 49, text: "I made a themed charcuterie board for a Tuesday.", category: "sneaky-iconic", note: "Themed anything on a random weekday is iconic." },
  { id: 50, text: "I know the entire choreography to at least four music videos right now.", category: "sneaky-iconic", note: "Yes four. Minimum." },

  // ───── SNEAKY BASIC (sounds fun but is actually basic) ─────
  { id: 51, text: "I'm training for a 5K and tracking my splits on Strava.", category: "sneaky-basic", note: "Running stats? Respect, but that's basic energy." },
  { id: 52, text: "Just discovered a new productivity app and I'm reorganizing my entire life.", category: "sneaky-basic", note: "Productivity app enthusiasm is peak basic." },
  { id: 53, text: "Our fantasy hockey league draft is this weekend.", category: "sneaky-basic", note: "Fantasy sports are the basics' natural habitat." },
  { id: 54, text: "I just learned how to make my own protein bars from a YouTube video.", category: "sneaky-basic", note: "DIY protein bars. Incredibly basic." },
  { id: 55, text: "I'm trying to hit 10K steps every day and I bought a pedometer for it.", category: "sneaky-basic", note: "Step-count discourse is certified basic." },
  { id: 56, text: "Spent Saturday organizing my locker with colour-coded folders.", category: "sneaky-basic", note: "Colour-coded folders in a locker is practical-basic energy." },
  { id: 57, text: "I'm really into chess right now. Watching GM streams every night.", category: "sneaky-basic", note: "Chess Twitch culture is wonderfully basic." },
  { id: 58, text: "I just optimized my study schedule with a colour-coded spreadsheet.", category: "sneaky-basic", note: "Spreadsheet optimization: a pillar of basic culture." },
  { id: 59, text: "I'm doing a no-spend month challenge I found on Reddit.", category: "sneaky-basic", note: "Reddit personal finance challenges are extremely basic." },
  { id: 60, text: "I alphabetized my spice rack and it was oddly satisfying.", category: "sneaky-basic", note: "Spice rack organization could go either way, but alphabetical is basic." },

  // ───── POP CULTURE REFERENCES (2024-2026 relevant) ─────
  { id: 61, text: "Chappell Roan at the VMAs was a religious experience and I will not be taking questions.", category: "pop-culture" },
  { id: 62, text: "Legally Blonde is a documentary about a woman achieving her dreams.", category: "pop-culture" },
  { id: 63, text: "I've watched Bottoms four times now and every time I notice a new unhinged detail.", category: "pop-culture" },
  { id: 64, text: "The Wicked movie soundtrack has been my entire personality since November 2024.", category: "pop-culture" },
  { id: 65, text: "Lil Nas X, Troye Sivan, Renée Rapp, Chappell Roan — that's my Mount Rushmore.", category: "pop-culture" },
  { id: 66, text: "I've seen every episode of Heartstopper including the deleted scenes on YouTube.", category: "pop-culture" },
  { id: 67, text: "Red, White & Royal Blue was a movie about diplomacy and nobody can convince me otherwise.", category: "pop-culture" },
  { id: 68, text: "I've listened to 'HOT TO GO!' exactly 1,000 times and each time I do the choreography.", category: "pop-culture" },
  { id: 69, text: "The Last of Us made me feel things about a post-apocalyptic mushroom show that I was not prepared for.", category: "pop-culture" },
  { id: 70, text: "I think about Nimona at least once a week.", category: "pop-culture" },

  // ───── DRAMATIC FLAIR ─────
  { id: 71, text: "I just sneezed and someone said 'bless you' and honestly? Iconic of them.", category: "dramatic" },
  { id: 72, text: "My emotional support water bottle is EMPTY and I am in CRISIS.", category: "dramatic" },
  { id: 73, text: "The way the sunlight hit the autumn leaves today? Cinema.", category: "dramatic" },
  { id: 74, text: "I gasped so loud at the plot twist my cat judged me.", category: "dramatic" },
  { id: 75, text: "This latte art is too beautiful to drink. Someone get a museum.", category: "dramatic" },
  { id: 76, text: "I stubbed my toe and gave a full Shakespearean death monologue.", category: "dramatic" },
  { id: 77, text: "My umbrella broke in the rain and I just stood there like a music video.", category: "dramatic" },
  { id: 78, text: "The audacity of this weather to be grey on MY birthday.", category: "dramatic" },
  { id: 79, text: "I fully narrated my own grocery trip like a nature documentary.", category: "dramatic" },
  { id: 80, text: "Someone cut in line at Tim Hortons and I've written three diary entries about it.", category: "dramatic" },

  // ───── WHOLESOME QUEER JOY ─────
  { id: 81, text: "My friend came out to me today and I just hugged them and we both cried.", category: "wholesome" },
  { id: 82, text: "Someone on the bus complimented my pride pin and it made my entire week.", category: "wholesome" },
  { id: 83, text: "I finally found a name that feels like ME and it's the best feeling in the world.", category: "wholesome" },
  { id: 84, text: "A random kid waved at me from a school bus and honestly I'm still thinking about it.", category: "wholesome" },
  { id: 85, text: "I left a sticky note on my friend's locker that said 'you're amazing' with a little rainbow.", category: "wholesome" },
  { id: 86, text: "My chosen family had a movie night and I made everyone matching snack bags.", category: "wholesome" },
  { id: 87, text: "Seeing myself in a character on screen for the first time ever was life-changing.", category: "wholesome" },
  { id: 88, text: "Made hot chocolate from scratch while it snowed outside. Perfection.", category: "wholesome" },

  // ───── CONFIDENT ENERGY ─────
  { id: 89, text: "I don't need a reason to wear glitter. Glitter IS the reason.", category: "confident" },
  { id: 90, text: "My selfie game today is UNMATCHED and the world deserves to know.", category: "confident" },
  { id: 91, text: "Wore a binder for the first time and felt like a SUPERHERO.", category: "confident" },
  { id: 92, text: "Confidence level: wearing sunglasses indoors and owning it.", category: "confident" },
  { id: 93, text: "I am the moment. The moment is me. We are one.", category: "confident" },
  { id: 94, text: "Walked past a mirror, winked at myself. No shame.", category: "confident" },
  { id: 95, text: "Shaved half my head and dyed it purple and I have never felt more myself.", category: "confident" },
  { id: 96, text: "My energy today is 'main character who just had a glow-up montage.'", category: "confident" },

  // ───── MUNDANE TASKS ─────
  { id: 97, text: "I defrosted the freezer. Thrilling Saturday night.", category: "mundane" },
  { id: 98, text: "Went to Canadian Tire for duct tape. Just duct tape.", category: "mundane" },
  { id: 99, text: "I was on hold with Service Canada for 45 minutes.", category: "mundane" },
  { id: 100, text: "Refilled my bus pass online. Peak adulting.", category: "mundane" },
  { id: 101, text: "My phone died and I just stared at the ceiling for ten minutes.", category: "mundane" },
  { id: 102, text: "Shovelled the driveway for the fourth time this week.", category: "mundane" },
];

// ============================================================
// HELD-OUT TEST SET — used to evaluate the classifier
// "expected" is "iconic" or "basic"
// ============================================================

const TEST_SET = [
  { text: "I made a full PowerPoint ranking my top 10 fits this semester.", expected: "iconic", explanation: "Presentation-level outfit dedication is peak queer-coded energy.", difficulty: "easy" },
  { text: "I changed the batteries in the smoke detector.", expected: "basic", explanation: "Important? Yes. Queer-coded? Absolutely not.", difficulty: "easy" },
  { text: "Obsessed with this new eyeliner — the wings could literally cut glass.", expected: "iconic", explanation: "Beauty product obsession + dramatic language = iconic.", difficulty: "easy" },
  { text: "I picked up some stuff from the store and went home.", expected: "basic", explanation: "Just a regular errand, no flair detected.", difficulty: "easy" },
  { text: "I've assigned each of my succulents a zodiac sign and a gender identity.", expected: "iconic", explanation: "Astrology + plant parenthood + identity play? Iconic behaviour.", difficulty: "medium" },
  { text: "Does anyone know when the math homework is due?", expected: "basic", explanation: "Homework logistics are deeply basic energy.", difficulty: "easy" },
  { text: "I watched the Nimona movie and ugly-cried for two hours straight.", expected: "iconic", explanation: "Queer animated film + dramatic emotional response = certified iconic.", difficulty: "medium" },
  { text: "Did some laundry and watched a random YouTube video.", expected: "basic", explanation: "Laundry + algorithm surfing = basic formula.", difficulty: "easy" },
  { text: "I curated a seven-course themed dinner party for my cat's birthday.", expected: "iconic", explanation: "A THEMED dinner? For a CAT? Extremely iconic across all identities.", difficulty: "medium" },
  { text: "I organized my tax receipts into colour-coded folders and I feel powerful.", expected: "iconic", explanation: "The COLOUR CODING and the word 'powerful' push this into iconic territory.", difficulty: "hard" },
  { text: "I quietly read a book on the bus.", expected: "basic", explanation: "Calm, understated, no drama — basic behaviour.", difficulty: "easy" },
  { text: "Started a zine about nonbinary fashion and we already have six contributors.", expected: "iconic", explanation: "Queer creative community project = extremely iconic.", difficulty: "medium" },
  { text: "I power-washed the patio and honestly it was kinda zen.", expected: "basic", explanation: "Power washing enjoyment is extremely basic, even if described poetically.", difficulty: "hard" },
  { text: "I thrifted an entire outfit and it goes harder than anything I've bought new.", expected: "iconic", explanation: "Thrift devotion with dramatic flair = iconic energy.", difficulty: "hard" },
  { text: "Downloaded a new podcast about economics.", expected: "basic", explanation: "Economics podcasts are neutral-to-basic.", difficulty: "easy" },
  { text: "I made everyone at the table pick a walk-up song and defended my choice for ten minutes.", expected: "iconic", explanation: "Walk-up song discourse with theatrical energy? Icon behaviour.", difficulty: "medium" },
  { text: "Shovelled the neighbour's driveway because they're out of town.", expected: "basic", explanation: "Sweet and neighbourly, but solidly basic energy.", difficulty: "medium" },
  { text: "I spent an hour deciding which pin goes where on my denim jacket and it was the best hour of my week.", expected: "iconic", explanation: "Pin placement as art form is elite iconic behaviour.", difficulty: "medium" },
  { text: "Looked up RRSP contribution limits and felt responsible.", expected: "basic", explanation: "Financial responsibility is admirable but extremely basic.", difficulty: "medium" },
  { text: "I did a dramatic coat reveal at school and someone actually gasped.", expected: "iconic", explanation: "A public fashion reveal that gets a reaction? Peak icon.", difficulty: "hard" },
];
