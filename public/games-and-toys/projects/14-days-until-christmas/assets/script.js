/**
 * 14 Days Until Christmas! - A tiny browser VN/Dating Sim
 * Single-file runtime JS (no libs)
 *
 * Controls:
 * - Click dialogue box or press Space/Enter to advance
 * - Choices appear centered
 * - Dev tools: press D or click "Dev", or add ?dev=1 to URL
 */

(() => {
  // Game State
  const state = {
    day: 14, // counts down to 1
    love: {
      ryu: 0,
      haruto: 0,
      kaoru: 0,
    },
    // Track highest viewed tier per boy for deterministic, non-skipping progression
    progress: {
      ryu: -1,
      haruto: -1,
      kaoru: -1,
    },
    // Stats to influence endings
    stats: {
      lunches: { "Melon-pan": 0, "Curry": 0, "Udon": 0, "Gyoza": 0, "Ramen": 0 },
      quizzes: { correct: 0, total: 0 },
    },
    dev: false,
    hard: false, // Hard Mode flag (only toggleable at title/new game)
    sceneQueue: [], // [{speaker, text, show: ['ryu']}...]
    awaitingChoice: false,
    rng: mulberry32(Date.now() % 2 ** 31),
  };

  // Trivia bank (normalized quotes to plain ASCII)
  const trivia = {
    architecture: [
      { q: "Which shape is commonly used to distribute weight in arches?", options: ["Triangle", "Circle", "Square", "Hexagon"], answer: "Triangle" },
      { q: "What do architects call a building's external face?", options: ["Facade", "Base", "Crown", "Void"], answer: "Facade" },
      { q: "Which material became popular for skyscrapers due to its strength-to-weight ratio?", options: ["Steel", "Brick", "Marble", "Wood"], answer: "Steel" },
      { q: "Which ancient civilization is famous for column orders like Doric and Ionic?", options: ["Greek", "Egyptian", "Mayan", "Chinese"], answer: "Greek" },
      { q: "Blueprints today are most often produced using?", options: ["CAD software", "Typewriters", "Charcoal", "Silk printing"], answer: "CAD software" },
      { q: "Which architectural style is known for flying buttresses?", options: ["Gothic", "Baroque", "Romanesque", "Modernist"], answer: "Gothic" },
      { q: "What is the top element of a column called?", options: ["Capital", "Base", "Shaft", "Entablature"], answer: "Capital" },
      { q: "Le Corbusier is most associated with which movement?", options: ["Modernism", "Postmodernism", "Brutalism", "Deconstructivism"], answer: "Modernism" },
      { q: "Which city is home to the Parthenon?", options: ["Athens", "Rome", "Istanbul", "Cairo"], answer: "Athens" },
      { q: "What do we call a self-supporting curved structure spanning an opening?", options: ["Arch", "Lintel", "Truss", "Beam"], answer: "Arch" },
      { q: "Which architect designed the Guggenheim Museum Bilbao?", options: ["Frank Gehry", "Zaha Hadid", "I. M. Pei", "Santiago Calatrava"], answer: "Frank Gehry" },
      { q: "What is a 'cantilever'?", options: ["A projecting beam fixed at only one end", "A decorative column", "A roof vent", "A window type"], answer: "A projecting beam fixed at only one end" },
      { q: "Which material characterizes Brutalist architecture?", options: ["Exposed concrete", "Polished marble", "Timber cladding", "Adobe"], answer: "Exposed concrete" },
      { q: "What is the main interior space of a church called?", options: ["Nave", "Apse", "Narthex", "Transept"], answer: "Nave" },
      { q: "Which famous house did Frank Lloyd Wright design over a waterfall?", options: ["Fallingwater", "Glass House", "Villa Savoye", "Maison La Roche"], answer: "Fallingwater" },
    ],
    sports: [
      { q: "How many players are on a soccer team on the field?", options: ["11", "9", "7", "12"], answer: "11" },
      { q: "In basketball, how many points is a shot from beyond the arc worth?", options: ["3", "2", "1", "4"], answer: "3" },
      { q: "In baseball, how many outs does each team get per half-inning?", options: ["3", "2", "4", "6"], answer: "3" },
      { q: "In volleyball, what is the maximum number of touches before the ball must go over?", options: ["3", "2", "4", "5"], answer: "3" },
      { q: "In tennis, what is the term for 40-40?", options: ["Deuce", "Tie", "All", "Level"], answer: "Deuce" },
      { q: "What is the distance of a marathon?", options: ["42.195 km", "26.0 km", "21.097 km", "50.0 km"], answer: "42.195 km" },
      { q: "In American football, how many points is a touchdown worth?", options: ["6", "3", "7", "2"], answer: "6" },
      { q: "Which country won the first FIFA World Cup (1930)?", options: ["Uruguay", "Brazil", "Germany", "Argentina"], answer: "Uruguay" },
      { q: "In golf, what is one stroke under par on a hole called?", options: ["Birdie", "Eagle", "Par", "Bogey"], answer: "Birdie" },
      { q: "How many rings are on the Olympic flag?", options: ["5", "4", "6", "7"], answer: "5" },
      { q: "In baseball, what is it called when a batter strikes out three times in a game?", options: ["Hat trick", "Golden sombrero", "Triple K", "Turkey"], answer: "Hat trick" },
      { q: "In basketball, what violation is moving without dribbling called?", options: ["Traveling", "Double dribble", "Carrying", "Charging"], answer: "Traveling" },
      { q: "What sport uses the terms 'love' and 'deuce' besides tennis?", options: ["Badminton", "Squash", "Table tennis", "Pickleball"], answer: "Squash" },
      { q: "In cricket, how many balls are in an over?", options: ["6", "5", "8", "10"], answer: "6" },
      { q: "Which swimming stroke is swum on the back?", options: ["Backstroke", "Breaststroke", "Freestyle", "Butterfly"], answer: "Backstroke" },
    ],
    rock: [
      { q: "Which band wrote 'Stairway to Heaven'?", options: ["Led Zeppelin", "The Beatles", "The Who", "Queen"], answer: "Led Zeppelin" },
      { q: "Who is known as the 'King of Rock and Roll'?", options: ["Elvis Presley", "Mick Jagger", "Chuck Berry", "Eric Clapton"], answer: "Elvis Presley" },
      { q: "Which band's logo features a tongue and lips?", options: ["The Rolling Stones", "Pink Floyd", "AC/DC", "Aerosmith"], answer: "The Rolling Stones" },
      { q: "Which instrument does a classic rock 'power trio' usually exclude?", options: ["Keyboard", "Guitar", "Bass", "Drums"], answer: "Keyboard" },
      { q: "Which guitarist is famous for playing a Stratocaster upside down?", options: ["Jimi Hendrix", "Jimmy Page", "Pete Townshend", "Slash"], answer: "Jimi Hendrix" },
      { q: "Which band released the album 'Dark Side of the Moon'?", options: ["Pink Floyd", "Queen", "Genesis", "Yes"], answer: "Pink Floyd" },
      { q: "Who was the lead singer of Queen?", options: ["Freddie Mercury", "Robert Plant", "Axl Rose", "Bono"], answer: "Freddie Mercury" },
      { q: "Which rock band is known for the anthem 'Smells Like Teen Spirit'?", options: ["Nirvana", "Pearl Jam", "Soundgarden", "Foo Fighters"], answer: "Nirvana" },
      { q: "AC/DC are originally from which country?", options: ["Australia", "USA", "UK", "Canada"], answer: "Australia" },
      { q: "Which Beatle was the lead guitarist of The Beatles?", options: ["George Harrison", "John Lennon", "Paul McCartney", "Ringo Starr"], answer: "George Harrison" },
      { q: "Which band wrote 'Hotel California'?", options: ["Eagles", "The Doors", "The Beach Boys", "The Byrds"], answer: "Eagles" },
      { q: "What is the name of the Rolling Stones' legendary guitarist nicknamed 'Keef'?", options: ["Keith Richards", "Ronnie Wood", "Eric Clapton", "Jeff Beck"], answer: "Keith Richards" },
      { q: "Which artist is known as the 'Boss'?", options: ["Bruce Springsteen", "Bob Dylan", "Billy Joel", "Tom Petty"], answer: "Bruce Springsteen" },
      { q: "Which band created the rock opera 'Tommy'?", options: ["The Who", "Queen", "Rush", "Genesis"], answer: "The Who" },
      { q: "Which instrument did John Bonham famously play?", options: ["Drums", "Guitar", "Bass", "Keyboard"], answer: "Drums" },
    ],
  };

  // Gift mapping for endings
  const gifts = {
    ryu: "a pair of limited-edition running gloves",
    haruto: "a miniature model kit of a spiral staircase",
    kaoru: "vintage guitar strings and a handwritten lyric book",
  };

  // Elements
  const el = {
    dayCounter: byId("dayCounter"),
    devToggle: byId("devToggle"),
    muteToggle: byId("muteToggle"),
    devPanel: byId("devPanel"),
    ryuLove: byId("ryuLove"),
    harutoLove: byId("harutoLove"),
    kaoruLove: byId("kaoruLove"),
    applyLove: byId("applyLove"),
    nextDay: byId("nextDay"),
    forceEnd: byId("forceEnd"),
    resetGame: byId("resetGame"),
    debugLine: byId("debugLine"),
    background: byId("background"),
    chars: {
      yui: qs(".char.yui"),
      ryu: qs(".char.ryu"),
      haruto: qs(".char.haruto"),
      kaoru: qs(".char.kaoru"),
      kaito: qs(".char.kaito"),
    },
    choiceOverlay: byId("choiceOverlay"),
    dialogueBox: byId("dialogueBox"),
    speaker: byId("speaker"),
    text: byId("text"),
  };

  // Init
  function boot() {
    loadState();
    setupAudio(); // init audio before UI so title music can start if needed
    applyURLDev();
    refreshHUD();
    bindEvents();
    setupTitleScreen();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Functions

  function intro() {
    // Ensure initial text is cleared
    el.text.textContent = "";
    // Show home background during intro
    showBackgroundFor("home");
    // Show Yui portrait for intro only
    showOnly("yui");
    queueScene([
      { speaker: "Narrator", text: "You are Yui Hasegawa, an ordinary high schooler with extraordinary timing." },
      { speaker: "Narrator", text: "Fourteen days until Christmas. You just learned your best friend, Mei, found a boyfriend." },
      { speaker: "Yui", text: "...So it's just you and the winter air this year, huh?" },
      { speaker: "Yui", text: "Nope. Not giving up. Fourteen days is plenty to find someone special." },
      { speaker: "Narrator", text: "Pay attention. Interests matter. Hearts nudge quietly." },
      { speaker: "Yui", text: "Okay, Yui. Deep breath. Let's do this." },
    ], () => {
      // Hide Yui again before gameplay scenes begin
      showOnly();
      startDay();
    });
  }

  function startDay() {
    if (state.day <= 0) {
      checkEnding(true);
      return;
    }
    showBackgroundFor("classroom");
    showOnly(); // hide characters initially
    refreshHUD();

    const dayNum = state.day;
    const unit = dayNum === 1 ? "day" : "days";
    const classVariety = pickClassroomLines(dayNum);

    // Lunch of the day (random) - will also be guaranteed in the 3-option menu
    const lunches = ["Melon-pan", "Curry", "Udon", "Gyoza", "Ramen"];
    const lunch = lunches[Math.floor(state.rng() * lunches.length)];

    // Gossip snippets. These are light, slice-of-life and positive/neutral.
    const classmates = ["Sakura", "Takumi", "Aiko", "Sota", "Mina", "Ren", "Natsuki", "Yuta", "Hana", "Kenta", "Jun", "Emi", "Daichi", "Rika", "Tomo", "Yuri", "Hiro", "Kei", "Aya", "Noa"];
    const classGossip = pickOne([
      `${pickOne(classmates)} forgot their indoor shoes again. Third time this week.`,
      `${pickOne(classmates)}'s scarf is so fluffy it could retire as a cloud.`,
      `${pickOne(classmates)} aced the kanji quiz and tried to hide the smile.`,
      `${pickOne(classmates)} brought homemade onigiri; half the class is suddenly generous.`,
      `${pickOne(classmates)} dozed off and answered roll call in a whisper.`,
      `${pickOne(classmates)} binged last night's drama and cried at the mid-episode twist.`,
      `${pickOne(classmates)} swears the hero in that detective show is the culprit. Bold take.`,
      `${pickOne(classmates)} stayed up to catch a late stream and now speaks only in emotes.`,
      `${pickOne(classmates)}'s favorite VTuber announced new merch; wallets observed a moment of silence.`,
      `${pickOne(classmates)} tried a new pomodoro app and became a productivity cult leader for a day.`,
      `Group chat is split over last night's cooking show elimination. ${pickOne(classmates)} is leading the appeals committee.`,
      `${pickOne(classmates)} says the new idol anime OP is stuck in their head and it's contagious.`,
      `${pickOne(classmates)} found a stray cat near the station and now has a fuzzy shadow.`,
      `${pickOne(classmates)} started journaling; the cover has stickers that look like encouragement.`,
      `${pickOne(classmates)} brought a thermos labeled 'rocket fuel'. It tastes like cocoa.`,
      `${pickOne(classmates)} switched to gel pens and suddenly takes legendary notes.`,
      `${pickOne(classmates)} is practicing a dance challenge for the school festival. Corridor mirrors are booked.`,
      `${pickOne(classmates)}'s lunchbox had tiny penguin onigiri. Art you can eat.`,
      `${pickOne(classmates)} learned three new kanji from a historical drama binge.`,
      `${pickOne(classmates)} claims their plant 'Pepper' passed the vibe check at morning light.`,
      `${pickOne(classmates)} wore mismatched socks 'for luck' and immediately found a coin.`,
      `${pickOne(classmates)} recommended a slice-of-life anime and now half the class is soft.`,
      `${pickOne(classmates)} solved the math problem using streamer speedrun logic. It worked?`,
      `${pickOne(classmates)} traded recipes from a cooking channel; now everyone craves tamagoyaki.`,
      `${pickOne(classmates)} says the news app spoiled the sports highlights and demands reparations.`,
      `${pickOne(classmates)} tried meditation with a soundscape video and fell asleep in record time.`,
      `${pickOne(classmates)} is convinced the new superhero show is a secret love story.`,
      `${pickOne(classmates)}'s umbrella turned inside out like a tragic character arc.`,
      `${pickOne(classmates)} claims their cat subscribed to a streamer by walking on the keyboard.`,
      `${pickOne(classmates)} brought extra highlighters 'for democracy.' Sharing ensued.`,
    ]);

    const boyGossip = pickOne([
      "They say Ryu is being scouted by a couple of schools. Coach pretends not to grin.",
      "Rumor is Haruto's model won a regional architecture award. He hasn't told anyone.",
      "Someone saw Kaoru near the old arcade. Story says he broke up a fight, not started one.",
      "Ryu cleared a new sprint record at morning practice. The track squeaked in protest.",
      "Haruto's sketchbook got borrowed by the art teacher for 'reference.' He's mortified.",
      "Kaoru's band rehearsed on the roof stairs. The janitor became their first fan.",
      "Ryu watched a pro relay replay last night and took notes like it was exam season.",
      "Haruto stayed up sketching after a documentary about wooden temples. Lines got gentler.",
      "Kaoru streamed a late acoustic set; chat spammed hearts until he hid behind his hair.",
      "Ryu tried a new shoe lacing technique he saw on a channel and swears it adds 0.1s.",
      "Haruto visited a small gallery; came back muttering about light and kindness again.",
      "Kaoru argued online about 'best guitar tone' and then apologized to his amp.",
      "Coach banned energy drinks after Ryu's 'science experiment'. Water reigns.",
      "Haruto bookmarked a video on daylighting. Librarian called it 'romantic.' He blushed.",
      "Kaoru's favorite streamer shouted out rooftop sunsets; he said the roof was his first.",
      "Ryu taught first-years proper starts. They now salute when he passes. He hates it.",
      "Haruto 3D-printed a tiny arch. It holds exactly one cookie. Research, he claims.",
      "Kaoru wrote a chorus after hearing a lo-fi beat on stream. It sounds like winter.",
      "Ryu donated his old spikes; someone hung them like talismans in the locker room.",
      "Haruto corrected a floor plan on TV under his breath. The remote pretended not to hear.",
      "Kaoru's band might open for a cafe night. Payment: cocoa and applause.",
      "Ryu was spotted jogging with a stray dog. Both looked determined.",
      "Haruto left sticky notes in the study room: 'Drink water. Breathe. Keep going.'",
      "Kaoru helped a first-year tune a guitar, then pretended he didn't.",
      "Pretty sure Kaoru has a curry punch card at the cafeteria—one more and lunch is on the house.",
      "Ryu bought out the melon-pan tray again. The bakery lady just winked.",
      "Haruto keeps recommending that new udon place by the station like it's a study hack.",
    ]);

    queueScene([
      { speaker: "Narrator", text: `${dayNum} ${unit} until Christmas. ${classVariety.open}` },
      ...classVariety.middle,
      { speaker: "Mei", text: (function() {
        const loveTotal = (state.love.ryu || 0) + (state.love.haruto || 0) + (state.love.kaoru || 0);
        const base = [
          "Good morning! I didn't sleep—Tomo sent me a voice message reading poetry. Bad poetry. Adorable poetry.",
          "So, don't be mad—Tomo and I matched mittens. I know, cheesy. Warm, though.",
          "Lunch later? Unless Tomo surprises me again with 'mystery croquettes.' I can't live like this.",
          "If I start smiling in the middle of math, it's because Tomo texted me a snowman. With abs. Why.",
          "Tomo tried to teach me guitar. I learned exactly one chord and a blister.",
          "We watched snow from the platform. He counted trains; I counted smiles. We tied.",
          "Morning! Progress report—Operation Boyfriend by Christmas: how's the heart hunt?",
          "I brought you a good luck sticker. It's sparkly. Like your prospects.",
          "Did you practice your smile-in-the-hallway technique? It’s devastating. Use responsibly.",
          "If today were a romcom episode, I’d say meet-cute at 3:17 p.m. Be ready.",
          "I made you a pep talk: breathe, be brave, ask questions, say yes to cocoa.",
          "Your hair looks like ‘main character energy.’ The universe should take notes.",
          "I dreamed you high-fived destiny. Destiny blushed. No pressure.",
          "If anyone is silly about you today, let them. You deserve silly.",
          "Want me to accidentally-on-purpose drop a pencil near your crush? I have practice.",
          "You’re doing great. Even trying counts as romance cardio.",
          "Romantic weather today: 80% chance of smiles. Carry an umbrella of charm.",
          "I set a reminder: ‘Support Yui’s heart quest.’ It repeats hourly.",
          "We are not giving up, okay? We are collecting moments. And snacks.",
          "If your heart wobbles, text me. I’ll send gifs and emergency courage.",
          "Do you want a wingwoman this afternoon? I can be subtle. Or… glitter.",
          "Update me after school: ‘Yui vs. The Cute One.’ I’m cheering already.",
        ];
        const upbeat = [
          "Your glow today? Excuse me, main character. Did something good happen?",
          "Oh-ho! That smile says ‘plot advancement.’ Tell me everything later.",
          "You look like a crush happened near you. Or to you. Excellent.",
          "I can hear bells and we’re not even at Christmas yet. Suspicious.",
          "I love this for you. Keep going. Hearts are basically snowflakes with opinions.",
        ];
        const nudge = [
          "Quest check: any promising eyes across the room yesterday?",
          "Remember: ask about their interests. Then listen like it’s dessert.",
          "Small steps count. A hello is a beginning; beginnings are magic.",
          "Try the library, gym, or rooftop later. Different floors, different fates.",
          "Pick your lunch strategically. Favorites are basically love letters.",
        ];
        let pool = base.concat(nudge);
        if (loveTotal >= 6) pool = pool.concat(upbeat);
        if (loveTotal >= 12) {
          pool = pool.concat([
            "You’re doing it, Yui. I can tell. I’m proud of you.",
            "Your courage is showing. It looks gorgeous on you.",
            "I scheduled ‘happy dance’ for us on Christmas Eve. Advanced booking.",
          ]);
        }
        return pickOne(pool);
      })()},
      { speaker: "Yui", text: pickOne([
        "Happy for you. Still rolling my eyes, but with love.",
        "Cheese is a food group and a lifestyle. Live it.",
        "If he brings you croquettes, I’ll bring you self-control.",
        "Tell Tomo the snowman needs a scarf. And manners.",
        "One chord is how revolutions start.",
        "Counting smiles is valid science.",
      ])},
      { speaker: "Classmate", text: classGossip },
      { speaker: "Whisper", text: boyGossip },
      { speaker: "Teacher", text: classVariety.quiz },
    ], () => doTriviaAfterAnnounce(lunch));
  }

  function doTrivia() {
    const categories = ["architecture", "sports", "rock"];
    const cat = categories[Math.floor(state.rng() * categories.length)];
    const bank = trivia[cat];
    const item = bank[Math.floor(state.rng() * bank.length)];
    showChoice({
      title: `Trivia (${titleCase(cat)}): ${item.q}`,
      options: shuffle([...item.options], state.rng),
      onChoose: (choice) => {
        const correct = choice === item.answer;
        if (correct) {
          if (cat === "architecture") state.love.haruto += 1;
          if (cat === "sports") state.love.ryu += 1;
          if (cat === "rock") state.love.kaoru += 1;
          state.stats.quizzes.correct += 1;
        }
        state.stats.quizzes.total += 1;
        saveState();
        // Keep dev panel in sync as stats/love update
        refreshHUD();

        // Sarcastic/witty teacher reactions
        const teacherCorrect = [
          "Correct. I’ll alert the Nobel committee about your single neuron doing laps.",
          "You got it right. Please try not to strain your back from carrying the class.",
          "Accurate. Don’t let it go to your head; there’s limited storage up there.",
          "Huh. Competence. In my classroom. How novel.",
          "Yes. Even a stopped clock is right twice a day. You’re at one.",
          "Correct. Frame it. It might never happen again.",
          "Right answer, wrong attitude. I’ll allow it.",
          "You’re right. I suppose miracles still come in weekday editions.",
          "Correct. Don’t clap—your brain needs both hands for balance.",
          "Yes. I’ll add “occasionally functional” to your report.",
          "You got it. I’ll schedule a parade. Budget: a sticker and a sigh.",
          "Impressive. I’ll pretend I didn’t see you guess.",
          "Correct. Please keep this up; my expectations get lonely.",
          "Right. Try not to look so surprised—I can see it from here.",
          "Valid answer. Accidentally stylish, too.",
          "Correct. The bar is low, but you cleared it without tripping.",
          "Approved. Even your desk looks proud. Calm it down.",
          "That’s right. I’ll write you a tiny sonnet in my head. Done.",
          "Correct. Tell your future biographer this was your turning point.",
          "Yes. Update your resume: “Knows at least one thing.”",
          "Right. I’ll downgrade my sarcasm by 2%. Don’t squander it.",
          "Correct. The chalk just applauded in powder form."
        ];
        const teacherIncorrect = [
          "No. Bold of you to be that confident and that wrong.",
          "Incorrect. Your answer took the scenic route to nowhere.",
          "Not quite. The target was over there; you waved at a lamppost.",
          "Wrong. But at least you committed. To the wrong thing.",
          "No. Your brain buffer overflowed. Try a reboot.",
          "Incorrect. That’s a fascinating choice. In an alternate universe.",
          "Not it. The idea was good; the execution tripped over its shoelaces.",
          "Wrong. The hint was in the question. The question is offended.",
          "No. Thank you for your contribution to the museum of attempts.",
          "Incorrect. I admire the confidence. I do not admire the result.",
          "Not quite. You missed by a romantic distance.",
          "Nope. But the journey looked dramatic.",
          "Wrong. Please return that answer to the wild; it doesn’t belong here.",
          "No. That was a creative writing prompt, not a fact.",
          "Incorrect. If it makes you feel better, it doesn’t. At all.",
          "Not it. Your guess and the truth are not currently on speaking terms.",
          "Wrong. The class collectively sighed in iambic pentameter.",
          "No. Consider asking your neurons to form a committee.",
          "Incorrect. But the courage was adorable.",
          "Not correct. The chalk tried to jump off the tray to avoid hearing that.",
          "Wrong. The bell would like to distance itself from your answer.",
          "No. I’ll grade that as “ambitious fiction.”"
        ];

        const classReact = correct
          ? pickOne([
              "Nice! A soft wave of approval rolls through the room.",
              "A couple of classmates clap. You grin without meaning to.",
              "Someone whispers, \"Knew it,\" like a tiny fanfare.",
              "You catch a thumbs-up from across the aisle.",
              "A desk-tap drumroll breaks out. You bow like a tiny monarch.",
              "Your neighbor scribbles ‘nice’ on a sticky note and sticks it to your elbow.",
              "A muffled ‘let’s gooo’ escapes from the back row.",
              "Someone pumps a fist so small it could fit in a teacup.",
              "A pencil snaps in triumph. Its sacrifice will be remembered.",
              "You get a quiet nod from three directions at once. Constellation unlocked.",
              "A chorus of very dignified ‘mm’ noises approves.",
              "A friend mouths ‘genius’ like a secret spell.",
              "Notebook margins acquire celebratory confetti doodles.",
              "A chair squeaks what might be applause. Or jealousy.",
              "Your name gets underlined in someone else’s notes. Twice.",
            ])
          : pickOne([
              "Close, but the bell is kinder than the quiz.",
              "A sympathetic groan ripples; you shrug it off.",
              "You chuckle. The ceiling is very interesting right now.",
              "Pencils scrape; you promise yourself a comeback tomorrow.",
              "Paper rustles like a polite ‘oof.’",
              "Someone slides a candy toward you without eye contact. Solidarity.",
              "Your neighbor tilts their notes your way—accidentally on purpose.",
              "A tiny ‘you got this’ drifts from the next desk over.",
              "A brave slow clap begins and dies after one clap. Respect.",
              "A cough disguises a giggle; both mean well.",
              "You receive a pity sticker shaped like a star. It still shines.",
              "A friend writes ‘next one’ on your palm. It tingles like hope.",
              "The room collectively adjusts glasses of resolve.",
              "A rubber eraser nods at you from the margin battlefield.",
              "You trade a grimace for a grin with a classmate. Deal accepted.",
            ]);

        // After trivia feedback, move into lunch with class + teacher quips
        queueScene([
          { speaker: "Class", text: classReact },
          { speaker: "Teacher", text: correct ? pickOne(teacherCorrect) : pickOne(teacherIncorrect) },
          { speaker: "Narrator", text: `Lunch update: Today's temptation seems to be ${state.nextLunch ?? "Melon-pan"}. The cafeteria line looks like a pilgrimage.` },
          { speaker: "System", text: "Choose lunch?" },
        ], () => lunchChoice(state.nextLunch || "Melon-pan"));
      }
    });
  }

  // Helper to trigger trivia first, then lunch using the pre-picked lunch of the day
  function doTriviaAfterAnnounce(lunch) {
    // stash lunch so doTrivia can reference it afterward
    state.nextLunch = lunch;
    // announce the quiz now
    queueScene([
      { speaker: "Teacher", text: pickClassroomLines(state.day).quiz }
    ], () => doTrivia());
  }

  // Lunchtime mini-choice that can nudge affection
  function lunchChoice(lunch) {
    // Pool of all lunches
    const all = [
      { label: "Melon-pan", value: "Melon-pan" },
      { label: "Curry", value: "Curry" },
      { label: "Udon", value: "Udon" },
      { label: "Gyoza", value: "Gyoza" },
      { label: "Ramen", value: "Ramen" },
    ];
    // Randomize daily selection: choose 2 random plus guarantee the daily special
    const shuffled = shuffle(all, state.rng);
    // Ensure the daily special is present
    const special = all.find(o => o.value === lunch);
    // Take first 2 from shuffled that are not the special
    const picks = [];
    for (const o of shuffled) {
      if (o.value === lunch) continue;
      picks.push(o);
      if (picks.length === 2) break;
    }
    const options = shuffle([special, ...picks], state.rng);

    showChoice({
      title: `Cafeteria special today looks like ${lunch}. What do you pick?`,
      options,
      onChoose: (choice) => {
        // Affection nudges based on favorites (+2 if choosing today's special)
        const isSpecial = choice === lunch;
        if (choice === "Melon-pan") state.love.ryu += isSpecial ? 2 : 1;
        if (choice === "Udon") state.love.haruto += isSpecial ? 2 : 1;
        if (choice === "Curry") state.love.kaoru += isSpecial ? 2 : 1;
        // Track lunch choice
        state.stats.lunches[choice] = (state.stats.lunches[choice] || 0) + 1;
        saveState();
        // Keep dev panel in sync after lunch updates
        refreshHUD();
        // Small flavor scene after choosing lunch
        const lines = [
          { speaker: "Narrator", text: pickOne([
            "You find a sunny spot near the window. Steam fogs the glass in friendly shapes.",
            "You sit by the heater; lunch tastes better when fingertips thaw.",
            "Someone laughs at another table; you smile into your tray without meaning to.",
            "Warm broth turns your hands into small suns.",
            "The first bite is comfort disguised as steam.",
            "A friendly clatter of trays becomes percussion for your mood.",
            "You discover the perfect seat: sunlight, zero draft, maximum flavor.",
            "Chopsticks tap once—tiny drumroll—for a good meal.",
          ])},
          { speaker: "Yui", text: pickOne([
            "Okay, this was the right call.",
            "Simple joys, loud flavor.",
            "Fuel acquired. Heart: optimistic.",
            "Oh, that hit the soul. Again.",
            "I could write poetry about this. I won’t. Maybe.",
            "Delicious. I forgive winter a little.",
            "Ten out of ten—would date this lunch.",
            "My taste buds are applauding politely and I respect that.",
            "Comfort level: unlocked. Next level: seconds?",
            "This is exactly the flavor my day needed.",
          ])},
        ];
        queueScene(lines, () => {
          // After lunch, continue the day (no more trivia here)
          queueScene([
            { speaker: "Narrator", text: pickOne([
              "Afternoon drifts in like a warm breeze from the heater.",
              "You crumple your lunch wrap and stretch. Time keeps going.",
              "The bell hints at classes, but your mind is elsewhere.",
              "You tidy your tray and feel a small, satisfied glow.",
            ])}
          ], () => {
            // Move along to after-school choice
            queueScene([
              { speaker: "Narrator", text: pickOne([
                "School ends with a stretch and a yawn. Where do you wander?",
                "The final bell drifts like snow. Where next?",
                "Backpacks zip. The hallway hums. Where do your steps lead?",
                "Freedom jingles like keys. Library, gym, or rooftop?",
                "Chairs scrape and plans unfold. Where does yours begin?",
                "The clock blinks freedom o’clock. Choose your adventure.",
                "Winter air waits past the doors like a fresh page.",
                "Notes tuck into bags; hopes peek out the zippers.",
                "The corridor breathes out the day. What will you breathe in?",
                "Shoes squeak a little song toward whatever comes next.",
                "The loudspeaker sighs off. Your thoughts get louder—in a good way.",
                "You catch a window of sunset and a window of time. Which do you chase?",
                "Your phone buzzes. You ignore it. Heart first, notifications later.",
                "You tie your scarf like a promise and check which way the wind points.",
                "Homework can wait one scene. Where does the plot want you?",
                "A gust sneaks in when the doors open. It smells like choices.",
                "Your reflection in the glass nods at you. Lead on.",
                "The day closes its book. You open a new chapter.",
                "Stairs or elevator? Slow or swift? Rooftop or quiet?",
                "Someone laughs down the hall; it sounds like an invitation.",
                "The vending machine hums approval as you pass. Dramatic.",
                "You pocket a pen like a talisman and pick a path.",
                "Your feet decide first; your heart catches up smiling.",
                "Afternoon light paints arrows on the floor. Follow one.",
                "You adjust your bag strap. Confidence: acceptable. Direction: pending.",
                "Doors swing wide. So does your attention.",
                "You press the exit bar; the day clicks into possibility.",
                "The bell’s echo lingers, pointing at places you like.",
                "You trace a route on an imaginary map. X marks…?",
                "Your breath fogs the window as you choose your next scene.",
              ]) }
            ], () => afterSchoolChoice());
          });
        });
      }
    });
  }

  function afterSchoolChoice() {
    showChoice({
      title: "After school—where do you go?",
      options: [
        { label: "Library", value: "library" },
        { label: "Gym", value: "gym" },
        { label: "Rooftop", value: "rooftop" },
      ],
      onChoose: (res) => {
        if (typeof res === "string") {
          // label-only mode
          res = res.toLowerCase();
        } else if (res && res.value) {
          res = res.value;
        }
        if (res === "library") {
          state.love.haruto += 1; // reduced to +1
          saveState();
          refreshHUD();
          sceneHaruto();
        } else if (res === "gym") {
          state.love.ryu += 1; // reduced to +1
          saveState();
          refreshHUD();
          sceneRyu();
        } else {
          state.love.kaoru += 1; // reduced to +1
          saveState();
          refreshHUD();
          sceneKaoru();
        }
      }
    });
  }

  // Determine next tier to show for a boy: lowest unviewed tier within unlocked range
  function nextTierToShow(key, love) {
    const unlocked = loveTier(love);
    const seenUpTo = state.progress[key] ?? -1;
    if (seenUpTo + 1 <= unlocked) return seenUpTo + 1;
    return unlocked;
  }

  function sceneRyu() {
    showBackgroundFor("gym");
    showOnly("ryu");
    const tier = nextTierToShow("ryu", state.love.ryu);
    const s = (function() {
      // force tier mapping by temporarily reusing the bank selector
      const banks = ryuScenarios(0); // we will not use this; just to satisfy linter
      // We already have ryuScenarios mapping love->tier; instead, we select by tier manually:
      const map = {
        get: function(t) { return ryuScenariosByTier(t); }
      };
      return ryuScenariosByTier(tier);
    })();
    queueScene(s, () => {
      state.progress.ryu = Math.max(state.progress.ryu, tier);
      saveState();
      refreshHUD();
      endOfDay();
    });
  }

  function sceneHaruto() {
    showBackgroundFor("library");
    showOnly("haruto");
    const tier = nextTierToShow("haruto", state.love.haruto);
    const s = harutoScenariosByTier(tier);
    queueScene(s, () => {
      state.progress.haruto = Math.max(state.progress.haruto, tier);
      saveState();
      refreshHUD();
      endOfDay();
    });
  }

  function sceneKaoru() {
    showBackgroundFor("rooftop");
    showOnly("kaoru");
    const tier = nextTierToShow("kaoru", state.love.kaoru);
    const s = kaoruScenariosByTier(tier);
    queueScene(s, () => {
      state.progress.kaoru = Math.max(state.progress.kaoru, tier);
      saveState();
      refreshHUD();
      endOfDay();
    });
  }

  function endOfDay() {
    // Daily reflection at home: bg_home, no characters, 4-7 lines
    showBackgroundFor("home");
    showOnly(); // hide characters

    const love = state.love || { ryu: 0, haruto: 0, kaoru: 0 };

    // Generic opening/closing pools
    const opens = [
      "Home. Quiet wraps around the room like a warm scarf.",
      "Back home. The door clicks behind me; thoughts keep walking.",
      "Shoes off. Day set down gently on the shelf by the keys.",
      "The heater purrs; the window reflects a very thoughtful me.",
      "I press my cheeks with cold hands until the blush calms down.",
      "My room smells like paper and peppermint. Maybe hope, too.",
      "Lamp on. Heart doing a little post-credits scene."
    ];
    const middlesGeneral = [
      "Did I make space for kindness today?",
      "Tiny braveries add up. I felt a few.",
      "I’m learning that attention is a love language.",
      "Note to self: listen first, then smile.",
      "Tomorrow: show up, even if quietly.",
      "Progress counts, even if it’s just a step and a grin.",
      "Collecting good moments like bus tickets in a pocket."
    ];
    const closes = [
      "Okay, Yui. Sleep. Tomorrow can have the next draft.",
      "I’ll set my courage by the alarm. Wake up together.",
      "Deep breath. I’m closer than yesterday.",
      "Pillow pact: rest now, sparkle later.",
      "The city hums outside. My heart hums back.",
      "Lights off. Hope on low power mode.",
      "Goodnight, almost-Christmas."
    ];

    // Per-boy reflection snippets at low/med/high interest
    function boySnippets(key, v) {
      const low = {
        ryu: [
          "Ryu’s focus is a little contagious. Maybe I caught a tiny bit.",
          "He keeps showing up to the gym. I keep noticing.",
          "I like the way determination looks on him."
        ],
        haruto: [
          "Haruto’s quiet felt steady today.",
          "He measures light like it matters. I think it does.",
          "I like who I am when we talk slowly."
        ],
        kaoru: [
          "Kaoru’s edges have soft places. He tries, even when it’s messy.",
          "He jokes with the wind and I laugh anyway.",
          "There’s a melody in the silence after he speaks."
        ],
      };
      const mid = {
        ryu: [
          "With Ryu, even the air has a pace I want to match.",
          "His grin after a good run… dangerously effective.",
          "He makes effort look like a love letter to tomorrow."
        ],
        haruto: [
          "Haruto set a chair at the perfect angle and somehow it was for me.",
          "His care with details makes my chest feel organized.",
          "We spoke softly and it sounded like plans."
        ],
        kaoru: [
          "Kaoru pretends not to care, then remembers to care twice as hard.",
          "He let me hold the rhythm for a second. It fit.",
          "That look he does—defiant, then shy—keeps replaying."
        ],
      };
      const high = {
        ryu: [
          "I want to be at Ryu’s finish lines—and his starting ones.",
          "When he runs, my thoughts sprint toward him and don’t get tired.",
          "I’m not afraid of his future. I want to map it with him."
        ],
        haruto: [
          "I can see the house Haruto will build—light, tea, room for us.",
          "He says ‘slow’ like a promise. I believe him.",
          "If courage were a floor plan, he drew one for me today."
        ],
        kaoru: [
          "Kaoru’s storm has weather reports now. I like reading them together.",
          "I think his songs already have my name in the margins.",
          "He asked me to stay. My answer is becoming a habit."
        ],
      };

      if (v >= 12) return high[key];
      if (v >= 5) return mid[key];
      return low[key];
    }

    // Build reflective lines
    const lines = [];
    lines.push({ speaker: "Narrator", text: pickOne(opens) });

    // Add up to 3 boy reflections if love > 0, in descending order
    const entries = [
      { key: "ryu", v: love.ryu },
      { key: "haruto", v: love.haruto },
      { key: "kaoru", v: love.kaoru },
    ].filter(e => e.v > 0)
     .sort((a, b) => b.v - a.v || orderIndex(a.key) - orderIndex(b.key));

    if (entries.length === 0) {
      lines.push({ speaker: "Yui", text: pickOne(middlesGeneral) });
      lines.push({ speaker: "Yui", text: pickOne(middlesGeneral) });
    } else {
      for (const e of entries.slice(0, 3)) {
        const pool = boySnippets(e.key, e.v);
        lines.push({ speaker: "Yui", text: pickOne(pool) });
      }
      // Fill to keep variety (target 4-7 total lines)
      const need = Math.max(0, 4 - lines.length);
      for (let i = 0; i < need; i++) {
        lines.push({ speaker: "Yui", text: pickOne(middlesGeneral) });
      }
    }

    // Close
    lines.push({ speaker: "Yui", text: pickOne(closes) });

    // After reflection, decrement day and decide whether to start next day or end
    queueScene(lines, () => {
      state.day -= 1;
      saveState();
      refreshHUD();
      syncDevPanel();
      if (state.day <= 0) {
        checkEnding(true);
      } else {
        startDay();
      }
    });
  }

  function checkEnding(showFinalScene) {
    // Determine winner: threshold depends on Hard Mode
    const threshold = state.hard ? 29 : 20;
    const scores = [
      { key: "ryu", v: state.love.ryu },
      { key: "haruto", v: state.love.haruto },
      { key: "kaoru", v: state.love.kaoru },
    ];
    const eligible = scores.filter(s => s.v >= threshold);
    let winner = null;
    if (eligible.length > 0) {
      // Highest wins; tie-break Ryu > Haruto > Kaoru
      eligible.sort((a, b) => b.v - a.v || orderIndex(a.key) - orderIndex(b.key));
      winner = eligible[0].key;
    }

    if (!showFinalScene) return winner;

    // Helper to show credits, then replay
    const showCreditsThenReplay = () => {
      showBackgroundFor("home"); // cozy backdrop for credits
      showOnly(); // hide characters
      // Present credits, then prompt with a single Return to Title action
      queueScene([
        { speaker: "System", text: "CREDITS" },
        { speaker: "Director", text: "Curtis" },
        { speaker: "Programmer", text: "Cosine" },
        { speaker: "Musician", text: "Suno" },
        { speaker: "Artist", text: "Midjourney" },
        { speaker: "Special Thanks", text: "You — for playing!" },
        { speaker: "System", text: "Return to Title?" }
      ], () => {
        showChoice({
          title: "Return to Title",
          options: [
            { label: "Return to Title", value: "title" }
          ],
          onChoose: () => {
            // Hard reset to ensure a fully fresh start
            try {
              localStorage.removeItem("xmas14_state");
            } catch (e) {}
            window.location.reload();
          }
        });
      });
    };

    // Helper to show replay button at the end
    const addReplay = () => {
      // After THE END, roll credits first
      showCreditsThenReplay();
    };

    // If hard mode and eligible -> show long-form secret ending
    if (winner && state.hard) {
      showBackgroundFor("christmas");
      audioStop("bg");
      audioPlayLoop("christmas");
      applyCharacterArtVariant("christmas");
      showOnly(winner);
      const name = titleCase(winner);

      if (winner === "ryu") {
        // Ryu secret ending (long form)
        const lines = [
          { speaker: "Narrator", text: "Christmas Eve breathes quietly. The plaza lights flicker like hushes. Your hands are warm inside your pockets." },
          { speaker: "Ryu", text: "Hey." },
          { speaker: "Yui", text: "Hey." },
          { speaker: "Narrator", text: "You pass him the gift: a pair of running gloves that look like morning." },
          { speaker: "Ryu", text: "These are perfect. I, uh… I’ve been thinking." },
          { speaker: "Yui", text: "Thinking is trending tonight." },
          { speaker: "Ryu", text: "It’s weird to say this after two weeks, but I want to be honest." },
          { speaker: "Yui", text: "Try me." },
          { speaker: "Ryu", text: "I really want to run. Not just school track. I want to see how far I can go. Times that make my coach forget his whistle. Races that make my lungs feel like fireworks." },
          { speaker: "Yui", text: "I can see it. You at the starting line. Me yelling too loud." },
          { speaker: "Ryu", text: "But… my family isn’t… rich. I mean, we’re fine, but not really. University feels like a wall that charges admission just to look at it." },
          { speaker: "Ryu", text: "And I’ve got two little brothers. I pick them up after school most days. Make noodles. Do dishes. Sometimes dad’s shifts don’t end when they’re supposed to." },
          { speaker: "Yui", text: "You’ve been carrying a lot of weight. No wonder you’re strong." },
          { speaker: "Ryu", text: "Sometimes I feel strong. Sometimes I just feel tired. Everyone talks like university is the default. Or like I should be grateful for any offer and stop asking questions." },
          { speaker: "Yui", text: "What do you want if no one is watching?" },
          { speaker: "Ryu", text: "To run. To get faster. To find a team that wants me for the way I don’t quit. To send money home if I can. To make my brothers think the world opens if you keep moving." },
          { speaker: "Yui", text: "That sounds like a map. Not a mess." },
          { speaker: "Ryu", text: "I worry I’m being selfish. Like I’m sprinting ahead while my family walks." },
          { speaker: "Yui", text: "What if sprinting ahead is how you make a path they can follow?" },
          { speaker: "Ryu", text: "Maybe. It just feels sudden to say all of this out loud. We’ve… what… known each other two weeks?" },
          { speaker: "Yui", text: "Fourteen days. A very diligent number." },
          { speaker: "Ryu", text: "And here I am, dumping my head on you like a gym bag." },
          { speaker: "Yui", text: "It’s a good bag. And I’m… happy. That you trust me with what’s inside." },
          { speaker: "Ryu", text: "You’re happy?" },
          { speaker: "Yui", text: "Shy, but yes. Really happy." },
          { speaker: "Narrator", text: "He exhales, a laugh tangled in relief." },
          { speaker: "Ryu", text: "I like that you don’t flinch when I say the big parts." },
          { speaker: "Yui", text: "I like that you have big parts to say." },
          { speaker: "Ryu", text: "If I try for a program, I’ll miss some dinners at home. If I work after school, I’ll miss some practices. If I take a year to focus on running, people will say I’m wasting time." },
          { speaker: "Yui", text: "People love to narrate other people’s lives. We get to write ours." },
          { speaker: "Ryu", text: "Would you still… be there? If I’m not always around? If I’m tired and cranky and busy being a brother and a runner and a kid trying not to screw up?" },
          { speaker: "Yui", text: "I’ll bring melon-pan and a sign that says ‘Ryu, you’re allowed to be human.’" },
          { speaker: "Ryu", text: "Carbs for courage." },
          { speaker: "Yui", text: "Exactly." },
          { speaker: "Ryu", text: "I keep thinking about my brothers at the finish line. I want them to see me choosing something hard and true." },
          { speaker: "Yui", text: "Then choose it. We’ll figure out the money, the timing, the dinners. We’ll call your dad on the late nights. We’ll teach the twins to boil noodles without burning the pot." },
          { speaker: "Ryu", text: "They will absolutely burn a pot." },
          { speaker: "Yui", text: "Then we’ll buy another. Pots are replaceable. Your dream isn’t." },
          { speaker: "Ryu", text: "You make the air warmer when you talk like that." },
          { speaker: "Yui", text: "I packed a portable heater in my voice for emergencies." },
          { speaker: "Ryu", text: "I’m… grateful. And still nervous." },
          { speaker: "Yui", text: "Me too. I don’t know everything. But I know I want to support you—no matter what path you pick." },
          { speaker: "Ryu", text: "Then… can we…?" },
          { speaker: "Narrator", text: "He looks at your hands. You offer yours. His palm is warm, a little calloused from the track and from dishes." },
          { speaker: "Yui", text: "We’ll hold on. That’s the plan." },
          { speaker: "Ryu", text: "We will. Even if I trip sometimes." },
          { speaker: "Yui", text: "I’ll help you up. You’ll do the same for me." },
          { speaker: "Ryu", text: "Deal." },
          { speaker: "Narrator", text: "The tree lights blink like a quiet countdown to a kinder year." },
          { speaker: "System", text: "THE END, Merry Christmas and thank you so much for playing!" },
        ];
        queueScene(lines, addReplay);
        return;
      }

      if (winner === "haruto") {
        // Haruto secret ending (long form)
        const lines = [
          { speaker: "Narrator", text: "Christmas Eve gathers itself into soft light and careful shadows. The plaza hums like a held breath." },
          { speaker: "Haruto", text: "You’re here." },
          { speaker: "Yui", text: "I promised." },
          { speaker: "Narrator", text: `You give him ${gifts.haruto}. His fingers turn it like a gentle idea.` },
          { speaker: "Haruto", text: "Thank you. It feels… seen." },
          { speaker: "Yui", text: "How do you feel?" },
          { speaker: "Haruto", text: "Like a blueprint that wants to be a building and is afraid of wind." },
          { speaker: "Yui", text: "What does the wind say?" },
          { speaker: "Haruto", text: "‘Be a doctor. Be useful. Be your parents’ hope neatly folded.’" },
          { speaker: "Haruto", text: "My brother is the best son. He was always obedient. The clinic has his footprints all over it. If I walk a different way… I worry I’m walking wrong." },
          { speaker: "Yui", text: "Is it okay to be selfish sometimes?" },
          { speaker: "Haruto", text: "I don’t know." },
          { speaker: "Yui", text: "What do you want?" },
          { speaker: "Haruto", text: "I don’t know." },
          { speaker: "Narrator", text: "He watches the fountain lights repeat themselves in little loops. You watch him search for a word that refuses to be shy." },
          { speaker: "Yui", text: "It doesn’t have to be tonight. We have time." },
          { speaker: "Haruto", text: "Time?" },
          { speaker: "Yui", text: "We’re young. Answers can arrive like trains: not always on schedule, but often enough to get somewhere." },
          { speaker: "Haruto", text: "I like that." },
          { speaker: "Yui", text: "Meanwhile, what do your hands want to do?" },
          { speaker: "Haruto", text: "Draw. Place a window so morning knows where to knock. Argue with a staircase until it forgives me. Make a bench that lets someone breathe again." },
          { speaker: "Yui", text: "That sounds like medicine made of wood and light." },
          { speaker: "Haruto", text: "I keep thinking that. But I’m not brave enough to declare it." },
          { speaker: "Yui", text: "You don’t have to declare. You can try. With me. We’ll make tea; we’ll sketch; we’ll talk to your parents slowly. We’ll let the future overhear us." },
          { speaker: "Haruto", text: "My brother will say I’m selfish." },
          { speaker: "Yui", text: "He might. Or he might be relieved you stopped pretending to be him." },
          { speaker: "Haruto", text: "I’ve practiced being quiet for so long." },
          { speaker: "Yui", text: "Then let quiet be your style, not your cage." },
          { speaker: "Haruto", text: "And you’ll… stay?" },
          { speaker: "Yui", text: "I’ll stay. Even when you erase lines for the fifth time." },
          { speaker: "Haruto", text: "Sixth, sometimes." },
          { speaker: "Yui", text: "Sixth. I’ll still stay." },
          { speaker: "Narrator", text: "He smiles in the careful way you’ve learned to love." },
          { speaker: "Haruto", text: "We can be uncertain together, then." },
          { speaker: "Yui", text: "Uncertainty partners: certified." },
          { speaker: "Narrator", text: "You both lean in until your foreheads meet, like two blueprints lining up." },
          { speaker: "Haruto", text: "We’ll find the answers." },
          { speaker: "Yui", text: "Together. Slowly is allowed." },
          { speaker: "Haruto", text: "Slowly is good." },
          { speaker: "Narrator", text: "Snow arranges itself into small approvals around your shoes." },
          { speaker: "System", text: "THE END, Merry Christmas and thank you so much for playing!" },
        ];
        queueScene(lines, addReplay);
        return;
      }

      // Kaoru secret ending (long form)
      const lines = [
        { speaker: "Narrator", text: "Christmas Eve leans on the railing of the sky. The city hums in a warm minor key." },
        { speaker: "Kaoru", text: "You made it. I was pretending I wouldn’t wait. I waited." },
        { speaker: "Yui", text: "I like you better honest." },
        { speaker: "Narrator", text: `You hand him ${gifts.kaoru}. He turns the strings like he’s tuning a thought.` },
        { speaker: "Kaoru", text: "These feel like promises." },
        { speaker: "Yui", text: "Only if we keep them." },
        { speaker: "Kaoru", text: "I’ve been enjoying… getting to know you. A lot. It’s fast. It still feels right. Don’t quote me." },
        { speaker: "Yui", text: "‘Feels right,’ —Kaoru, tonight." },
        { speaker: "Kaoru", text: "Rude." },
        { speaker: "Yui", text: "Correct." },
        { speaker: "Kaoru", text: "I want to be better. Since you. Graduate. Then music. Really try. Not just roof concerts for pigeons and bored angels." },
        { speaker: "Yui", text: "Why music?" },
        { speaker: "Kaoru", text: "My uncle. He raised me after… my parents. He works too much. He’s good. He has dangerous taste in music—dangerously good." },
        { speaker: "Yui", text: "A good guardian. With good playlists." },
        { speaker: "Kaoru", text: "Yeah. He’d put on old records on Sunday mornings. The apartment smelled like toast and something almost like family. I want to make… that feeling. With noise." },
        { speaker: "Yui", text: "That’s not noise. That’s home." },
        { speaker: "Kaoru", text: "Sometimes I’m a jerk. I know. People say it. I hear it first." },
        { speaker: "Yui", text: "Never change." },
        { speaker: "Kaoru", text: "Excuse me?" },
        { speaker: "Yui", text: "Be you. But be better you. The one who apologizes faster. Studies longer. Writes louder." },
        { speaker: "Kaoru", text: "I can do that. I want to. For me first. Also—fine—for you." },
        { speaker: "Yui", text: "I’ll take the ‘also.’" },
        { speaker: "Kaoru", text: "Will you help me graduate without setting the library on fire?" },
        { speaker: "Yui", text: "We’ll make flashcards. They won’t even scorch." },
        { speaker: "Kaoru", text: "And then… music. Real stages. Maybe a small one next to a coffee machine. I don’t care. I want to earn it." },
        { speaker: "Yui", text: "Why not start now?" },
        { speaker: "Kaoru", text: "Now now?" },
        { speaker: "Yui", text: "Love song. Together. Draft one: ‘Rooftops taste like December.’" },
        { speaker: "Kaoru", text: "‘And you taste like victory curry.’" },
        { speaker: "Yui", text: "Terrible. Keep it." },
        { speaker: "Kaoru", text: "Okay, producer. Verse two: ‘I found a chorus in your laugh.’" },
        { speaker: "Yui", text: "Better. Pre-chorus: ‘Stay a little.’" },
        { speaker: "Kaoru", text: "Hook: ‘Always.’" },
        { speaker: "Narrator", text: "You scribble lines on your phone. He hums. The plaza becomes a practice room that knows your names." },
        { speaker: "Kaoru", text: "I’m still going to mess up." },
        { speaker: "Yui", text: "I’ll boo you gently. Then clap harder." },
        { speaker: "Kaoru", text: "Deal. And… thank you. For seeing past the storm." },
        { speaker: "Yui", text: "You’re not a storm. You’re weather. Weather changes." },
        { speaker: "Kaoru", text: "Poet." },
        { speaker: "Yui", text: "Guitar boy." },
        { speaker: "Kaoru", text: "We’re a band, then." },
        { speaker: "Yui", text: "We’re a band." },
        { speaker: "Narrator", text: "He offers his hand. You take it. The chord resolves into something you want to hear again and again." },
        { speaker: "System", text: "THE END, Merry Christmas and thank you so much for playing!" },
      ];
      queueScene(lines, addReplay);
      return;
    }

    if (winner) {
      // Date scene - expanded per boy with conditional variants (normal endings)
      showBackgroundFor("christmas");
      // swap bg music for christmas loop during endings
      audioStop("bg");
      audioPlayLoop("christmas");
      // ensure christmas variants are applied then show only the winner
      applyCharacterArtVariant("christmas");
      showOnly(winner);
      const name = titleCase(winner);

      // Helper: pick most-chosen lunch
      const lunchCounts = state.stats?.lunches || {};
      const lunchOrder = ["Melon-pan","Udon","Curry","Gyoza","Ramen"];
      let favLunch = "Melon-pan";
      let maxCount = -1;
      for (const k of lunchOrder) {
        const v = Number(lunchCounts[k]) || 0;
        if (v > maxCount) { maxCount = v; favLunch = k; }
      }
      const quizTotal = state.stats?.quizzes?.total || 0;
      const quizCorrect = state.stats?.quizzes?.correct || 0;
      const quizRate = quizTotal > 0 ? quizCorrect / quizTotal : 0;

      if (winner === "haruto") {
        // Variant line based on quizzes and lunches
        const quizLine = quizRate >= 0.7
          ? { speaker: "Yui", text: "Also, my quiz stats were decent this month. I can present your case like a pro." }
          : { speaker: "Yui", text: "I may not ace every quiz, but I’m great at honest conversations. I’ll help you with your parents." };
        const lunchLine = favLunch === "Udon"
          ? { speaker: name, text: "We’ll brief over udon tomorrow? It helps me think straight." }
          : { speaker: name, text: "Tomorrow—tea and a plan. I’ll bring snacks." };

        queueScene([
          { speaker: "Narrator", text: "Christmas Eve. The city tree glows like patient constellations woven through branches." },
          { speaker: name, text: "You came." },
          { speaker: "Yui", text: "Wouldn’t miss it." },
          { speaker: "Narrator", text: `You hand over ${gifts[winner]}. In the lights, his careful hands look tender.` },
          { speaker: name, text: "I’m… really happy. And also thinking too much." },
          { speaker: "Yui", text: "Thinking is allowed. Tonight too." },
          { speaker: name, text: "I want to study architecture. But my parents… the family clinic needs a doctor." },
          { speaker: "Yui", text: "What does Haruto need?" },
          { speaker: name, text: "To build spaces that help people breathe easier. Is that selfish?" },
          { speaker: "Yui", text: "It sounds like making a bigger clinic—made of sunlight and benches." },
          { speaker: name, text: "You make it sound possible." },
          { speaker: "Yui", text: "It is. We’ll draw a plan. Tea, honesty, a conversation with your parents. Slowly." },
          { speaker: name, text: "They’ll say I’m running from responsibility." },
          { speaker: "Yui", text: "You’re walking toward the right one. Bring your portfolio. Show them how design heals, too." },
          { speaker: name, text: "If I fail?" },
          { speaker: "Yui", text: "Then we iterate. Bridges don’t stand on the first draft." },
          { speaker: name, text: "Will you… stand with me when I talk to them?" },
          { speaker: "Yui", text: "Yes. I’ll pour tea and guard the silences." },
          { speaker: name, text: "I’ve never wanted something this much." },
          { speaker: "Yui", text: "Wanting is the foundation. We’ll build up from there." },
          { speaker: name, text: "I drew a house once with a kitchen facing east so mornings felt kinder." },
          { speaker: "Yui", text: "Put a table there for tea rings. And a shelf for model kits." },
          { speaker: name, text: "And a window for the first snow." },
          { speaker: "Yui", text: "And a door that opens easily when you come home tired." },
          quizLine,
          lunchLine,
          { speaker: "Narrator", text: "Snow hushes the plaza. Under the tree, your future traces careful lines toward morning." },
          { speaker: "System", text: "THE END" },
        ], addReplay);
      } else if (winner === "ryu") {
        const lunchLine = favLunch === "Melon-pan"
          ? { speaker: name, text: "We’ll plan over melon-pan tomorrow. Carbs for courage." }
          : { speaker: name, text: "We’ll plan tomorrow. I’ll bring snacks; you bring that smile." };
        const quizLine = quizRate >= 0.7
          ? { speaker: "Yui", text: "And I’ll make a spreadsheet. Don’t laugh—it’ll help." }
          : { speaker: "Yui", text: "We can just list ideas on sticky notes and pick the ones that feel right." };

        queueScene([
          { speaker: "Narrator", text: "Christmas Eve. The plaza hums like a stadium between songs." },
          { speaker: name, text: "You made it. Coach would say that’s good timing." },
          { speaker: "Yui", text: "Coach is right for once." },
          { speaker: "Narrator", text: `You hand over ${gifts[winner]}. He laughs, a little too proud, a lot relieved.` },
          { speaker: name, text: "So… scouts. And also university applications. And also… you." },
          { speaker: "Yui", text: "Pick any two tonight. We’ll save the rest for breakfast." },
          { speaker: name, text: "You, obviously. Then… I don’t know if I want to chase tracks or lectures." },
          { speaker: "Yui", text: "Both have finish lines. Which one makes you want to start?" },
          { speaker: name, text: "Running does. But part of me wants to be more than ‘fast.’" },
          { speaker: "Yui", text: "You’re already more. You can try a program with a team. Or take a year to run and learn. We’ll test, measure, adjust." },
          { speaker: name, text: "Like training cycles." },
          { speaker: "Yui", text: "Exactly. And I’ll show up with ridiculous signs and melon-pan." },
          { speaker: name, text: "That sounds like a life I want to sprint toward." },
          { speaker: "Yui", text: "And if it turns out you love studying biomechanics or coaching—" },
          { speaker: name, text: "I can still be fast in different ways." },
          { speaker: "Yui", text: "Fast at learning. Fast at caring for your team. Fast at texting me back." },
          { speaker: name, text: "Zero lag. Swear." },
          { speaker: "Yui", text: "We’ll map your season: tryouts, campus visits, races. You choose, we adapt." },
          lunchLine,
          quizLine,
          { speaker: name, text: "Having a plan makes the air feel warmer." },
          { speaker: "Yui", text: "Or maybe that’s just me." },
          { speaker: name, text: "It’s both. My favorite number." },
          { speaker: "Narrator", text: "The tree lights flicker like a starting gun. He squeezes your hand; you lean into the turn together." },
          { speaker: "System", text: "THE END" },
        ], addReplay);
      } else {
        // kaoru
        const lunchLine = favLunch === "Curry"
          ? { speaker: name, text: "When I pass, curry rooftop picnic. Non-negotiable." }
          : { speaker: name, text: "When I pass, rooftop picnic. I’ll even bring real napkins." };
        const quizLine = quizRate >= 0.7
          ? { speaker: "Yui", text: "I can tutor. My quiz record isn’t bad." }
          : { speaker: "Yui", text: "I’ll keep you on task. I’m stubborn in useful ways." };

        queueScene([
          { speaker: "Narrator", text: "Christmas Eve settles like velvet. The city looks up at its own reflection in your eyes." },
          { speaker: name, text: "You’re here. Good. I was… not sure I deserved it." },
          { speaker: "Yui", text: "You do. Even when you skip class." },
          { speaker: "Narrator", text: `You hand over ${gifts[winner]}. He turns the strings with reverence, then you.` },
          { speaker: name, text: "I’m tired of pretending I don’t care. I do. About music. About you. About… graduating." },
          { speaker: "Yui", text: "Remedials aren’t romantic, but I can make flashcards look cute." },
          { speaker: name, text: "Dangerous power. Will you help me pass? I get… a bit much. I want to be better for you." },
          { speaker: "Yui", text: "Be better for you first. I’ll sit beside you while you do it." },
          { speaker: name, text: "I’ll mess up. I’ll want to run to the roof instead of the library." },
          { speaker: "Yui", text: "Then I’ll walk you back downstairs. Every time." },
          { speaker: name, text: "And if I snap?" },
          { speaker: "Yui", text: "You’ll apologize. I’ll forgive you. We keep going." },
          { speaker: name, text: "I don’t want to be a storm with a guitar." },
          { speaker: "Yui", text: "Be a sky with weather reports. I’ll check the forecast." },
          lunchLine,
          quizLine,
          { speaker: name, text: "Deal. Hold me to it." },
          { speaker: "Narrator", text: "Snow drifts past the tree like quiet applause. You stand close enough to share courage." },
          { speaker: "System", text: "THE END" },
        ], addReplay);
      }
      return;
    }

    // No winner -> Alone ending with Kaito
    showBackgroundFor("home");
    audioStop("bg");
    audioPlayLoop("christmas");
    showOnly("kaito");
    queueScene([
      { speaker: "Narrator", text: "Christmas Eve arrives anyway, gentle and bright." },
      { speaker: "Yui", text: "Kaito. Couch. Blankets. I claim the big pillow." },
      { speaker: "Kaito", text: "Only if I get extra marshmallows." },
      { speaker: "Yui", text: "Deal. But you’re making the cocoa." },
      { speaker: "Narrator", text: "He shuffles in socks that don’t match, triumphant with a mug like a trophy." },
      { speaker: "Kaito", text: "I queued the movie with explosions and feelings. You like both." },
      { speaker: "Yui", text: "Annoying. Accurate." },
      { speaker: "Narrator", text: "Halfway through, his head finds your shoulder the way it did when the world was bigger than both of you." },
      { speaker: "Yui", text: "Hey, thanks for letting me be dramatic this week." },
      { speaker: "Kaito", text: "I’m your brother. It’s in the contract." },
      { speaker: "Narrator", text: "The credits roll. Outside, snow keeps its promises; inside, you keep yours." },
      { speaker: "Yui", text: "Spending time with you… isn’t so bad." },
      { speaker: "Kaito", text: "I’m amazing, actually." },
      { speaker: "Yui", text: "Don’t push it." },
      { speaker: "Narrator", text: "You laugh together, and it sounds like home." },
      { speaker: "System", text: "THE END" },
    ], addReplay);
  }

  // Title Screen
  function setupTitleScreen() {
    const node = document.getElementById("titleScreen");
    if (!node) {
      // Fallback: start immediately if node missing
      intro();
      return;
    }
    // If we have a saved state that is mid-game (day < 14), skip title automatically
    if (state.day < 14) {
      node.classList.add("hidden");
      audioPlayLoop("bg"); // ensure main bg plays when resuming mid-game
      intro();
      return;
    }
    // Ensure background shows title art behind overlay as well
    // Apply title background directly without wipe to avoid double transition on first load
    try {
      const bg = document.getElementById("background");
      if (bg) {
        bg.style.background = "";
        bg.style.backgroundColor = "#000";
        bg.style.backgroundImage = 'url("images/bg/bg_title.png")';
        bg.style.backgroundSize = "cover";
        bg.style.backgroundPosition = "center center";
        bg.style.backgroundRepeat = "no-repeat";
      }
    } catch (e) {}
    // Simpler title animation: no per-letter splitting; apply a whole-title entrance class
    try {
      const titleEl = document.querySelector(".game-title");
      if (titleEl) {
        titleEl.classList.add("title-entrance");
        // Add subtle sparkles around the title (performance-friendly)
        const wrap = document.createElement("div");
        wrap.className = "sparkles";
        // Create N sparkles with randomized positions and delays
        const N = 14;
        for (let i = 0; i < N; i++) {
          const s = document.createElement("span");
          s.className = "sparkle";
          // random position within the container bounds (inset is relative to title)
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          s.style.left = x + "%";
          s.style.top = y + "%";
          // random delay and duration variance for twinkle
          const delay = Math.random() * 2600; // 0-2.6s
          const dur = 2000 + Math.random() * 1600; // 2.0s - 3.6s
          s.style.animationDelay = `${Math.round(delay)}ms, 0ms`;
          s.style.animationDuration = `${Math.round(dur)}ms, var(--spin, 3200ms)`;
          // random size and spin variance
          const base = 12 + Math.round(Math.random() * 6); // 12-18px
          s.style.width = `${base}px`;
          s.style.height = `${base}px`;
          // randomize spin speed and direction
          const spinMs = 2800 + Math.round(Math.random() * 2200); // 2.8s - 5.0s
          const dir = Math.random() < 0.5 ? 1 : -1;
          s.style.setProperty("--spin", `${spinMs}ms`);
          s.style.animationDirection = `normal, ${dir === 1 ? "normal" : "reverse"}`;
          wrap.appendChild(s);
        }
        // Insert sparkles as a sibling and position relative to the title box
        titleEl.parentElement?.insertBefore(wrap, titleEl);

        // Hard Mode toggles: double-click title or press H while on title screen
        let lastTitleClick = 0;
        titleEl.addEventListener("click", () => {
          const now = performance.now();
          if (now - lastTitleClick < 320) {
            toggleHardMode();
            lastTitleClick = 0;
          } else {
            lastTitleClick = now;
          }
        });

        // Set initial visibility/content of Hard Mode list on title
        const hint = document.querySelector(".title-hardmode-hint");
        if (hint) {
          if (state.hard) {
            hint.classList.add("active");
            hint.setAttribute("aria-hidden", "false");
          } else {
            hint.classList.remove("active");
            hint.setAttribute("aria-hidden", "true");
          }
        }

        // Bind title action buttons
        const btnContinue = document.getElementById("btnContinue");
        const btnNew = document.getElementById("btnNewGame");

        if (btnContinue) {
          btnContinue.addEventListener("click", () => {
            // Continue game using local storage; if none, start fresh
            const hasSave = !!localStorage.getItem("xmas14_state");
            if (hasSave) {
              hideTitleAndStart();
            } else {
              // no save; start new game
              startNewGameFromTitle();
            }
          });
        }
        if (btnNew) {
          btnNew.addEventListener("click", () => {
            startNewGameFromTitle(true);
          });
        }
      }
    } catch(e) {}
    // Play title loop on title screen
    audioPlayLoop("title");
  }
  function titleVisible() {
    const node = document.getElementById("titleScreen");
    return node && !node.classList.contains("hidden");
  }
  function hideTitleAndStart() {
    const node = document.getElementById("titleScreen");
    if (node) node.classList.add("hidden");
    // swap from title music to bg loop
    audioStop("title");
    audioPlayLoop("bg");
    intro();
  }

  // Start a completely fresh game from the title screen
  function startNewGameFromTitle(clearStorage) {
    try {
      if (clearStorage) localStorage.removeItem("xmas14_state");
    } catch (e) {}
    // Reset all in-memory state to defaults
    state.day = 14;
    state.love.ryu = 0;
    state.love.haruto = 0;
    state.love.kaoru = 0;
    state.progress.ryu = -1;
    state.progress.haruto = -1;
    state.progress.kaoru = -1;
    state.sceneQueue = [];
    state.onSceneComplete = null;
    state.awaitingChoice = false;
    saveState();
    hideTitleAndStart();
  }

  // UI Helpers

  function queueScene(lines, onComplete) {
    state.sceneQueue = lines.slice();
    state.onSceneComplete = onComplete || null;
    // Immediately render first line even if a previous typing run was mid-flight
    const next = state.sceneQueue.shift();
    if (next) {
      if (next.show) showOnly(...next.show);
      setDialogue(next.speaker, next.text);
    } else {
      advanceScene();
    }
  }

  // Classroom daily variety
  function pickClassroomLines(dayNum) {
    const openers = [
      "Homeroom chatter curls around you like steam from tea.",
      "Morning light puddles across desks; whispers skate on it.",
      "You slide into your seat; winter clings to your sleeves.",
      "Someone's scarf smells like oranges and laundry soap.",
      "You breathe in pencils and possibility.",
      "Your phone buzzes; you ignore it like a pro.",
      "Your planner looks braver than you feel.",
      "You trace a heart in the condensation on your bottle, then wipe it away.",
      "A heater rattles bravely; the room forgives it.",
      "You doodle snowflakes in the margin and pretend it’s research.",
    ];
    const middles = [
      { speaker: "Yui", text: pickOne([
        "Focus. You can do this.",
        "Okay, brain—be gentle.",
        "I’ll make today count.",
        "Smile first, worry later.",
        "New plan: try, fail, learn, tea.",
        "If I look confident, it's because I'm practicing.",
      ])},
      { speaker: "Classmate", text: pickOne([
        "Did you study? I… did not.",
        "Is it Friday yet?",
        "Trade snacks for answers?",
        "It’s so cold I can hear my thoughts cracking.",
        "The vending machine ate my coin and called it breakfast.",
        "The heater and I are in a committed relationship.",
      ])},
    ];
    const quizLines = [
      "Pop quiz time! Let’s wake those brains.",
      "Quick question to sharpen your morning.",
      "A tiny quiz, before the day runs away.",
      "Let’s measure the room’s neurons with a simple puzzle.",
      "One question. Low stakes. High dignity.",
      "Consider this a warm-up lap for the mind.",
    ];
    return {
      open: pickOne(openers),
      middle: middles,
      quiz: pickOne(quizLines),
    };
  }

  function advanceScene() {
    if (state.awaitingChoice) return;

    // If typing is active, complete current line first
    if (typing.active) {
      completeTyping();
      return;
    }

    const next = state.sceneQueue.shift();
    if (!next) {
      // scene finished
      if (typeof state.onSceneComplete === "function") {
        const cb = state.onSceneComplete;
        state.onSceneComplete = null;
        cb();
      }
      return;
    }
    // show characters if specified
    if (next.show) {
      showOnly(...next.show);
    }
    setDialogue(next.speaker, next.text);
  }

  // Typing effect (robust)
  const typing = {
    active: false,
    full: "",
    shown: "",
    idx: 0,
    speed: 22,
    timer: null,
  };

  function setDialogue(speaker, text) {
    el.speaker.textContent = speaker;
    startTyping(text);
  }

  function startTyping(text) {
    stopTyping();
    typing.active = true;
    typing.full = String(text ?? "");
    typing.shown = "";
    typing.idx = 0;
    el.text.textContent = "";
    scheduleNextTick();
  }

  function scheduleNextTick() {
    typing.timer = window.setTimeout(typeTick, typing.speed);
  }

  function typeTick() {
    if (!typing.active) return;
    if (typing.idx >= typing.full.length) {
      // done
      completeTyping();
      return;
    }
    typing.shown += typing.full.charAt(typing.idx++);
    el.text.textContent = typing.shown;
    scheduleNextTick();
  }

  function completeTyping() {
    if (!typing.active) return;
    if (typing.timer) {
      clearTimeout(typing.timer);
      typing.timer = null;
    }
    typing.active = false;
    el.text.textContent = typing.full;
  }

  function stopTyping() {
    if (typing.timer) {
      clearTimeout(typing.timer);
      typing.timer = null;
    }
    typing.active = false;
    typing.full = "";
    typing.shown = "";
    typing.idx = 0;
  }

  // Swap character art variants depending on context (regular vs. christmas endings)
  function applyCharacterArtVariant(kind) {
    // default (daily scenes) use *_a; Yui specifically uses yui_b for intro portrait
    const base = {
      yui: "images/char/yui_b.png",
      ryu: "images/char/ryu_a.png",
      haruto: "images/char/haruto_a.png",
      kaoru: "images/char/kaoru_a.png",
    };
    // for christmas endings, use *_b for winners; default to *_a otherwise
    const xmas = {
      yui: "images/char/yui_b.png",
      ryu: "images/char/ryu_b.png",
      haruto: "images/char/haruto_b.png",
      kaoru: "images/char/kaoru_b.png",
    };
    const use = kind === "christmas" ? xmas : base;
    for (const key of ["yui", "ryu", "haruto", "kaoru"]) {
      const node = el.chars[key];
      if (!node) continue;
      node.style.backgroundImage = `url("${use[key]}")`;
      node.style.backgroundSize = "cover";
      node.style.backgroundPosition = "center";
    }
  }

  function alignPortraitBottom(node) {
    try {
      const dlg = document.getElementById("dialogueBox");
      const scene = document.getElementById("scene");
      if (!(dlg && scene && node)) return;
      const dlgRect = dlg.getBoundingClientRect();
      const sceneRect = scene.getBoundingClientRect();
      const gap = Math.max(0, (sceneRect.bottom - dlgRect.top));
      node.style.bottom = `${gap}px`;
    } catch (e) {}
  }

  function showOnly(...who) {
    const names = new Set(who || []);
    for (const key of ["yui", "ryu", "haruto", "kaoru", "kaito"]) {
      const node = el.chars[key];
      if (!node) continue;
      if (names.has(key)) {
        node.classList.add("visible");
        // Align visible portrait with dialogue box top
        alignPortraitBottom(node);
      } else {
        node.classList.remove("visible");
      }
    }
  }

  function showBackgroundFor(kind) {
    // Swap music based on background if not in title/ending transitions
    if (kind === "christmas") {
      // Crossfade to christmas loop only
      if (!titleVisible()) crossfadeTo("christmas", { duration: 900 });
    } else if (kind === "library") {
      // Haruto theme in library
      if (!titleVisible()) crossfadeTo("haruto", { duration: 800 });
    } else if (kind === "rooftop") {
      // Kaoru theme on rooftop
      if (!titleVisible()) crossfadeTo("kaoru", { duration: 800 });
    } else if (kind === "gym") {
      // Ryu theme in gym
      if (!titleVisible()) crossfadeTo("ryu", { duration: 800 });
    } else if (kind !== "title") {
      // default in-game bg (e.g., classroom, home, etc.)
      if (!titleVisible()) crossfadeTo("bg", { duration: 700 });
    }

    // Apply character art set based on scene kind
    applyCharacterArtVariant(kind);

    // Map kinds to image paths and gradient fallbacks
    const map = {
      classroom: { img: "images/bg/bg_classroom.png", grad: "linear-gradient(180deg, #c5d7ff 0%, #e8f0ff 40%, #ffffff 100%)" },
      library:   { img: "images/bg/bg_library.png",   grad: "linear-gradient(180deg, #e5ffe8 0%, #f0fff4 50%, #ffffff 100%)" },
      gym:       { img: "images/bg/bg_gym.png",       grad: "linear-gradient(180deg, #ffe2e2 0%, #fff1f1 50%, #ffffff 100%)" },
      rooftop:   { img: "images/bg/bg_rooftop.png",   grad: "linear-gradient(180deg, #e1fff9 0%, #f0fffb 50%, #ffffff 100%)" },
      christmas: { img: "images/bg/bg_christmas.png",  grad: "linear-gradient(180deg, #001a33 0%, #073763 50%, #0a2740 100%)" },
      title:     { img: "images/bg/bg_title.png",     grad: "linear-gradient(180deg, #001a33 0%, #073763 50%, #0a2740 100%)" },
      home:      { img: "images/bg/bg_home.png",      grad: "linear-gradient(180deg, #f8ede3 0%, #fff7f1 50%, #ffffff 100%)" },
      default:   { img: "",                           grad: "linear-gradient(180deg, #dfe9ff 0%, #eef3ff 50%, #ffffff 100%)" },
    };
    const entry = map[kind] || map.default;

    // Helper to apply styles atomically during wipe
    const apply = () => {
      // Use backgroundImage + backgroundColor to avoid flashes
      if (entry.img) {
        el.background.style.background = "";
        el.background.style.backgroundColor = "";
        el.background.style.backgroundImage = `url("${entry.img}")`;
        el.background.style.backgroundSize = "cover";
        el.background.style.backgroundPosition = "center center";
        el.background.style.backgroundRepeat = "no-repeat";
        el.background.style.backgroundColor = "#000";
      } else {
        el.background.style.backgroundImage = "";
        el.background.style.backgroundSize = "";
        el.background.style.backgroundPosition = "";
        el.background.style.backgroundRepeat = "";
        el.background.style.backgroundColor = "";
        el.background.style.background = entry.grad;
      }
    };

    // If we have an image, pre-load before wiping in, else just apply immediately with wipe
    const doTransition = () => {
      const wipe = document.getElementById("wipe");
      if (wipe) {
        // Do not hide characters here; keep current visibility so portraits persist across wipes
        wipe.classList.remove("wipe-out");
        wipe.classList.add("wipe-in");
        setTimeout(() => {
          apply();
          // Title screen: also update hint text about Hard Mode when applicable
          try {
            if (kind === "title") {
              const hint = document.querySelector(".title-hardmode-hint");
              if (hint) {
                hint.textContent = "Hard Mode: Dev console disabled. Date threshold increased. Secret ending dialogue unlocked. Toggle Hard Mode by double-clicking the title or pressing H. (Only on new game)";
              }
            }
          } catch (e) {}
          wipe.classList.remove("wipe-in");
          wipe.classList.add("wipe-out");
          setTimeout(() => wipe.classList.remove("wipe-out"), 450);
        }, 320);
      } else {
        // No wipe element; apply immediately without altering character visibility
        apply();
      }
    };

    if (entry.img) {
      const img = new Image();
      img.onload = doTransition;
      img.onerror = doTransition; // fall back gracefully; apply() sets gradient anyway
      img.src = entry.img;
    } else {
      doTransition();
    }
  }

  function showChoice({ title, options, onChoose }) {
    state.awaitingChoice = true;
    el.choiceOverlay.classList.remove("hidden");
    el.choiceOverlay.innerHTML = "";

    const panel = document.createElement("div");
    panel.className = "choicePanel";

    const t = document.createElement("div");
    t.className = "choiceTitle";
    t.textContent = title;
    panel.appendChild(t);

    const cont = document.createElement("div");
    cont.className = "choiceOptions";

    const opts = options.map(o => {
      if (typeof o === "string") return { label: o, value: o };
      return o;
    });

    for (const opt of opts) {
      const btn = document.createElement("button");
      btn.className = "choiceBtn";
      btn.textContent = opt.label ?? String(opt);
      btn.addEventListener("click", () => {
        el.choiceOverlay.classList.add("hidden");
        state.awaitingChoice = false;
        onChoose(opt.value ?? opt);
      });
      cont.appendChild(btn);
    }

    panel.appendChild(cont);
    el.choiceOverlay.appendChild(panel);
  }

  function refreshHUD() {
    const d = state.day;
    if (d <= 0) {
      el.dayCounter.textContent = "Christmas Day";
    } else {
      const unit = d === 1 ? "day" : "days";
      el.dayCounter.textContent = `${d} ${unit} until Christmas`;
    }
    // Hard Mode badge visibility
    try {
      const badge = document.getElementById("hardModeBadge");
      if (badge) {
        if (state.hard) {
          badge.classList.add("active");
          badge.setAttribute("aria-hidden", "false");
        } else {
          badge.classList.remove("active");
          badge.setAttribute("aria-hidden", "true");
        }
      }
    } catch (e) {}
    syncDevPanel();
  }

  function syncDevPanel() {
    if (!el.ryuLove) return;
    el.ryuLove.value = String(state.love.ryu);
    el.harutoLove.value = String(state.love.haruto);
    el.kaoruLove.value = String(state.love.kaoru);
    el.debugLine.textContent = `Dev: day=${state.day} | ryu=${state.love.ryu} haruto=${state.love.haruto} kaoru=${state.love.kaoru}`;
  }

  function applyURLDev() {
    const params = new URLSearchParams(location.search);
    if (params.get("dev") === "1") {
      state.dev = true;
      el.devPanel.classList.remove("hidden");
      el.devPanel.setAttribute("aria-hidden", "false");
    }
  }

  // Persistence
  function saveState() {
    try {
      const payload = {
        day: state.day,
        love: state.love,
        progress: state.progress,
        stats: state.stats,
        hard: state.hard,
      };
      localStorage.setItem("xmas14_state", JSON.stringify(payload));
    } catch (e) {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem("xmas14_state");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.day === "number") state.day = parsed.day;
      if (parsed.love && typeof parsed.love === "object") {
        state.love.ryu = Number(parsed.love.ryu) || 0;
        state.love.haruto = Number(parsed.love.haruto) || 0;
        state.love.kaoru = Number(parsed.love.kaoru) || 0;
      }
      if (parsed.progress && typeof parsed.progress === "object") {
        state.progress.ryu = Number(parsed.progress.ryu);
        if (Number.isNaN(state.progress.ryu)) state.progress.ryu = -1;
        state.progress.haruto = Number(parsed.progress.haruto);
        if (Number.isNaN(state.progress.haruto)) state.progress.haruto = -1;
        state.progress.kaoru = Number(parsed.progress.kaoru);
        if (Number.isNaN(state.progress.kaoru)) state.progress.kaoru = -1;
      }
      if (parsed.stats && typeof parsed.stats === "object") {
        // lunches
        if (parsed.stats.lunches && typeof parsed.stats.lunches === "object") {
          const L = ["Melon-pan","Curry","Udon","Gyoza","Ramen"];
          for (const k of L) {
            state.stats.lunches[k] = Number(parsed.stats.lunches[k]) || 0;
          }
        }
        // quizzes
        if (parsed.stats.quizzes && typeof parsed.stats.quizzes === "object") {
          state.stats.quizzes.correct = Number(parsed.stats.quizzes.correct) || 0;
          state.stats.quizzes.total = Number(parsed.stats.quizzes.total) || 0;
        }
      }
      if (typeof parsed.hard === "boolean") {
        state.hard = parsed.hard;
      }
    } catch (e) {}
  }

  // Scene banks for boys with progressive familiarity
  // Returns an array of dialogue lines based on current love
  // Helpers to retrieve scenarios by explicit tier (used for deterministic progression)
  function ryuScenariosByTier(tier) {
    const banks = {
      0: [
        { speaker: "Ryu", text: "Uh—hi. Didn’t expect anyone yet." },
        { speaker: "Yui", text: "I like the gym when it’s quiet." },
        { speaker: "Ryu", text: "Same. Less echo in my head." },
        { speaker: "Narrator", text: "He half-waves, then pretends to tighten a lace that’s already tight." },
        { speaker: "Yui", text: "Morning drills?" },
        { speaker: "Ryu", text: "Yeah. Light. Or, um, supposed to be." },
        { speaker: "Yui", text: "I can count for you." },
        { speaker: "Ryu", text: "You’d do that?" },
        { speaker: "Yui", text: "Cheapest job I’ll ever take." },
        { speaker: "Ryu", text: "Okay. Deal. Thanks." },
        { speaker: "Yui", text: "Ready when you are." },
        { speaker: "Ryu", text: "…Right. Go time." },
      ],
      1: [
        { speaker: "Ryu", text: "Oh—hey. You, uh, been here long?" },
        { speaker: "Yui", text: "Long enough to see that last sprint." },
        { speaker: "Ryu", text: "Yeah? Sorry, form was… not terrible. I think." },
        { speaker: "Narrator", text: "He rubs the back of his neck, shoe scuffing the floor." },
        { speaker: "Yui", text: "Looked fast to me." },
        { speaker: "Ryu", text: "I try. Faster tomorrow. That’s the rule." },
        { speaker: "Yui", text: "You make your own rules?" },
        { speaker: "Ryu", text: "Sometimes I borrow them from people who show up." },
        { speaker: "Yui", text: "I can loan you a few more." },
        { speaker: "Ryu", text: "Cool. I’ll, uh… return them in good condition." },
        { speaker: "Yui", text: "No scratches." },
        { speaker: "Ryu", text: "Deal." },
      ],
      2: [
        { speaker: "Ryu", text: "Coach said I need to keep my head up. I’m practicing… that." },
        { speaker: "Yui", text: "Seems to be working." },
        { speaker: "Ryu", text: "Right now it is." },
        { speaker: "Narrator", text: "His smile is quick, then careful." },
        { speaker: "Yui", text: "Got any pre-run rituals?" },
        { speaker: "Ryu", text: "Double-knot. Breathe. Don’t look at the clock too much." },
        { speaker: "Yui", text: "I can help with that last one." },
        { speaker: "Ryu", text: "Yeah? How?" },
        { speaker: "Yui", text: "Be more interesting than numbers." },
        { speaker: "Ryu", text: "That’s… already true." },
        { speaker: "Yui", text: "Good answer." },
        { speaker: "Ryu", text: "Thanks." },
      ],
      3: [
        { speaker: "Ryu", text: "Wanna time me? I trust your count more than that beat-up clock." },
        { speaker: "Yui", text: "Ready when you are. Three… two…" },
        { speaker: "Narrator", text: "He flies. You feel lighter, just watching." },
        { speaker: "Ryu", text: "How was it?" },
        { speaker: "Yui", text: "Fast enough to outrun bad days." },
        { speaker: "Ryu", text: "I keep a spare pair of shoes for those." },
        { speaker: "Yui", text: "Do they squeak when sadness gets close?" },
        { speaker: "Ryu", text: "Only when I need to make you laugh." },
        { speaker: "Yui", text: "That’s illegal performance enhancement." },
        { speaker: "Ryu", text: "Disqualify me after cocoa." },
        { speaker: "Yui", text: "Tempting." },
        { speaker: "Narrator", text: "The stopwatch feels warm in your palm." },
      ],
      4: [
        { speaker: "Ryu", text: "I like that you don’t make a big deal of stuff. You just… try." },
        { speaker: "Yui", text: "Trying is my brand." },
        { speaker: "Ryu", text: "It looks good on you." },
        { speaker: "Narrator", text: "Sneakers squeak; a whistle chirps like a small bird." },
        { speaker: "Yui", text: "Coach seems in a mood." },
        { speaker: "Ryu", text: "It’s his love language. Yelling." },
        { speaker: "Yui", text: "I’m fluent in that from my brother." },
        { speaker: "Ryu", text: "Then you’re basically bilingual." },
        { speaker: "Yui", text: "Put that on my resume." },
        { speaker: "Ryu", text: "I’ll write a reference letter: ‘claps like thunder.’" },
        { speaker: "Yui", text: "Hire me immediately." },
        { speaker: "Narrator", text: "You both smile at nothing in particular." },
      ],
      5: [
        { speaker: "Ryu", text: "Coach says my stride’s cleaner. Might be your influence." },
        { speaker: "Yui", text: "I only brought world-class clapping." },
        { speaker: "Ryu", text: "Apparently, that’s performance-enhancing." },
        { speaker: "Yui", text: "What’s your secret warm-up song?" },
        { speaker: "Ryu", text: "Anything with drums. Or your voice saying ‘Go.’" },
        { speaker: "Yui", text: "I can loop that for you." },
        { speaker: "Ryu", text: "Careful. I’ll run to Hokkaido and back." },
        { speaker: "Yui", text: "Bring snacks if you do." },
        { speaker: "Ryu", text: "Melon-pan fuel." },
        { speaker: "Yui", text: "Predictable. Cute." },
        { speaker: "Ryu", text: "Predictably cute is a brand too." },
        { speaker: "Narrator", text: "You swear the gym lights feel warmer." },
      ],
      6: [
        { speaker: "Ryu", text: "Run with me after finals? No pressure, just air and shoes." },
        { speaker: "Yui", text: "I’ll need better socks. And snacks." },
        { speaker: "Ryu", text: "Done and done." },
        { speaker: "Yui", text: "What’s your favorite route?" },
        { speaker: "Ryu", text: "Riverside. The wind races fair there." },
        { speaker: "Yui", text: "Will you let me win once?" },
        { speaker: "Ryu", text: "If winning is laughing first, you already do." },
        { speaker: "Yui", text: "That’s cheating." },
        { speaker: "Ryu", text: "Only if you tell coach." },
        { speaker: "Yui", text: "My lips are zipped." },
        { speaker: "Ryu", text: "I notice them anyway." },
        { speaker: "Narrator", text: "A beat. Then you both pretend to stretch." },
      ],
      7: [
        { speaker: "Ryu", text: "You look happier lately. Or maybe I just notice more." },
        { speaker: "Yui", text: "Maybe both." },
        { speaker: "Ryu", text: "Both is my favorite number." },
        { speaker: "Narrator", text: "He jogs in place, eyes not leaving yours long." },
        { speaker: "Yui", text: "Do scouts scare you?" },
        { speaker: "Ryu", text: "A little. Not as much as missing chances." },
        { speaker: "Yui", text: "You won’t." },
        { speaker: "Ryu", text: "Say that again after I run." },
        { speaker: "Yui", text: "You won’t." },
        { speaker: "Ryu", text: "Now I have to prove you right." },
        { speaker: "Yui", text: "Good. I like being right." },
        { speaker: "Narrator", text: "He explodes off the line; your heart follows." },
      ],
      8: [
        { speaker: "Ryu", text: "Hold still—snowflake on your hair. Got it." },
        { speaker: "Yui", text: "Careful, that’s limited edition." },
        { speaker: "Ryu", text: "I’ll keep it safe." },
        { speaker: "Yui", text: "Do you keep everything you catch?" },
        { speaker: "Ryu", text: "Only the good things." },
        { speaker: "Yui", text: "What counts as good?" },
        { speaker: "Ryu", text: "Things that make winter feel less cold." },
        { speaker: "Yui", text: "Like gloves?" },
        { speaker: "Ryu", text: "Like company." },
        { speaker: "Narrator", text: "The track looks softer, somehow." },
        { speaker: "Yui", text: "Don’t drop that snowflake." },
        { speaker: "Ryu", text: "I won’t." },
      ],
      9: [
        { speaker: "Ryu", text: "If I say you make winter feel like spring training, is that corny?" },
        { speaker: "Yui", text: "Deeply. Keep going." },
        { speaker: "Ryu", text: "You’re my favorite warm-up." },
        { speaker: "Yui", text: "And your cool-down?" },
        { speaker: "Ryu", text: "Also you." },
        { speaker: "Yui", text: "Ambitious." },
        { speaker: "Ryu", text: "I’m a multi-event athlete." },
        { speaker: "Yui", text: "What’s my medal?" },
        { speaker: "Ryu", text: "Gold. Obviously." },
        { speaker: "Narrator", text: "He looks like he means it." },
        { speaker: "Yui", text: "Then run like you’ve got a podium to reach." },
        { speaker: "Ryu", text: "Roger that." },
      ],
      10: [
        { speaker: "Ryu", text: "I like you. There, I said it. Doesn’t even make me slower." },
        { speaker: "Yui", text: "Good. I want you fast and honest." },
        { speaker: "Narrator", text: "His confidence sits closer now, like a shared jacket." },
        { speaker: "Ryu", text: "If scouts call, I still want riverside runs with you." },
        { speaker: "Yui", text: "I’ll schedule them between cheering and eating melon-pan." },
        { speaker: "Ryu", text: "Perfect training plan." },
        { speaker: "Yui", text: "With optional hand-holding." },
        { speaker: "Ryu", text: "Highly recommended by athletes worldwide." },
        { speaker: "Yui", text: "Peer reviewed by us." },
        { speaker: "Ryu", text: "I’ll bring a medal. You bring you." },
        { speaker: "Yui", text: "Deal." },
        { speaker: "Narrator", text: "The gym fades. The moment does not." },
      ],
      11: [
        { speaker: "Ryu", text: "University brochures keep showing up in my locker." },
        { speaker: "Yui", text: "From the track teams?" },
        { speaker: "Ryu", text: "Yeah. It’s… loud in my head about it." },
        { speaker: "Yui", text: "We can make it quieter. Pros and cons on a napkin after practice." },
        { speaker: "Ryu", text: "You make everything sound doable." },
        { speaker: "Yui", text: "Only because you do the running part." },
        { speaker: "Ryu", text: "Then I’ll run toward what feels like us." },
        { speaker: "Narrator", text: "His grin is a finish line you want to cross together." },
        { speaker: "Yui", text: "I’ll bring the pens." },
        { speaker: "Ryu", text: "I’ll bring the legs." },
        { speaker: "Yui", text: "Teamwork." },
        { speaker: "Ryu", text: "Best event." },
      ],
      12: [
        { speaker: "Ryu", text: "Coach said I lead better when you’re around." },
        { speaker: "Yui", text: "That’s because I glare at slackers." },
        { speaker: "Ryu", text: "It’s effective. Also cute." },
        { speaker: "Yui", text: "Focus, captain." },
        { speaker: "Ryu", text: "After practice, cocoa? I want to tell you something without the team listening." },
        { speaker: "Yui", text: "I’m listening now." },
        { speaker: "Ryu", text: "Then hear this: I don’t just like you. I want a future that has your cheering in it." },
        { speaker: "Yui", text: "Good. I already bought extra markers for signs." },
        { speaker: "Ryu", text: "Marry me to the bleachers." },
        { speaker: "Yui", text: "We’ll start with a reserved seat and work up." },
        { speaker: "Ryu", text: "Deal." },
        { speaker: "Narrator", text: "The echo in the gym feels like applause." },
      ],
      13: [
        { speaker: "Ryu", text: "Confession time. I love you." },
        { speaker: "Yui", text: "I love you, too." },
        { speaker: "Narrator", text: "For a breath, even the squeaky floor holds still." },
        { speaker: "Ryu", text: "Run with me tomorrow. Not to get faster. Just to go together." },
        { speaker: "Yui", text: "Always." },
        { speaker: "Ryu", text: "Good. It’s my favorite promise." },
        { speaker: "Narrator", text: "You lace fingers like you lace shoes: snug, ready, sure." },
        { speaker: "Yui", text: "Three… two…" },
        { speaker: "Ryu", text: "One." },
        { speaker: "Narrator", text: "And then, simply, you smile." },
        { speaker: "Yui", text: "Go." },
        { speaker: "Ryu", text: "Together." },
      ],
    };
    return banks[tier] || banks[0];
  }
  
  // Preserve old signature for any existing calls; still maps love->tier and returns lines
  function ryuScenarios(love) {
    return ryuScenariosByTier(loveTier(love));
  }

  function harutoScenariosByTier(tier) {
    const banks = {
      0: [
        { speaker: "Haruto", text: "Oh. Hi. I didn’t—um—see you there." },
        { speaker: "Yui", text: "I come in peace. And silence." },
        { speaker: "Haruto", text: "Good. Silence is… helpful." },
        { speaker: "Narrator", text: "He taps the pencil twice, then stops like he caught himself." },
        { speaker: "Yui", text: "Designing something mysterious?" },
        { speaker: "Haruto", text: "A bench. But it should make people feel less tired when they sit." },
        { speaker: "Yui", text: "Like magic." },
        { speaker: "Haruto", text: "Like kindness." },
        { speaker: "Yui", text: "Better." },
        { speaker: "Haruto", text: "Would you test it? When it exists." },
        { speaker: "Yui", text: "I’ll bring a book." },
        { speaker: "Haruto", text: "I’ll bring tea." },
      ],
      1: [
        { speaker: "Haruto", text: "H-hey. Sorry, I didn’t hear you come in." },
        { speaker: "Yui", text: "Stealth mode. Didn’t want to scare the pencils." },
        { speaker: "Haruto", text: "They’re brave today." },
        { speaker: "Narrator", text: "He straightens a ruler that was already straight." },
        { speaker: "Yui", text: "What are you working on?" },
        { speaker: "Haruto", text: "Just… a concept. For a place that feels restful." },
        { speaker: "Yui", text: "Ambitious." },
        { speaker: "Haruto", text: "Necessary." },
        { speaker: "Yui", text: "Do I get a tour when it’s real?" },
        { speaker: "Haruto", text: "If you want." },
        { speaker: "Yui", text: "I want." },
        { speaker: "Haruto", text: "Okay." },
      ],
      2: [
        { speaker: "Haruto", text: "I saved you a seat. It has optimal light, I think." },
        { speaker: "Yui", text: "You graded the sunlight?" },
        { speaker: "Haruto", text: "Habit. Sorry." },
        { speaker: "Yui", text: "Don’t be. It’s sweet." },
        { speaker: "Narrator", text: "He adjusts the chair by three millimeters. Exactly." },
        { speaker: "Yui", text: "Perfect." },
        { speaker: "Haruto", text: "Good." },
        { speaker: "Yui", text: "What should I study? Life? Love?" },
        { speaker: "Haruto", text: "Start with tea. Then… we can try the rest." },
        { speaker: "Yui", text: "A sensible curriculum." },
        { speaker: "Haruto", text: "I try." },
        { speaker: "Yui", text: "You succeed." },
      ],
      3: [
        { speaker: "Haruto", text: "Do you prefer spiral staircases or straight runs?" },
        { speaker: "Yui", text: "Spirals. They feel like secrets going up." },
        { speaker: "Haruto", text: "Good answer." },
        { speaker: "Yui", text: "What do you prefer?" },
        { speaker: "Haruto", text: "Straight runs for honesty. Spirals for romance." },
        { speaker: "Yui", text: "You can have both." },
        { speaker: "Haruto", text: "Interleaved." },
        { speaker: "Narrator", text: "He sketches a tiny spiral that looks suspiciously like a Y." },
        { speaker: "Yui", text: "Is that…?" },
        { speaker: "Haruto", text: "A structural flourish." },
        { speaker: "Yui", text: "Architect code for ‘maybe.’" },
        { speaker: "Haruto", text: "Perhaps." },
      ],
      4: [
        { speaker: "Haruto", text: "I brought extra pencil leads… in case." },
        { speaker: "Yui", text: "In case I steal them with my eyes?" },
        { speaker: "Haruto", text: "In case you want to try a line." },
        { speaker: "Narrator", text: "He slides the mechanical pencil like an offering." },
        { speaker: "Yui", text: "What should I draw?" },
        { speaker: "Haruto", text: "A window. Where would you put it?" },
        { speaker: "Yui", text: "Here. So the afternoon warms the table." },
        { speaker: "Haruto", text: "Functional poetry." },
        { speaker: "Yui", text: "Stop calling me that or I’ll start charging." },
        { speaker: "Haruto", text: "My budget allows for one poem." },
        { speaker: "Yui", text: "You’re getting a haiku." },
        { speaker: "Haruto", text: "Efficient." },
      ],
      5: [
        { speaker: "Haruto", text: "I don’t talk much but I listen. To you. A lot." },
        { speaker: "Yui", text: "I noticed. It’s nice." },
        { speaker: "Haruto", text: "Good." },
        { speaker: "Narrator", text: "Sun across the desk turns his sketch pale gold." },
        { speaker: "Yui", text: "What do you hear when you listen?" },
        { speaker: "Haruto", text: "Priorities. Jokes. The way your voice lifts on hope." },
        { speaker: "Yui", text: "That’s… detailed." },
        { speaker: "Haruto", text: "I do details." },
        { speaker: "Yui", text: "Do mine look okay?" },
        { speaker: "Haruto", text: "Better than okay." },
        { speaker: "Yui", text: "You’re getting suspiciously smooth." },
        { speaker: "Haruto", text: "Practice." },
      ],
      6: [
        { speaker: "Haruto", text: "I traced a facade and thought the shadow looked like your smile." },
        { speaker: "Yui", text: "That’s… unexpectedly poetic." },
        { speaker: "Haruto", text: "Please don’t tell anyone." },
        { speaker: "Yui", text: "Your secret’s safe in the stacks." },
        { speaker: "Haruto", text: "Thank you." },
        { speaker: "Yui", text: "What wins your dream award?" },
        { speaker: "Haruto", text: "A small building that makes people breathe easier." },
        { speaker: "Yui", text: "Like a pocket park that fits in your chest." },
        { speaker: "Haruto", text: "Yes." },
        { speaker: "Narrator", text: "He erases gently, like he’s afraid to disturb the air." },
        { speaker: "Yui", text: "You already build that." },
        { speaker: "Haruto", text: "Where?" },
      ],
      7: [
        { speaker: "Haruto", text: "There’s a model kit sale downtown after exams. Want to split one?" },
        { speaker: "Yui", text: "I’ll glue my fingers together, but yes." },
        { speaker: "Haruto", text: "I’ll bring tweezers." },
        { speaker: "Yui", text: "And patience?" },
        { speaker: "Haruto", text: "I saved some." },
        { speaker: "Narrator", text: "He shows you a tiny staircase, delicate as a snowflake." },
        { speaker: "Yui", text: "We’ll need tea and victory pastries." },
        { speaker: "Haruto", text: "Udon first." },
        { speaker: "Yui", text: "Bribery works." },
        { speaker: "Haruto", text: "It’s logistics." },
        { speaker: "Yui", text: "I like your logistics." },
        { speaker: "Haruto", text: "Good." },
      ],
      8: [
        { speaker: "Haruto", text: "You make me lose track of time. That’s rare. And… alarming." },
        { speaker: "Yui", text: "We can schedule it." },
        { speaker: "Haruto", text: "I’d like that." },
        { speaker: "Narrator", text: "A clock on the wall ticks, politely ignored." },
        { speaker: "Yui", text: "What if we build a schedule that includes ‘getting lost’?" },
        { speaker: "Haruto", text: "Then it’s intentional." },
        { speaker: "Yui", text: "Intentional is romantic." },
        { speaker: "Haruto", text: "Noted." },
        { speaker: "Yui", text: "Add ‘walk home slowly.’" },
        { speaker: "Haruto", text: "Done." },
        { speaker: "Yui", text: "And ‘quiet, shared.’" },
        { speaker: "Haruto", text: "Already there." },
      ],
      9: [
        { speaker: "Haruto", text: "Your hair catches the window light in a… nice way." },
        { speaker: "Yui", text: "You can say ‘beautiful.’ It won’t break the structure." },
        { speaker: "Haruto", text: "Beautiful." },
        { speaker: "Narrator", text: "He holds the word like a fragile model." },
        { speaker: "Yui", text: "Do you practice words in your head?" },
        { speaker: "Haruto", text: "Only the heavy ones." },
        { speaker: "Yui", text: "Does this one need bracing?" },
        { speaker: "Haruto", text: "Maybe just… hands." },
        { speaker: "Yui", text: "I have those." },
        { speaker: "Haruto", text: "I noticed." },
        { speaker: "Yui", text: "Careful. I’ll hold you to that." },
        { speaker: "Haruto", text: "Please do." },
      ],
      10: [
        { speaker: "Haruto", text: "I brought you tea. The label said ‘calm focus.’ It sounded like you." },
        { speaker: "Yui", text: "You read tea labels for me now?" },
        { speaker: "Haruto", text: "Apparently." },
        { speaker: "Narrator", text: "Steam curls like calligraphy between you." },
        { speaker: "Yui", text: "What do you want to focus on?" },
        { speaker: "Haruto", text: "Us. Slowly." },
        { speaker: "Yui", text: "I can do slow." },
        { speaker: "Haruto", text: "It feels like building right." },
        { speaker: "Yui", text: "Plumb lines and all that." },
        { speaker: "Haruto", text: "Exactly." },
        { speaker: "Yui", text: "Then cheers." },
        { speaker: "Haruto", text: "Cheers." },
      ],
      11: [
        { speaker: "Haruto", text: "I like you. Not just as a variable in my day. As the constant." },
        { speaker: "Yui", text: "Then let’s build something steady." },
        { speaker: "Narrator", text: "His blush is shy scaffolding around a brave heart." },
        { speaker: "Yui", text: "Design me a home." },
        { speaker: "Haruto", text: "Lots of light. A table that remembers tea rings." },
        { speaker: "Yui", text: "A window for the first snow." },
        { speaker: "Haruto", text: "And a door that never sticks." },
        { speaker: "Yui", text: "Storage for model kits." },
        { speaker: "Haruto", text: "And for your secrets." },
        { speaker: "Yui", text: "They’re small." },
        { speaker: "Haruto", text: "They’ll fit." },
        { speaker: "Narrator", text: "The silence between you is well-built." },
      ],
      12: [
        { speaker: "Haruto", text: "I told my parents I want architecture. They said we’ll talk after New Year." },
        { speaker: "Yui", text: "That’s progress." },
        { speaker: "Haruto", text: "It feels like standing on a bridge you designed yourself." },
        { speaker: "Yui", text: "Strong and a little scary." },
        { speaker: "Haruto", text: "Will you… be there when I explain it?" },
        { speaker: "Yui", text: "I’ll bring tea and honesty." },
        { speaker: "Haruto", text: "Thank you." },
        { speaker: "Narrator", text: "His shoulders lower the way roofs do when snow slides off." },
        { speaker: "Yui", text: "You’re allowed to want this." },
        { speaker: "Haruto", text: "I do. And I want… us." },
        { speaker: "Yui", text: "Us can hold a lot." },
        { speaker: "Haruto", text: "Good." },
      ],
      13: [
        { speaker: "Haruto", text: "I love you." },
        { speaker: "Yui", text: "I love you, too." },
        { speaker: "Narrator", text: "The library air turns tender, like pages about to be bookmarked." },
        { speaker: "Haruto", text: "Let’s build slowly. Deliberately." },
        { speaker: "Yui", text: "My favorite pace." },
        { speaker: "Haruto", text: "I’ll bring the plans." },
        { speaker: "Yui", text: "I’ll bring the tea." },
        { speaker: "Haruto", text: "And the window for first snow." },
        { speaker: "Yui", text: "And the door that never sticks." },
        { speaker: "Narrator", text: "You stand together in a room that isn’t real yet, but feels like home." },
        { speaker: "Haruto", text: "Welcome home." },
        { speaker: "Yui", text: "Thank you." },
      ],
    };
    return banks[tier] || banks[0];
  }
  function harutoScenarios(love) {
    return harutoScenariosByTier(loveTier(love));
  }

  function kaoruScenariosByTier(tier) {
    const banks = {
      0: [
        { speaker: "Kaoru", text: "Didn’t think anyone else liked the wind this early." },
        { speaker: "Yui", text: "It wakes the face up." },
        { speaker: "Kaoru", text: "And keeps the mouth honest." },
        { speaker: "Narrator", text: "He nudges a pebble with his shoe, like it owed him an answer." },
        { speaker: "Yui", text: "Writing?" },
        { speaker: "Kaoru", text: "Thinking about writing." },
        { speaker: "Yui", text: "That counts." },
        { speaker: "Kaoru", text: "Then I’m prolific." },
        { speaker: "Yui", text: "Congratulations." },
        { speaker: "Kaoru", text: "Don’t tell anyone." },
        { speaker: "Yui", text: "Who would I tell?" },
        { speaker: "Kaoru", text: "The sky gossips." },
      ],
      1: [
        { speaker: "Kaoru", text: "Rooftops are for people who prefer sky to small talk." },
        { speaker: "Yui", text: "Then I guess I’m sky people tonight." },
        { speaker: "Kaoru", text: "Lucky sky." },
        { speaker: "Narrator", text: "City lights blink like patient stars below." },
        { speaker: "Yui", text: "Is this where you brood?" },
        { speaker: "Kaoru", text: "I prefer ‘compose’ to brood." },
        { speaker: "Yui", text: "Compose then." },
        { speaker: "Kaoru", text: "Need a muse." },
        { speaker: "Yui", text: "I charge in snacks." },
        { speaker: "Kaoru", text: "Affordable." },
        { speaker: "Yui", text: "Barely." },
        { speaker: "Kaoru", text: "We’ll renegotiate." },
      ],
      2: [
        { speaker: "Kaoru", text: "The wind up here edits conversations. Cuts the boring parts." },
        { speaker: "Yui", text: "Keep the good parts for me." },
        { speaker: "Kaoru", text: "If you insist." },
        { speaker: "Narrator", text: "A distant gull writes its own comment in the air." },
        { speaker: "Yui", text: "Do you write lyrics on your hand?" },
        { speaker: "Kaoru", text: "When paper pretends it’s too important." },
        { speaker: "Yui", text: "And your hand believes in you?" },
        { speaker: "Kaoru", text: "Sometimes." },
        { speaker: "Yui", text: "I do." },
        { speaker: "Kaoru", text: "Dangerous." },
        { speaker: "Yui", text: "Live a little." },
        { speaker: "Kaoru", text: "Working on it." },
      ],
      3: [
        { speaker: "Kaoru", text: "Name a song that feels like December." },
        { speaker: "Yui", text: "Something with bells. And a heartbeat." },
        { speaker: "Kaoru", text: "I’ll write it." },
        { speaker: "Yui", text: "Title it after a sky color." },
        { speaker: "Kaoru", text: "Cerulean bruise." },
        { speaker: "Yui", text: "Dramatic." },
        { speaker: "Kaoru", text: "Have you met me?" },
        { speaker: "Yui", text: "Unfortunately. And fortunately." },
        { speaker: "Kaoru", text: "Keep both." },
        { speaker: "Narrator", text: "His fingers drum a rhythm on the railing." },
        { speaker: "Yui", text: "That’s catchy." },
        { speaker: "Kaoru", text: "Don’t steal it." },
      ],
      4: [
        { speaker: "Kaoru", text: "You show up a lot. Not complaining." },
        { speaker: "Yui", text: "I like the view." },
        { speaker: "Kaoru", text: "Mhm." },
        { speaker: "Narrator", text: "Wind tugs your sleeves like a friend." },
        { speaker: "Yui", text: "Heard anything about fights?" },
        { speaker: "Kaoru", text: "Rumors like attention. I don’t." },
        { speaker: "Yui", text: "So… not true." },
        { speaker: "Kaoru", text: "I only fight laziness." },
        { speaker: "Yui", text: "Winning?" },
        { speaker: "Kaoru", text: "Barely. You help." },
        { speaker: "Yui", text: "I’ll invoice later." },
        { speaker: "Kaoru", text: "Fine." },
      ],
      5: [
        { speaker: "Kaoru", text: "I tuned my guitar to the way your name sounds." },
        { speaker: "Yui", text: "That’s not how tuning works." },
        { speaker: "Kaoru", text: "It does now." },
        { speaker: "Yui", text: "Play it." },
        { speaker: "Kaoru", text: "It’s quiet. Like you when you’re thinking." },
        { speaker: "Yui", text: "I’m loud inside." },
        { speaker: "Kaoru", text: "I know." },
        { speaker: "Narrator", text: "A single invisible chord hangs between you." },
        { speaker: "Yui", text: "Don’t break it." },
        { speaker: "Kaoru", text: "Wouldn’t dare." },
        { speaker: "Yui", text: "Good." },
        { speaker: "Kaoru", text: "Good." },
      ],
      6: [
        { speaker: "Kaoru", text: "Want to hear a chorus I can’t finish?" },
        { speaker: "Yui", text: "Is this where I pretend to understand music theory?" },
        { speaker: "Kaoru", text: "Just nod on the downbeat." },
        { speaker: "Narrator", text: "He hums something that tastes like winter citrus." },
        { speaker: "Yui", text: "Add a line about the sky pretending not to stare." },
        { speaker: "Kaoru", text: "Not bad." },
        { speaker: "Yui", text: "I bill per metaphor." },
        { speaker: "Kaoru", text: "I’m over budget." },
        { speaker: "Yui", text: "Payment plan." },
        { speaker: "Kaoru", text: "Interest free?" },
        { speaker: "Yui", text: "For you." },
        { speaker: "Kaoru", text: "Hn." },
      ],
      7: [
        { speaker: "Kaoru", text: "People are loud. You’re… a volume I like." },
        { speaker: "Yui", text: "Translate: You like me." },
        { speaker: "Kaoru", text: "Don’t ruin my brand." },
        { speaker: "Yui", text: "Rebranding is in." },
        { speaker: "Kaoru", text: "Then I’m limited edition." },
        { speaker: "Yui", text: "Collectible." },
        { speaker: "Kaoru", text: "Handle carefully." },
        { speaker: "Yui", text: "I will." },
        { speaker: "Narrator", text: "Clouds herd the sunset into pink." },
        { speaker: "Kaoru", text: "Stay a little." },
        { speaker: "Yui", text: "Okay." },
        { speaker: "Kaoru", text: "Good." },
      ],
      8: [
        { speaker: "Kaoru", text: "I wrote your name in my notebook. Then drew a sky around it." },
        { speaker: "Yui", text: "Keep the sky. I’ll visit often." },
        { speaker: "Kaoru", text: "Deal." },
        { speaker: "Narrator", text: "A train mutters somewhere below." },
        { speaker: "Yui", text: "What’s the margin note say?" },
        { speaker: "Kaoru", text: "Don’t read over my shoulder." },
        { speaker: "Yui", text: "Then read it to me." },
        { speaker: "Kaoru", text: "‘Brave.’" },
        { speaker: "Yui", text: "For me?" },
        { speaker: "Kaoru", text: "Obviously." },
        { speaker: "Yui", text: "I’ll try to earn it." },
        { speaker: "Kaoru", text: "You already do." },
      ],
      9: [
        { speaker: "Kaoru", text: "You can hold my guitar. Careful; she’s jealous." },
        { speaker: "Yui", text: "Of what?" },
        { speaker: "Kaoru", text: "Me. Obviously." },
        { speaker: "Yui", text: "Your guitar has taste." },
        { speaker: "Kaoru", text: "So do I." },
        { speaker: "Yui", text: "Show-off." },
        { speaker: "Kaoru", text: "Accurate." },
        { speaker: "Narrator", text: "You cradle the weight; it hums faintly with his fingerprints." },
        { speaker: "Yui", text: "Will she forgive me?" },
        { speaker: "Kaoru", text: "If you ask nicely." },
        { speaker: "Yui", text: "Please." },
        { speaker: "Kaoru", text: "Forgiven." },
      ],
      10: [
        { speaker: "Kaoru", text: "If I write you a song, don't show it to anyone. It's not for 'anyone.'"},
        { speaker: "Yui", text: "I'll keep it between the stars and me." },
        { speaker: "Kaoru", text: "Good girl." },
        { speaker: "Narrator", text: "The night leans in to listen." },
        { speaker: "Yui", text: "What will it sound like?" },
        { speaker: "Kaoru", text: "Footsteps on snow. The second before a smile." },
        { speaker: "Yui", text: "I want to hear it." },
        { speaker: "Kaoru", text: "You will." },
        { speaker: "Yui", text: "Promise?" },
        { speaker: "Kaoru", text: "Hn." },
        { speaker: "Yui", text: "I’m taking that as yes." },
        { speaker: "Kaoru", text: "Do that." },
      ],
      11: [
        { speaker: "Kaoru", text: "Fine. I like you. It’s inconvenient. Don’t make me say it again." },
        { speaker: "Yui", text: "I’ll record it and loop it forever." },
        { speaker: "Narrator", text: "He looks away. The sky does not." },
        { speaker: "Yui", text: "What happens now?" },
        { speaker: "Kaoru", text: "We stand here. The world doesn’t mind." },
        { speaker: "Yui", text: "And later?" },
        { speaker: "Kaoru", text: "I’ll play you something new." },
        { speaker: "Yui", text: "I’ll listen like it’s a religion." },
        { speaker: "Kaoru", text: "Blasphemy accepted." },
        { speaker: "Yui", text: "Sinner privileges?" },
        { speaker: "Kaoru", text: "Hand-holding." },
        { speaker: "Narrator", text: "You pretend the wind is the reason you shiver." },
      ],
      12: [
        { speaker: "Kaoru", text: "I told my teacher I’m actually trying to graduate." },
        { speaker: "Yui", text: "Bold statement." },
        { speaker: "Kaoru", text: "She laughed. Then handed me a study plan. You… help?" },
        { speaker: "Yui", text: "I’ll walk you to the library and back. Every time." },
        { speaker: "Kaoru", text: "Annoying. Perfect." },
        { speaker: "Narrator", text: "He kicks the railing lightly, like testing a rhythm he’ll keep." },
        { speaker: "Yui", text: "First lesson: apologize faster. Study longer." },
        { speaker: "Kaoru", text: "Yes, ma’am." },
        { speaker: "Yui", text: "Don’t make it weird." },
        { speaker: "Kaoru", text: "Too late." },
        { speaker: "Yui", text: "I like you anyway." },
        { speaker: "Kaoru", text: "Good." },
      ],
      13: [
        { speaker: "Kaoru", text: "Listen. I love you." },
        { speaker: "Yui", text: "I love you, too." },
        { speaker: "Narrator", text: "The city wind softens like it respects the confession." },
        { speaker: "Kaoru", text: "Help me pass. I’ll write you songs. We’ll eat curry on the roof when it’s all over." },
        { speaker: "Yui", text: "Deal. Rooftop, napkins and all." },
        { speaker: "Kaoru", text: "Real napkins. I promised." },
        { speaker: "Yui", text: "Hold me to the song promise." },
        { speaker: "Kaoru", text: "Hold my hand first." },
        { speaker: "Yui", text: "Okay." },
        { speaker: "Narrator", text: "You lace fingers. The horizon applauds in quiet colors." },
        { speaker: "Kaoru", text: "Stay." },
        { speaker: "Yui", text: "Always." },
      ],
    };
    return banks[tier] || banks[0];
  }
  function kaoruScenarios(love) {
    return kaoruScenariosByTier(loveTier(love));
  }

  // Map love score to tier 0..10 roughly
  function loveTier(love) {
    // Map 0..24+ love to 14 tiers (0..13) for 14 visits worth of progression
    if (love >= 24) return 13;
    if (love >= 22) return 12;
    if (love >= 20) return 11;
    if (love >= 18) return 10;
    if (love >= 16) return 9;
    if (love >= 14) return 8;
    if (love >= 12) return 7;
    if (love >= 10) return 6;
    if (love >= 8) return 5;
    if (love >= 6) return 4;
    if (love >= 4) return 3;
    if (love >= 2) return 2;
    if (love >= 1) return 1;
    return 0;
  }

  function bindEvents() {
    el.dialogueBox.addEventListener("click", advanceScene);

    document.addEventListener("keydown", (e) => {
      // Title screen controls:
      // - Space/Enter no longer start the game on title; require clicking a button.
      if ((e.key === " " || e.key === "Enter") && titleVisible()) {
        e.preventDefault();
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        if (!state.awaitingChoice) {
          e.preventDefault();
          advanceScene();
        }
      }
      // Dev toggle: double-press D within 300ms
      if (e.key && e.key.toLowerCase() === "d") {
        const now = performance.now();
        if (state._lastD && (now - state._lastD) < 300) {
          if (state.hard && state.day === 14) {
            toast("Dev Console is disabled for Hard Mode!");
          } else {
            toggleDev();
          }
          state._lastD = 0; // reset
        } else {
          state._lastD = now;
        }
      }
      // Hard Mode toggle: press H on title screen only (new game)
      if (e.key && e.key.toLowerCase() === "h" && titleVisible()) {
        toggleHardMode();
      }
      // Mute toggle (M)
      if (e.key && e.key.toLowerCase() === "m") {
        toggleMute();
      }
    });

    // Remove click-anywhere to start on title; user must press a button now.
    // document.addEventListener("click", (e) => {
    //   if (titleVisible()) {
    //     hideTitleAndStart();
    //   }
    // });

    el.devToggle.addEventListener("click", () => {
      if (state.hard && state.day === 14) {
        toast("Dev Console is disabled for Hard Mode!");
        return;
      }
      toggleDev();
    });
    if (el.muteToggle) {
      const updateMuteIcon = () => {
        const muted = audio.muted;
        el.muteToggle.setAttribute("aria-pressed", String(muted));
        el.muteToggle.title = muted ? "Unmute (M)" : "Mute (M)";
        el.muteToggle.setAttribute("data-icon", muted ? "muted" : "unmuted");
        const span = el.muteToggle.querySelector(".icon");
        if (span) span.textContent = muted ? "🔇" : "🔊";
      };
      el.muteToggle.addEventListener("click", () => {
        toggleMute();
        updateMuteIcon();
      });
      // initialize icon on load
      updateMuteIcon();
    }

    el.applyLove.addEventListener("click", () => {
      state.love.ryu = parseInt(el.ryuLove.value || "0", 10);
      state.love.haruto = parseInt(el.harutoLove.value || "0", 10);
      state.love.kaoru = parseInt(el.kaoruLove.value || "0", 10);
      saveState();
      refreshHUD();
    });

    el.nextDay.addEventListener("click", () => {
      // Dev Next Day should skip the reflection dialogue and just advance the calendar/state.
      // Equivalent to running the tail of endOfDay() after its queued scene completes:
      //   state.day -= 1; saveState(); refreshHUD(); syncDevPanel(); then either checkEnding or startDay.
      state.day -= 1;
      saveState();
      refreshHUD();
      syncDevPanel();
      if (state.day <= 0) {
        checkEnding(true);
      } else {
        startDay();
      }
    });

    el.forceEnd.addEventListener("click", () => {
      checkEnding(true);
    });

    el.resetGame.addEventListener("click", resetGame);
  }

  function toggleDev() {
    // Completely disabled in Hard Mode at the start of a new game (title or day 14)
    if (state.hard && state.day === 14) {
      toast("Dev Console is disabled for Hard Mode!");
      return;
    }
    state.dev = !state.dev;
    el.devPanel.classList.toggle("hidden", !state.dev);
    el.devPanel.setAttribute("aria-hidden", state.dev ? "false" : "true");
    syncDevPanel();
  }

  function resetGame() {
    state.day = 14;
    state.love.ryu = 0;
    state.love.haruto = 0;
    state.love.kaoru = 0;
    state.progress.ryu = -1;
    state.progress.haruto = -1;
    state.progress.kaoru = -1;
    state.sceneQueue = [];
    state.onSceneComplete = null;
    state.awaitingChoice = false;
    saveState();
    showOnly();
    refreshHUD();
    // Return to title screen on reset
    // Stop any non-title tracks, play title music, and reveal title
    audioStop("bg");
    audioPlayLoop("title");
    const node = document.getElementById("titleScreen");
    if (node) node.classList.remove("hidden");
    showBackgroundFor("title");
  }

  // Audio
  const audio = {
    title: new Audio("music/bg_title.mp3"),
    bg: new Audio("music/bg_music.mp3"),
    christmas: new Audio("music/bg_christmas.mp3"),
    haruto: new Audio("music/haruto_theme.mp3"),
    kaoru: new Audio("music/kaoru_theme.mp3"),
    ryu: new Audio("music/ryu_theme.mp3"),
    muted: false,
    ready: false,
  };

  function setupAudio() {
    for (const key of ["title","bg","christmas","haruto","kaoru","ryu"]) {
      const a = audio[key];
      a.loop = true;
      a.preload = "auto";
      a.volume = 0.7;
    }
    // Load persisted mute preference
    try {
      const persisted = localStorage.getItem("xmas14_muted");
      if (persisted === "1") {
        audio.muted = true;
        for (const k of ["title","bg","christmas","haruto","kaoru","ryu"]) {
          audio[k].muted = true;
        }
      }
    } catch (e) {}
    audio.ready = true;
    // On some browsers, autoplay is blocked until user gesture. We start title music
    // only when the title is visible and after first gesture (handled in hideTitleAndStart).
    // Initialize HUD mute icon, if present
    const btn = document.getElementById("muteToggle");
    if (btn) {
      const muted = audio.muted;
      btn.setAttribute("aria-pressed", String(muted));
      btn.title = muted ? "Unmute (M)" : "Mute (M)";
      btn.setAttribute("data-icon", muted ? "muted" : "unmuted");
      const span = btn.querySelector(".icon");
      if (span) span.textContent = muted ? "🔇" : "🔊";
    }
  }

  function audioPlayLoop(key) {
    if (!audio.ready) return;
    const a = audio[key];
    if (!a) return;
    if (audio.muted) {
      a.pause();
      a.currentTime = 0;
      return;
    }
    if (a.paused) {
      a.currentTime = a.currentTime || 0;
      // try/catch in case autoplay is blocked; it's fine to fail silently
      a.play().catch(() => {});
    }
  }

  // Crossfade between tracks
  function crossfadeTo(targetKey, opts) {
    if (!audio.ready) return;
    const duration = (opts && typeof opts.duration === "number") ? opts.duration : 800; // ms
    const target = audio[targetKey];
    if (!target) return;

    // Determine currently playing tracks (not paused and volume > 0)
    const keys = ["title","bg","christmas","haruto","kaoru","ryu"];
    const now = performance.now();
    const startVolumes = {};
    const activeKeys = [];
    for (const k of keys) {
      const a = audio[k];
      if (!a) continue;
      // collect any that are not fully silent
      if (!a.paused && a.currentTime > 0 && a.volume > 0.001) {
        activeKeys.push(k);
        startVolumes[k] = a.volume;
      }
    }

    // If target is among active and it's the only one, nothing to do.
    if (activeKeys.length === 1 && activeKeys[0] === targetKey) return;

    // Ensure target is playing at 0 volume, then fade in.
    const prevTargetVol = target.volume;
    target.volume = 0;
    target.loop = true;
    if (target.paused && !audio.muted) {
      target.play().catch(() => {});
    }

    const fadeStep = () => {
      const t = performance.now();
      const p = Math.min(1, (t - start) / duration);
      // ease (cosine)
      const e = 0.5 - 0.5 * Math.cos(Math.PI * p);

      // fade in target from 0 to its previous/default volume (cap at 0.7 like setup)
      const desiredMax = Math.min(prevTargetVol || 0.7, 0.9);
      target.volume = desiredMax * e;

      // fade out others
      for (const k of activeKeys) {
        if (k === targetKey) continue;
        const a = audio[k];
        const sv = startVolumes[k] ?? 0.7;
        const vol = sv * (1 - e);
        a.volume = Math.max(0, vol);
        if (p >= 1) {
          a.pause();
          a.currentTime = 0;
          a.volume = sv; // reset to original for next time
        }
      }

      if (p < 1) {
        requestAnimationFrame(fadeStep);
      } else {
        // ensure target at desired volume at end
        target.volume = desiredMax;
      }
    };

    const start = now;
    requestAnimationFrame(fadeStep);
  }

  function audioStop(key) {
    const a = audio[key];
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }

  function toggleMute() {
    audio.muted = !audio.muted;
    // persist preference
    try {
      localStorage.setItem("xmas14_muted", audio.muted ? "1" : "0");
    } catch (e) {}
    for (const k of ["title","bg","christmas"]) {
      const a = audio[k];
      a.muted = audio.muted;
      if (audio.muted) {
        a.pause();
      } else {
        // resume appropriate track based on UI state
        if (titleVisible()) {
          audioPlayLoop("title");
        } else {
          // If we're in a christmas background, prefer christmas
          const bg = document.getElementById("background");
          // naive check: background image path includes bg_christmas
          const style = bg ? (bg.style.backgroundImage || "") : "";
          if (style.includes("bg_christmas")) audioPlayLoop("christmas");
          else audioPlayLoop("bg");
        }
      }
    }
  }

  // Utils

  function byId(id) { return document.getElementById(id); }
  function qs(sel) { return document.querySelector(sel); }

  function titleCase(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Toast helper for brief on-screen messages
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.style.position = "fixed";
      t.style.left = "50%";
      t.style.bottom = "24px";
      t.style.transform = "translateX(-50%)";
      t.style.background = "rgba(0,0,0,0.85)";
      t.style.color = "#fff";
      t.style.padding = "10px 14px";
      t.style.borderRadius = "10px";
      t.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
      t.style.zIndex = "9999";
      t.style.fontWeight = "700";
      t.style.pointerEvents = "none";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "0";
    t.style.transition = "opacity 200ms ease";
    requestAnimationFrame(() => {
      t.style.opacity = "1";
      setTimeout(() => {
        t.style.opacity = "0";
      }, 1600);
    });
  }

  // Toggle Hard Mode – only allowed at title/new game (day === 14)
  function toggleHardMode() {
    if (state.day !== 14) return; // only at start of new game
    state.hard = !state.hard;
    saveState();
    refreshHUD();
    toast(state.hard ? "Hard Mode enabled" : "Hard Mode disabled");
    // Update title hint visibility to reflect state
    try {
      const hint = document.querySelector(".title-hardmode-hint");
      if (hint) {
        if (state.hard) {
          hint.classList.add("active");
          hint.setAttribute("aria-hidden", "false");
        } else {
          hint.classList.remove("active");
          hint.setAttribute("aria-hidden", "true");
        }
      }
    } catch (e) {}
  }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickOne(list) {
    return list[Math.floor(state.rng() * list.length)];
  }

  function orderIndex(key) {
    return { ryu: 0, haruto: 1, kaoru: 2 }[key] ?? 99;
  }

  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
  }

})();