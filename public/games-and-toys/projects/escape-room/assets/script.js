// Mnemosyne Observatory — Text Escape Room
document.addEventListener("DOMContentLoaded", () => {
  const out = document.getElementById("output");
  const form = document.getElementById("command-form");
  const input = document.getElementById("command-input");
  const invSpan = document.getElementById("inv-list");
  const locSpan = document.getElementById("location");

  const state = {
    location: "Archivist's Antechamber",
    inventory: [],
    flags: {
      riddleSolved: false,
      haveBrassKey: false,
      deskUnlocked: false,
      haveNotebook: false,
      haveCard: false,
      logicSolved: false,
      terminalPowered: false,
      terminalAccessed: false,
      passphraseSolved: false,
      doorUnlocked: false,
      escaped: false
    }
  };

  const lower = (s) => (s || "").toLowerCase().trim();

  function print(text, cls) {
    const p = document.createElement("p");
    p.textContent = text;
    if (cls) p.classList.add(cls);
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
  }

  function echo(cmd) {
    print("> " + cmd, "echo");
  }

  function setLocation(name) {
    locSpan.textContent = name;
  }

  function updateInventory() {
    if (!state.inventory.length) {
      invSpan.textContent = "empty";
      return;
    }
    invSpan.innerHTML = state.inventory
      .map((it) => `<span class="item">${it}</span>`)
      .join(" ");
  }

  function intro() {
    setLocation(state.location);
    const lines = [
      "You surface from a dream of starfall into cold fluorescent dark.",
      "A low tremor passes through the deck. Somewhere, gravity argues with time.",
      "Welcome to the Mnemosyne Observatory: a derelict archive orbiting a dead star.",
      "Emergency locks sealed the access ways. The orbit is decaying, slowly... but not kindly.",
      "",
      "You are in the Archivist's Antechamber.",
    ];
    lines.forEach((l) => print(l, "system"));
    look();
    print('Type "help" for commands.', "system");
  }

  function look() {
    const f = state.flags;
    const desc = [];
    desc.push(
      "The antechamber is elliptical, its walls stitched with oxidized brass and star-charts gone green with age."
    );
    desc.push(
      "Dim red emergency strips breathe along the floor. Dust drifts like slow snow."
    );
    if (!f.riddleSolved) {
      desc.push(
        "To your left: a heavy brass mural inlaid with constellations. Words shimmer faintly across it."
      );
    } else {
      desc.push(
        "The brass mural stands silent; a small compartment above it sits ajar."
      );
    }
    desc.push(
      "Ahead: a steel desk. On it, a dormant terminal; its glass is dark. The desk drawer has a keyhole."
    );
    desc.push(
      "Right: a hinged power panel with three labeled switches: A, B, C."
    );
    desc.push(
      "The only exit is a pressure door. Its keypad blinks a patient red."
    );

    if (f.terminalPowered) {
      desc.push("The terminal hums softly, awaiting a passphrase.");
    }
    if (f.doorUnlocked) {
      desc.push("The door's indicator glows green. You could open it.");
    }
    desc.forEach((l) => print(l));
  }

  function help() {
    const lines = [
      "Commands:",
      "- look",
      "- inventory",
      '- inspect <thing>    (e.g., "inspect mural", "inspect panel")',
      '- take <item>        (e.g., "take key", "take notebook")',
      '- use <item> on <target>  (e.g., "use key on desk", "use key on door")',
      '- answer <text>      (reply to a riddle, e.g., "answer key")',
      '- use terminal       (approach the terminal)',
      '- enter passphrase <word>',
      '- set switches <up/down> <up/down> <up/down>',
      '- set a <up/down> b <up/down> c <up/down>',
      '- enter code <digits> on door',
      "- open door",
    ];
    lines.forEach((l) => print(l));
  }

  function has(item) {
    return state.inventory.includes(item);
  }

  function addItem(item) {
    if (!has(item)) {
      state.inventory.push(item);
      updateInventory();
      print(`You take the ${item}.`);
    } else {
      print("You already have that.");
    }
  }

  function inspect(whatRaw) {
    const what = lower(whatRaw);
    if (!what) {
      print("Inspect what?");
      return;
    }

    if (["room", "around", "area", "chamber", "antechamber"].includes(what)) {
      look();
      return;
    }

    if (what.includes("mural") || what.includes("constellation")) {
      if (!state.flags.riddleSolved) {
        print(
          'On the mural a line glows: "I turn once, what is out will not get in; I turn again, what is in will not get out. What am I?"'
        );
        print('You can "answer <word>" to respond.');
      } else {
        print("The mural is quiet, its riddle spent.");
      }
      return;
    }

    if (what.includes("desk") || what.includes("drawer")) {
      if (!state.flags.deskUnlocked) {
        print("A heavy desk. The drawer is locked; the keyhole gleams.");
        if (!state.flags.haveBrassKey) {
          print("You do not see any key nearby.");
        }
      } else {
        if (!state.flags.haveNotebook) {
          print(
            "The drawer is open. Inside are a slim notebook and a glossy card."
          );
          print('Try "take notebook" and "take card".');
        } else {
          print("The drawer is open, now empty.");
        }
      }
      return;
    }

    if (what.includes("panel") || what.includes("switch")) {
      print(
        "A power panel with three labeled switches: A, B, C. An inscription reads:"
      );
      print('"Exactly one switch is UP.');
      print(" If A is up, then B must be down.");
      print(' C mirrors A."');
      if (!state.flags.logicSolved) {
        print(
          'You can set them with "set switches <up/down> <up/down> <up/down>" (for A B C) or "set a down b up c down".'
        );
      } else {
        print("The switches are already set. The terminal has power.");
      }
      return;
    }

    if (what.includes("terminal") || what.includes("screen")) {
      if (!state.flags.terminalPowered) {
        print("The terminal is dark. It needs power.");
      } else if (!state.flags.passphraseSolved) {
        print('The terminal blinks: "Enter passphrase:"');
        print('Use "enter passphrase <word>".');
      } else {
        print("The terminal displays a solved prompt and an old status screen.");
      }
      return;
    }

    if (what.includes("door") || what.includes("keypad") || what.includes("exit")) {
      if (!state.flags.doorUnlocked) {
        print(
          "A sealed pressure door with a three-digit keypad. It watches with a single red LED."
        );
        print('You can "enter code <digits> on door" if you know it.');
      } else {
        print("The door indicator glows green. You could open it.");
      }
      return;
    }

    if (what.includes("notebook")) {
      if (!has("notebook")) {
        print("You don't have a notebook.");
      } else {
        print("Notebook (Archivist):");
        print(
          "Margins crowded with mnemonics. A glossary card is clipped inside."
        );
        print(
          "A note underlined twice: 'Memory overwrites memory — the word is palimpsest.'"
        );
      }
      return;
    }

    if (what.includes("card") || what.includes("glossary")) {
      if (!has("glossary card")) {
        print("You don't have a card.");
      } else {
        print("Glossary Card:");
        print(
          "palimpsest — a manuscript page from which the text has been scraped off and which can be used again."
        );
        print('It feels suspiciously like a passphrase.');
      }
      return;
    }

    print("You don't notice anything like that here.");
  }

  function answer(text) {
    const t = lower(text);
    if (!t) {
      print("Answer what?");
      return;
    }
    if (state.flags.riddleSolved) {
      print("The mural ignores you.");
      return;
    }
    if (t === "key") {
      state.flags.riddleSolved = true;
      state.flags.haveBrassKey = true;
      addItem("brass key");
      print(
        "With a soft click, a concealed niche in the mural opens and presents a small brass key."
      );
    } else {
      print("Nothing happens. The mural waits.");
    }
  }

  function take(whatRaw) {
    const what = lower(whatRaw);
    if (!what) {
      print("Take what?");
      return;
    }

    if (what.includes("key")) {
      if (state.flags.haveBrassKey) {
        if (!has("brass key")) addItem("brass key");
        else print("You already took the brass key.");
      } else {
        print("You don't see any key to take.");
      }
      return;
    }

    if (what.includes("notebook")) {
      if (!state.flags.deskUnlocked) {
        print("The drawer is still locked.");
      } else if (state.flags.haveNotebook) {
        print("You already took the notebook.");
      } else {
        state.flags.haveNotebook = true;
        addItem("notebook");
      }
      return;
    }

    if (what.includes("card")) {
      if (!state.flags.deskUnlocked) {
        print("The drawer is still locked.");
      } else if (state.flags.haveCard) {
        print("You already took the card.");
      } else {
        state.flags.haveCard = true;
        addItem("glossary card");
      }
      return;
    }

    print("You can't take that.");
  }

  function useOn(itemRaw, targetRaw) {
    const item = lower(itemRaw);
    const target = lower(targetRaw);

    if (!item || !target) {
      print("Use what on what?");
      return;
    }

    if (item.includes("key")) {
      if (!has("brass key")) {
        print("You don't have a key.");
        return;
      }
      if (target.includes("desk") || target.includes("drawer")) {
        if (!state.flags.deskUnlocked) {
          state.flags.deskUnlocked = true;
          print(
            "The brass key turns with satisfying resistance. The drawer slides open, revealing a notebook and a clipped glossary card."
          );
        } else {
          print("The drawer is already open.");
        }
        return;
      }
      if (target.includes("door")) {
        print(
          "The door has no physical keyhole — only a keypad. The key doesn't fit ideas."
        );
        return;
      }
    }

    if (item.includes("terminal")) {
      print("You can't use the terminal on anything.");
      return;
    }

    print("Nothing useful happens.");
  }

  function setSwitches(patternText) {
    const t = lower(patternText).replace(/[,]+/g, " ").replace(/\s+/g, " ").trim();

    // A B C sequence like "down up down"
    const simple = t.match(/\b(up|down)\b\s+\b(up|down)\b\s+\b(up|down)\b/);
    let a, b, c;

    if (simple) {
      [a, b, c] = [simple[1], simple[2], simple[3]];
    } else {
      // Pattern like "a down b up c down"
      const mA = t.match(/a\s+(up|down)/);
      const mB = t.match(/b\s+(up|down)/);
      const mC = t.match(/c\s+(up|down)/);
      if (mA && mB && mC) {
        a = mA[1];
        b = mB[1];
        c = mC[1];
      }
    }

    if (!a || !b || !c) {
      print(
        'Specify switch positions for A, B, C (e.g., "set switches down up down" or "set a down b up c down").'
      );
      return;
    }

    const solution = ["down", "up", "down"]; // A=down, B=up, C=down
    if ([a, b, c].join(",") === solution.join(",")) {
      if (!state.flags.logicSolved) {
        state.flags.logicSolved = true;
        state.flags.terminalPowered = true;
        print("The panel relays engage. Somewhere a fan catches. The terminal boots.");
      } else {
        print("The switches are already set correctly.");
      }
    } else {
      print("The panel buzzes and resets. That configuration fails the constraints.");
    }
  }

  function useTerminal() {
    if (!state.flags.terminalPowered) {
      print("You tap the dark glass. Nothing. No power.");
      return;
    }
    state.flags.terminalAccessed = true;
    if (!state.flags.passphraseSolved) {
      print('The terminal blinks a cursor: "Enter passphrase:"');
      print('Use "enter passphrase <word>".');
    } else {
      print("The terminal shows: ACCESS GRANTED. A maintenance prompt idles.");
    }
  }

  function enterPassphrase(raw) {
    if (!state.flags.terminalPowered) {
      print("The terminal is dark. Power first.");
      return;
    }
    const word = lower(raw || "");
    if (!word) {
      print("Enter which passphrase?");
      return;
    }
    if (word === "palimpsest") {
      if (!state.flags.passphraseSolved) {
        state.flags.passphraseSolved = true;
        print("ACCESS GRANTED.");
        print(
          "The terminal prints a final challenge for the door keypad:"
        );
        print(
          '"I am a three-digit number. My tens digit is four greater than my ones digit. My hundreds digit is twice my ones digit. What number am I?"'
        );
        print("Enter it on the door: enter code <digits> on door.");
      } else {
        print("Already authorized.");
      }
    } else {
      print("ACCESS DENIED.");
    }
  }

  function enterCodeOnDoor(codeRaw) {
    const code = (codeRaw || "").trim();
    if (!/^\d{3,6}$/.test(code)) {
      print("That doesn't look like a valid code.");
      return;
    }
    if (code === "673") {
      if (!state.flags.doorUnlocked) {
        state.flags.doorUnlocked = true;
        print("The keypad chirps green. The pressure seals unlock with a sigh.");
      } else {
        print("The door is already unlocked.");
      }
    } else {
      print("The keypad coughs a flat tone. Red light persists.");
    }
  }

  function openDoor() {
    if (!state.flags.doorUnlocked) {
      print("The door refuses to budge. It's still locked.");
      return;
    }
    if (!state.flags.escaped) {
      state.flags.escaped = true;
      print(
        "You haul the door wide. Cold corridor air rushes in, smelling of metal and ozone."
      );
      print(
        "Beyond, the Observatory wakes in stutters of light as systems feel your presence."
      );
      print(
        "You step through. Somewhere, memory starts writing itself again. You have escaped."
      );
      print("*** VICTORY ***", "system");
    } else {
      print("You already left this room behind.");
    }
  }

  function parse(cmd) {
    const raw = cmd;
    const s = lower(cmd);

    if (!s) return;

    // Exact commands
    if (/^(help|commands)$/.test(s)) return help();
    if (/^(look|l)$/.test(s)) return look();
    if (/^(inventory|inv|i)$/.test(s)) return updateInventory();

    // Inspect
    let m = s.match(/^(inspect|examine|look at)\s+(.+)$/);
    if (m) return inspect(m[2]);

    // Take
    m = s.match(/^(take|get|pick up)\s+(.+)$/);
    if (m) return take(m[2]);

    // Use X on Y
    m = s.match(/^use\s+(.+)\s+on\s+(.+)$/);
    if (m) return useOn(m[1], m[2]);

    // Answer <text>
    m = s.match(/^(answer|say|speak)\s+(.+)$/);
    if (m) return answer(m[2]);

    // Set switches
    m = s.match(/^set\s+(?:the\s+)?switch(?:es)?\s+(.+)$/);
    if (m) return setSwitches(m[1]);
    m = s.match(/^set\s+a\s+(up|down)\s+b\s+(up|down)\s+c\s+(up|down)$/);
    if (m) return setSwitches(`a ${m[1]} b ${m[2]} c ${m[3]}`);

    // Terminal
    if (/^(use\s+)?terminal$/.test(s)) return useTerminal();

    // Enter passphrase
    m = s.match(/^(?:enter\s+)?pass(?:phrase|code)\s+(.+)$/);
    if (m) return enterPassphrase(m[1]);

    // Enter code on door
    m = s.match(/^enter\s+(?:code\s+)?(\d{3,6})(?:\s+on\s+(?:door|keypad))?$/);
    if (m) return enterCodeOnDoor(m[1]);

    // Open door / exit
    if (/^(open|go|exit|leave)\s+(the\s+)?door$/.test(s) || /^open\s+door$/.test(s)) {
      return openDoor();
    }

    // Short forms
    if (s === "use key") {
      return print('Be specific: "use key on desk" or "use key on door".');
    }

    print("Nothing happens. Try 'help' for ideas.");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cmd = input.value.trim();
    if (!cmd) return;
    echo(cmd);
    parse(cmd);
    input.value = "";
    input.focus();
  });

  // Start game
  updateInventory();
  intro();
});