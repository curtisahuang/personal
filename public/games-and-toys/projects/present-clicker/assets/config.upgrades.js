// Present Clicker configuration: upgrades.
// Split out from main game logic for easier editing.

window.PRESENT_CLICKER_UPGRADES = [
  {
    id: "better_gloves",
    name: "Padded Mittens",
    description: "Clicking hurts less. Doubles presents per click.",
    cost: 50,
    effect: { type: "ppcMultiplier", value: 2 },
    unlock: { totalPresents: 20 }
  },
  {
    id: "carpal_tunnel",
    name: "Questionable Ergonomics",
    description: "You lean in. +1 present per click.",
    cost: 250,
    effect: { type: "ppcAdd", value: 1 },
    unlock: { totalPresents: 150 }
  },
  {
    id: "industrial_gloves",
    name: "Industrial Strength Gloves",
    description: "Your fingers are basically tiny forklifts now. +3 per click.",
    cost: 2500,
    effect: { type: "ppcAdd", value: 3 },
    unlock: { totalPresents: 1500 }
  },
  {
    id: "elf_adrenaline",
    name: "Elf Adrenaline Shots",
    description: "You stop blinking for a bit. Click output x3.",
    cost: 15000,
    effect: { type: "ppcMultiplier", value: 3 },
    unlock: { totalPresents: 10000 }
  },
  {
    id: "phantom_clicks",
    name: "Phantom Clicks",
    description: "You swear you're still clicking even when you’re not. +10 per click.",
    cost: 90000,
    effect: { type: "ppcAdd", value: 10 },
    unlock: { totalPresents: 60000 }
  },
  {
    id: "quantum_pointer",
    name: "Quantum Pointer Device",
    description: "Each click happens in several timelines. Click output x4.",
    cost: 750000,
    effect: { type: "ppcMultiplier", value: 4 },
    unlock: { totalPresents: 400000 }
  },
  {
    id: "saint_nick_knuckles",
    name: "Saint Nick’s Knuckles",
    description: "Your hand is now a festive blunt instrument. +50 per click.",
    cost: 3500000,
    effect: { type: "ppcAdd", value: 50 },
    unlock: { totalPresents: 2000000 }
  },
  {
    id: "chromatic_reindeer_energy",
    name: "Chromatic Reindeer Energy Drink",
    description: "Illegally caffeinated. Click output x5.",
    cost: 25000000,
    effect: { type: "ppcMultiplier", value: 5 },
    unlock: { totalPresents: 15000000 }
  },
  {
    id: "assistant_espresso_machine",
    name: "Elf Espresso Machine",
    description: "Assistant Elves discover triple-shot lattes. Assistants x2.",
    cost: 1200,
    effect: { type: "typeMultiplier", targetType: "assistant", value: 2 },
    unlock: { totalPresents: 800 }
  },
  {
    id: "assistant_clone_program",
    name: "Assistant Cloning Program",
    description: "It's not overtime if there are more of them. Assistant Elf output x3.",
    cost: 60000,
    effect: { type: "producerMultiplier", targetId: "assistant_elf", value: 3 },
    unlock: { totalPresents: 40000 }
  },
  {
    id: "workshop_bunkbeds",
    name: "Workshop Bunkbeds",
    description: "Nobody ever has to leave. Small Workshop output x2.",
    cost: 35000,
    effect: { type: "producerMultiplier", targetId: "small_workshop", value: 2 },
    unlock: { totalPresents: 25000 }
  },
  {
    id: "assembly_overclock",
    name: "Overclocked Assembly Lines",
    description: "The assembly lines start ignoring safety warnings. Assembly Lines x2.",
    cost: 150000,
    effect: { type: "producerMultiplier", targetId: "assembly_line", value: 2 },
    unlock: { totalPresents: 90000 }
  },
  {
    id: "sweatshop_global_sourcing",
    name: "Global Sourcing Anomaly",
    description: "Offshore Sweatshops find suppliers in places that shouldn’t exist. Output x2.",
    cost: 900000,
    effect: { type: "producerMultiplier", targetId: "offshore_sweatshop", value: 2 },
    unlock: { totalPresents: 550000 }
  },
  {
    id: "warehouse_non_euclidean_layout",
    name: "Non-Euclidean Shelving",
    description: "The Fulfillment Center folds space. Warehouse output x3.",
    cost: 7500000,
    effect: { type: "producerMultiplier", targetId: "interdimensional_warehouse", value: 3 },
    unlock: { totalPresents: 4000000 }
  },
  {
    id: "ritual_blood_signed_contracts",
    name: "Blood-Signed Contracts",
    description: "Ritual Circles bind a little tighter. Ritual output x2.",
    cost: 40000000,
    effect: { type: "typeMultiplier", targetType: "ritual", value: 2 },
    unlock: { pps: 500000 }
  },
  {
    id: "mall_food_court_entity",
    name: "Food Court Entity",
    description: "The Mall’s food court wakes up hungry for quotas. Mall Rituals x2.",
    cost: 150000000,
    effect: { type: "producerMultiplier", targetId: "abandoned_mall_ritual", value: 2 },
    unlock: { pps: 2500000 }
  },
  {
    id: "infernal_reindeer_anomaly",
    name: "Reindeer Flight Anomaly",
    description: "Infernal Reindeer Ranch tears shortcut paths through impossible chimneys. Ranch output x3.",
    cost: 2000000000,
    effect: { type: "producerMultiplier", targetId: "infernal_reindeer_ranch", value: 3 },
    unlock: { pps: 20000000 }
  },
  {
    id: "krampus_call_center_anomaly",
    name: "Complaint Echo Anomaly",
    description: "Every unresolved ticket echoes twice as loud. Krampus Call Center output x3.",
    cost: 9000000000,
    effect: { type: "producerMultiplier", targetId: "krampus_call_center", value: 3 },
    unlock: { pps: 100000000 }
  },
  {
    id: "hellmouth_distribution_anomaly",
    name: "Hellmouth Throughput Anomaly",
    description: "The Distribution Node yawns wider. Hellmouth output x3.",
    cost: 40000000000,
    effect: { type: "producerMultiplier", targetId: "hellmouth_distribution_node", value: 3 },
    unlock: { pps: 500000000 }
  },
  {
    id: "santa_council_anomaly",
    name: "Council Convergence Anomaly",
    description: "The Council of Santas overlap across realities. Council output x3.",
    cost: 200000000000,
    effect: { type: "producerMultiplier", targetId: "santa_demon_council", value: 3 },
    unlock: { pps: 2000000000 }
  },
  {
    id: "assistant_whip",
    name: "Ergonomic Whips",
    description: "Assistants work twice as fast.",
    cost: 200,
    effect: { type: "typeMultiplier", targetType: "assistant", value: 2 },
    unlock: { totalPresents: 100 }
  },
  {
    id: "overtime",
    name: "Mandatory Overtime",
    description: "Factories run hotter. Factory output x2.",
    cost: 5000,
    effect: { type: "typeMultiplier", targetType: "factory", value: 2 },
    unlock: { totalPresents: 2000 }
  },
  {
    id: "time_dilation",
    name: "North Pole Time Dilation",
    description: "Hours stretch. Global output x2.",
    cost: 100000,
    effect: { type: "globalMultiplier", value: 2 },
    unlock: { totalPresents: 50000 }
  },
  {
    id: "click_fingerprint_removal",
    name: "Click Fingerprint Removal Service",
    description: "No paper trail, no pointer trail. Presents per click +25.",
    cost: 750000,
    effect: { type: "ppcAdd", value: 25 },
    unlock: { totalPresents: 300000 }
  },
  {
    id: "shift_splitter",
    name: "Shift Splitter Algorithm",
    description: "You and your schedule are both in two places at once. Global output x1.5.",
    cost: 2500000,
    effect: { type: "globalMultiplier", value: 1.5 },
    unlock: { totalPresents: 1500000 }
  },
  {
    id: "ghost_shift",
    name: "Unscheduled Ghost Shift",
    description: "A mysterious third shift clocks in under 'Other'. Factory output x1.75.",
    cost: 8000000,
    effect: { type: "typeMultiplier", targetType: "factory", value: 1.75 },
    unlock: { totalPresents: 4000000 }
  },
  {
    id: "compliance_wreaths",
    name: "Compliance Wreaths",
    description: "Festive signage reminds everyone rules are for elves, not quotas. Ritual output x1.5.",
    cost: 35000000,
    effect: { type: "typeMultiplier", targetType: "ritual", value: 1.5 },
    unlock: { pps: 250000 }
  },
  {
    id: "holiday_spin",
    name: "Holiday Spin Department",
    description: "Rebrands 'crunch' as 'tradition'. Global output x1.5.",
    cost: 150000000,
    effect: { type: "globalMultiplier", value: 1.5 },
    unlock: { pps: 1500000 }
  },
  {
    id: "inventory_singularity",
    name: "Inventory Singularity Closet",
    description: "One closet, all stock. Factories and warehouses output x1.5.",
    cost: 600000000,
    effect: { type: "typeMultiplier", targetType: "factory", value: 1.5 },
    unlock: { pps: 8000000 }
  },
  {
    id: "elf_therapy_pamphlet",
    name: "Elf Therapy Pamphlet (Unread)",
    description: "Acknowledging burnout counts as a productivity initiative. Assistants x1.5.",
    cost: 900000000,
    effect: { type: "typeMultiplier", targetType: "assistant", value: 1.5 },
    unlock: { pps: 12000000 }
  },
  {
    id: "dyslexia",
    name: "Dyslexia: ???",
    description: "You misread \"Santa\" as \"Satan\" and keep reading.",
    cost: 40000000,
    effect: { type: "setFlag", flag: "dyslexiaUnlocked", value: true },
    unlock: { pps: 1000000 }
  }
];