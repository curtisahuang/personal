// Present Clicker configuration: producers.
// Split out from main game logic for easier editing.

window.PRESENT_CLICKER_PRODUCERS = [
  {
    id: "assistant_elf",
    name: "Assistant Elf",
    description: "Anxious elf who clicks for you once per second.",
    flavor: "HR insists they are \"volunteers\".",
    type: "assistant",
    baseCost: 15,
    costMultiplier: 1.15,
    basePps: 1,
    unlockAtPresents: 0
  },
  {
    id: "small_workshop",
    name: "Small Workshop",
    description: "A cozy workshop with questionable fire exits.",
    flavor: "Smells like cocoa and industrial solvent.",
    type: "factory",
    baseCost: 100,
    costMultiplier: 1.15,
    basePps: 5,
    unlockAtPresents: 50
  },
  {
    id: "assembly_line",
    name: "Automated Assembly Line",
    description: "Robots lovingly tighten bow #2,471,334.",
    flavor: "The safety manual is just the word \"Don’t\".",
    type: "factory",
    baseCost: 1000,
    costMultiplier: 1.17,
    basePps: 25,
    unlockAtPresents: 400
  },
  {
    id: "offshore_sweatshop",
    name: "Offshore Sweatshop",
    description: "The clouds outside are mostly exhaust.",
    flavor: "Santa calls it \"remote working\".",
    type: "factory",
    baseCost: 15000,
    costMultiplier: 1.18,
    basePps: 150,
    unlockAtPresents: 5000
  },
  {
    id: "interdimensional_warehouse",
    name: "Interdimensional Fulfillment Center",
    description: "Packages ship before they are ordered.",
    flavor: "Time zones are more of a suggestion.",
    type: "factory",
    baseCost: 250000,
    costMultiplier: 1.2,
    basePps: 2000,
    unlockAtPresents: 100000
  },
  {
    id: "ritual_circle",
    name: "Ritual Circle",
    description: "You do not remember this from Elf School.",
    flavor: "Produces gifts and an uneasy humming noise.",
    type: "ritual",
    baseCost: 5000000,
    costMultiplier: 1.25,
    basePps: 100000,
    unlockAtPps: 1000000,
    requiresFlag: "dyslexiaUnlocked"
  },
  {
    id: "abandoned_mall_ritual",
    name: "Abandoned Mall Summoning",
    description: "The food court chants in perfect harmony.",
    flavor: "Ho ho ho becomes something else entirely.",
    type: "ritual",
    baseCost: 50000000,
    costMultiplier: 1.3,
    basePps: 1000000,
    unlockAtPps: 2000000,
    requiresFlag: "dyslexiaUnlocked"
  },
  {
    id: "infernal_reindeer_ranch",
    name: "Infernal Reindeer Ranch",
    description: "Flaming-hoofed reindeer haul presents through molten chimneys.",
    flavor: "The hooves jingle and clatter. The smoke smells like cinnamon and brimstone.",
    type: "ritual",
    baseCost: 500000000,
    costMultiplier: 1.32,
    basePps: 8000000,
    unlockAtPps: 20000000,
    requiresFlag: "dyslexiaUnlocked"
  },
  {
    id: "krampus_call_center",
    name: "Krampus Call Center",
    description: "Every unanswered complaint fuels another cursed gift shipment.",
    flavor: "Hold music alternates between carols and distant, echoing chains.",
    type: "ritual",
    baseCost: 2500000000,
    costMultiplier: 1.35,
    basePps: 60000000,
    unlockAtPps: 80000000,
    requiresFlag: "dyslexiaUnlocked"
  },
  {
    id: "hellmouth_distribution_node",
    name: "Hellmouth Distribution Node",
    description: "A rift in the floor spits out perfectly wrapped packages and sparks.",
    flavor: "You are advised not to look directly into the loading bay.",
    type: "ritual",
    baseCost: 12000000000,
    costMultiplier: 1.38,
    basePps: 450000000,
    unlockAtPps: 320000000,
    requiresFlag: "dyslexiaUnlocked"
  },
  {
    id: "santa_demon_council",
    name: "Council of Santas-Demonic",
    description: "Infinite red suits, infinite contracts, finite worker rights.",
    flavor: "Their bells ring in perfect, oppressive unison.",
    type: "ritual",
    baseCost: 65000000000,
    costMultiplier: 1.42,
    basePps: 3000000000,
    unlockAtPps: 1300000000,
    requiresFlag: "dyslexiaUnlocked"
  }
];