document.addEventListener("DOMContentLoaded", () => {
  const el = {
    creativity: document.getElementById("creativity"),
    generate: document.getElementById("generate"),
    name: document.getElementById("drink-name"),
    technique: document.getElementById("technique"),
    glassware: document.getElementById("glassware"),
    ingredientsList: document.getElementById("ingredients-list"),
    instructionsList: document.getElementById("instructions-list"),
    garnish: document.getElementById("garnish-text"),
  };

  // Name parts
  const adjectives = [
    "Arcane", "Velvet", "Gilded", "Electric", "Nocturnal", "Nebulous", "Opulent", "Vivid", "Silent", "Savage", "Lucid", "Cosmic", "Crimson", "Ivory", "Auric", "Cerulean", "Emerald", "Onyx", "Ivory", "Azure",
    "Obsidian", "Baroque", "Deco", "Quantum", "Ethereal", "Twilight", "Dusky", "Gossamer", "Sable", "Viridian", "Amber", "Smoky", "Glacial", "Solar", "Lunar", "Prismatic", "Rogue", "Velour", "Silken", "Haunted",
    "Arcadian", "Candescent", "Serpentine", "Mythic", "Tempest", "Candescent", "Enigmatic", "Radiant", "Gloomy", "Brazen", "Dapper", "Sprightly", "Charmed", "Feral", "Wild", "Frosted", "Glossy", "Savory", "Grinning",
    "Barbaric", "Scarlet", "Indigo", "Vermilion", "Coral", "Virile", "Steely", "Gothic", "Euphoric", "Hypnotic", "Jubilant", "Magnetic", "Noble", "Arcane", "Civic", "Palatial", "Ritual", "Majestic", "Monolithic",
    "Nebula", "Galactic", "Orbital", "Solar", "Stellar", "Secret", "Hidden", "Vagrant", "Wandering", "Nomadic", "Royal", "Imperial", "Velveteen", "Spangled", "Gilded", "Lavish", "Opaline", "Shimmering", "Sublime",
    "Citrine", "Topaz", "Amethyst", "Ruby", "Sapphire", "Silent", "Seaborne", "Windborne", "Thunderous", "Echoing", "Drifting", "Feathered", "Barrel-Aged"
  ];

  const nouns = [
    "Comet", "Cactus", "Panther", "Mirage", "Orchid", "Jackal", "Anchor", "Chalice", "Abyss", "Monolith", "Horizon", "Mosaic", "Specter", "Paradox", "Tempest", "Lantern", "Circuit", "Dagger", "Glass",
    "Lion", "Dragon", "Phoenix", "Serpent", "Griffin", "Obelisk", "Harbor", "Sphinx", "Crown", "Palace", "Quarry", "Meridian", "Cavalier", "Oracle", "Nightingale", "Vessel", "Cipher", "Mask", "Vortex", "Atlas",
    "Echo", "Labyrinth", "Pyramid", "Canticle", "Aria", "Riddle", "Nebula", "Traveler", "Nomad", "Harlequin", "Fountain", "Galleon", "Spire", "Curtain", "Prism", "Bastion", "Paragon", "Zephyr", "Opus",
    "Velum", "Talisman", "Crescent", "Standard", "Banner", "Relic", "Chimera", "Idol", "Script", "Vista", "Monsoon", "Compass", "Throne", "Sepulcher", "Cathedral", "Pagoda", "Crypt", "Gallery", "Arcade", "Aviary",
    "Sanctum", "Palimpsest", "Garnet", "Topaz", "Amethyst", "Ruby", "Sapphire", "Obsidian", "Onyx", "Ivory", "Caravel", "Embassy", "Harbinger", "Caldera", "Arboretum", "Kite", "Tornado", "Ziggurat", "Echelon"
  ];

  // Spirits: include broad types (base alcohol can be spirit, fortified wine, liqueur, or even beer)
  const spirits = [
    "Vodka", "Gin", "London Dry Gin", "Old Tom Gin", "Navy Strength Gin", "Genever",
    "White Rum", "Gold Rum", "Dark Rum", "Aged Rum", "Spiced Rum", "Overproof Rum", "Rhum Agricole", "Cachaça",
    "Blanco Tequila", "Reposado Tequila", "Añejo Tequila", "Mezcal", "Sotol", "Raicilla",
    "Whiskey", "Bourbon", "Rye Whiskey", "Scotch Whisky", "Islay Scotch", "Irish Whiskey", "Japanese Whisky", "Canadian Whisky", "Tennessee Whiskey",
    "Brandy", "Cognac", "Armagnac", "Calvados", "Applejack", "Pisco", "Grappa", "Kirschwasser", "Slivovitz", "Pear Eau-de-vie",
    "Aquavit", "Ouzo", "Pastis", "Absinthe",
    "Sake", "Nigori Sake", "Shochu", "Soju", "Baijiu",
    "Arak", "Raki",
    "Amaro Averna", "Amaro Montenegro", "Fernet Branca", "Campari", "Aperol", "Cynar",
    "Green Chartreuse", "Yellow Chartreuse", "Bénédictine", "Drambuie", "Galliano", "Frangelico", "Elderflower Liqueur",
    "Triple Sec", "Cointreau", "Grand Marnier", "Blue Curaçao", "Maraschino Liqueur", "Amaretto", "Chambord", "Cherry Heering", "Limoncello", "Sloe Gin",
    "Dry Vermouth", "Sweet Vermouth", "Fino Sherry", "Amontillado Sherry", "Oloroso Sherry", "Tawny Port", "Madeira", "Marsala",
    "Umeshu Plum Wine", "Red Wine", "White Wine", "Sparkling Wine",
    "Pale Ale", "Pilsner", "Stout"
  ];

  // Sours / bitters: classic + experimental + wild
  const sourClassic = [
    "Fresh lemon juice", "Fresh lime juice", "Fresh grapefruit juice", "Fresh orange juice", "Pineapple juice",
    "Cranberry juice", "Passion fruit juice", "Pomegranate juice", "Sour cherry juice", "Green apple juice",
    "Blood orange juice", "Blackcurrant juice", "Red currant juice", "Yuzu juice", "Calamansi juice",
    "Verjus (unripe grape juice)", "Tamarind water", "Rhubarb juice",
    "White grape juice (tart)", "Gooseberry juice", "Cloudberry juice",
    "Citrus shrub", "Raspberry shrub", "Strawberry shrub", "Blackberry shrub", "Grapefruit shrub",
    "Cranberry shrub", "Ginger shrub", "Cherry shrub", "Hibiscus tea (tart)", "Unsweetened iced tea with lemon",
    "Tonic water", "Cold brew coffee (bitter)", "Espresso (bitter)", "Gentian tea (bitter)", "Dandelion tea",
    "Unsweetened kombucha", "Sparkling water with lemon", "Grapefruit tonic", "Sour plum infusion", "Sorrel tea"
  ];

  const sourExperimental = [
    "Apple cider vinegar", "Rice vinegar", "Champagne vinegar", "White balsamic vinegar",
    "Pickle brine", "Dill pickle brine", "Olive brine", "Caper brine",
    "Kimchi brine", "Sauerkraut brine",
    "Celery juice", "Carrot juice", "Beet juice",
    "Hibiscus concentrate", "Cranberry-ginger shrub", "Sumac water", "Black lemon tea",
    "Tamarind-lime shrub", "Rhubarb shrub", "Grapefruit-lavender shrub",
    "Green tea kombucha", "Ginger kombucha",
    "Verjus rouge", "Sour orange juice", "Unsweetened tepache (pineapple ferment)"
  ];

  const sourWild = [
    "Umeboshi brine", "Ponzu (citrus soy) dash", "Pickled watermelon rind brine", "Pickled jalapeño brine",
    "Pickled ginger brine", "Yuzu kosho brine", "Black garlic vinegar", "Charcoal lemonade",
    "Sea buckthorn juice", "Gooseberry shrub", "Cloudberry shrub", "Red cabbage shrub",
    "Fermented kefir whey", "Lactart (acid phosphate)", "Bitter melon juice",
    "Tomato shrub", "Celery shrub", "Cucumber shrub",
    "Pickled mustard greens brine", "Kimchi liquid", "Oyster liquor (brine)", "Sauce gribiche brine", "Pickled daikon brine",
    "Cranberry verjus", "Sour cherry vinegar"
  ];

  // Sweets: classic + experimental + wild (liquor allowed here)
  const sweetClassic = [
    "Simple syrup (1:1)", "Rich syrup (2:1)", "Demerara syrup", "Honey syrup", "Maple syrup", "Agave syrup",
    "Grenadine", "Orgeat (almond)", "Velvet Falernum", "Vanilla syrup", "Cinnamon syrup", "Ginger syrup",
    "Cream of coconut", "Coconut syrup", "Passion fruit syrup", "Strawberry syrup", "Raspberry syrup", "Blackberry syrup",
    "Blueberry syrup", "Peach syrup", "Pear syrup", "Mango syrup", "Pineapple syrup", "Banana syrup",
    "Caramel syrup", "Chocolate syrup", "White chocolate syrup", "Elderflower cordial",
    "Triple Sec", "Cointreau", "Orange Curaçao", "Grand Marnier", "Maraschino liqueur",
    "Amaretto", "Frangelico", "Chambord", "Limoncello", "Crème de cassis", "Crème de mûre", "Crème de cacao",
    "Rock candy syrup", "Demarara gum syrup"
  ];

  const sweetExperimental = [
    "Tamarind syrup", "Hibiscus syrup", "Rose syrup", "Lavender syrup", "Jasmine syrup", "Chamomile syrup",
    "Brown butter syrup", "Smoked maple syrup", "Molasses", "Date syrup", "Fig syrup",
    "Toasted sesame syrup", "Black sesame syrup", "Pistachio syrup", "Pecan syrup", "Chestnut syrup",
    "Pine syrup", "Spruce tip syrup", "Beet syrup", "Carrot syrup", "Sweet corn syrup",
    "Vanilla bean oleo saccharum", "Gingerbread syrup", "Apple pie syrup", "Salted honey syrup"
  ];

  const sweetWild = [
    "Durian syrup", "Marshmallow syrup", "Cotton candy (dissolved)", "Gummy bear syrup", "Bubblegum syrup",
    "Miso caramel syrup", "Kecap manis (sweet soy) dash", "Balsamic caramel", "Salted licorice syrup",
    "Black garlic honey", "Amazake (sweet fermented rice)", "Ube syrup", "Pandan syrup",
    "Cereal milk syrup", "Popcorn syrup", "Roasted tomato syrup", "Caramelized onion syrup",
    "Hojicha syrup", "Matcha syrup", "Sorghum syrup", "Sarsaparilla syrup",
    "Watermelon jam", "Banana foster syrup", "Curry leaf syrup", "Rose-raspberry syrup"
  ];

  // Garnishes: classic + experimental + wild (food-focused)
  const garnishClassic = [
    "Lemon twist", "Orange twist", "Grapefruit twist", "Lime wheel", "Lemon wheel", "Orange wheel",
    "Grapefruit wedge", "Orange slice", "Lime wedge", "Pineapple wedge",
    "Brandied cherry", "Maraschino cherry", "Cocktail onion", "Castelvetrano olive",
    "Mint sprig", "Basil leaf", "Rosemary sprig", "Thyme sprig",
    "Cucumber ribbon", "Dehydrated citrus wheel", "Grated nutmeg", "Cinnamon stick", "Cocoa dust",
    "Grated chocolate", "Edible flower", "Star anise", "Cracked black pepper",
    "Sugar rim", "Salt rim", "Chili-salt rim", "Smoked salt rim",
    "Apple fan", "Pear slice", "Blackberry skewer", "Strawberry fan", "Blueberry skewer", "Grape cluster",
    "Orange peel flame", "Candied orange peel", "Candied ginger", "Toasted coconut flakes", "Dehydrated apple chip",
    "Pink peppercorn dust", "Chili-sesame sprinkle", "Caperberry", "Pickled jalapeño", "Charcoal salt rim", "Cucumber chili dust"
  ];

  const garnishExperimental = [
    "Edible gold leaf", "Coffee beans", "Cereal crumble", "Popcorn",
    "Bacon strip", "Cheese crisp", "Pickled okra", "Pickled pearl onion",
    "Nori sheet", "Nori crisp", "Dulse crisp", "Seaweed frond",
    "Pine sprig", "Spruce tip", "Fir tree sprig", "Charred rosemary",
    "Dehydrated beet chip", "Dehydrated carrot chip", "Lotus root chip", "Rice cracker",
    "Pumpkin seed brittle", "Sesame brittle", "Coconut macaroon", "Black sesame tuile",
    "Activated charcoal dust"
  ];

  const garnishWild = [
    "Salmon slice", "Oyster on shell", "Quail egg", "Pickled quail egg",
    "Anchovy fillet", "Sardine fillet", "Beef jerky strip", "Dried squid",
    "Kimchi leaf", "Pickled daikon", "Pickled radish", "Pickled garlic clove",
    "Preserved lemon wedge", "Fermented black garlic clove",
    "Dried chili bouquet", "Wasabi pea skewer", "Nopal strip", "Mushroom skewer",
    "Charred corn kernel skewer", "Sweet mochi cube", "Rice cracker tower",
    "Pickled watermelon rind", "Cucumber ribbon with chili oil", "Gobo (burdock) chip",
    "Toasted nori shards"
  ];

  // Extras (optional: bitters or other additions)
  const extrasBitters = [
    "Angostura bitters", "Orange bitters", "Grapefruit bitters", "Peychaud's bitters", "Chocolate bitters",
    "Celery bitters", "Cherry bitters", "Black walnut bitters", "Rhubarb bitters", "Mole bitters",
    "Coffee bitters", "Cardamom bitters", "Aromatic bitters", "Saffron bitters", "Chamomile bitters"
  ];

  const extrasOther = [
    "Egg white", "Aquafaba",
    "Soda water top", "Ginger beer top", "Sparkling wine top", "Tonic water top", "Coconut water top", "Yuzu soda top",
    "Absinthe rinse", "Peated Scotch rinse",
    "Orange blossom water spritz", "Rosewater spritz", "Smoked glass (rosemary)",
    "Dry vermouth (dash)", "Saline solution (small dash)", "Hot sauce (dash)", "Espresso (dash)", "Pickle brine (dash)",
    "Activated charcoal (pinch)", "Mint leaves (muddle)", "Basil leaves (muddle)"
  ];

  const glassware = [
    "Coupe", "Nick & Nora", "Rocks glass", "Double rocks", "Highball", "Collins", "Martini glass", "Tulip", "Tiki mug"
  ];

  const techniques = ["Shaken", "Stirred", "Blended"];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const coinFlip = (p = 0.5) => Math.random() < p;
  const contains = (txt, sub) => (txt || "").toLowerCase().includes(sub.toLowerCase());

  function tierForCreativity(val) {
    const v = Number(val);
    if (v < 34) return "classic";
    if (v < 67) return "experimental";
    return "wild";
  }

  function poolFor(category, creativity) {
    const tier = tierForCreativity(creativity);
    if (category === "sour") {
      if (tier === "classic") return sourClassic;
      if (tier === "experimental") return sourClassic.concat(sourExperimental);
      return sourClassic.concat(sourExperimental, sourWild);
    }
    if (category === "sweet") {
      if (tier === "classic") return sweetClassic;
      if (tier === "experimental") return sweetClassic.concat(sweetExperimental);
      return sweetClassic.concat(sweetExperimental, sweetWild);
    }
    if (category === "garnish") {
      if (tier === "classic") return garnishClassic;
      if (tier === "experimental") return garnishClassic.concat(garnishExperimental);
      return garnishClassic.concat(garnishExperimental, garnishWild);
    }
    return [];
  }

  function generateName() {
    return `${pick(adjectives)} ${pick(nouns)}`;
  }

  function techniqueFor() {
    // Bias against blending slightly
    const roll = Math.random();
    if (roll < 0.45) return "Shaken";
    if (roll < 0.90) return "Stirred";
    return "Blended";
  }

  function buildInstructions({ technique, glass, garnish, extra, useExtra, useBitters, hasEggWhite, tier }) {
    const steps = [];
    const garnishLower = (garnish || "").toLowerCase();
    const extraLower = (extra || "").toLowerCase();

    const hasRim = /rim/.test(garnishLower);
    const hasTwistOrPeel = /(twist|peel)/.test(garnishLower);
    const isFlamePeel = /flame/.test(garnishLower);
    const isMuddle = contains(extraLower, "muddle");
    const isRinse = contains(extraLower, "rinse");
    const isTop = contains(extraLower, "top");
    const topLabel = isTop
      ? (extraLower.replace(" top", "").replace("yuzu soda", "yuzu soda").replace("coconut water", "coconut water"))
      : null;

    // Glass prep
    if (hasRim) {
      steps.push(`Rim the ${glass} with ${garnishLower.replace(" rim", "")} and set aside.`);
    } else if (isRinse) {
      steps.push(`Rinse the chilled ${glass} with ${extraLower.replace(" rinse", "")}; discard excess.`);
    } else if (tier !== "classic" && coinFlip(tier === "wild" ? 0.7 : 0.4)) {
      // Optional smoked or chilled glass
      if (contains(garnishLower, "rosemary") && coinFlip(0.6)) {
        steps.push(`Briefly ignite the rosemary and smoke-rinse the ${glass}, then set aside.`);
      } else if (contains(extraLower, "smoked glass")) {
        steps.push(`Smoke-rinse the ${glass} with rosemary and set aside.`);
      } else {
        steps.push(`Chill a ${glass} with ice or in the freezer.`);
      }
    }

    // Muddle step if relevant
    if (isMuddle) {
      const herb = contains(extraLower, "mint") ? "mint" : contains(extraLower, "basil") ? "basil" : "herbs";
      steps.push(`Lightly muddle the ${herb} in your ${technique === "Stirred" ? "mixing glass" : "shaker"}.`);
    }

    // Build method based on technique
    if (technique === "Shaken") {
      if (hasEggWhite) {
        if (tier === "wild" && coinFlip(0.5)) {
          steps.push("Shake all ingredients except the egg white with ice (10–12 sec).");
          steps.push("Strain back, add egg white, and dry shake vigorously to foam.");
        } else {
          steps.push("Dry shake all ingredients vigorously (no ice) to build foam.");
          steps.push("Add ice and hard shake (12–15 sec).");
        }
      } else {
        if (tier !== "classic" && coinFlip(0.5)) {
          steps.push("Whip shake with a single small cube until it nearly dissolves.");
        } else {
          steps.push("Shake briskly with ice (12–15 sec).");
        }
      }

      // Straining variants
      if (tier !== "classic" && coinFlip(tier === "wild" ? 0.6 : 0.35)) {
        steps.push(`Double strain into the ${glass}${hasRim ? "" : " (fine mesh optional)"}.`);
      } else if (tier === "wild" && coinFlip(0.3)) {
        steps.push(`Dirty pour into the ${glass} with ice.`);
      } else {
        steps.push(`Strain into the ${glass}.`);
      }
    } else if (technique === "Stirred") {
      steps.push("Add all ingredients to a mixing glass with ice.");
      steps.push("Stir until well chilled and clear (15–20 sec).");
      if (tier === "wild" && coinFlip(0.35)) {
        steps.push("Optionally 'throw' the drink between tins a few times to aerate.");
      }
      steps.push(`Strain into the ${glass}${tier !== "classic" && coinFlip(0.5) ? " over a large clear cube" : ""}.`);
    } else {
      // Blended
      steps.push("Add all ingredients to a blender with a generous handful of ice.");
      steps.push("Blend until smooth (8–10 sec).");
      steps.push(`Pour into the ${glass}.`);
    }

    // Top with sodas/etc
    if (isTop) {
      const label = extra.replace(/ top/i, "");
      steps.push(`Top with ${label.toLowerCase()}.`);
    }

    // Spritzes
    if (useExtra && (contains(extraLower, "spritz"))) {
      steps.push(`Give the surface a light ${extraLower}.`);
    }

    // Garnish and finish
    if (isFlamePeel) {
      steps.push("Warm an orange peel, flame the oils over the surface, then garnish.");
    } else if (hasTwistOrPeel) {
      steps.push("Express the citrus oils over the surface, then garnish.");
    }

    // Bitters art if foamy
    if (hasEggWhite && useExtra && useBitters && tier !== "classic" && coinFlip(0.7)) {
      steps.push("Dot the foam with bitters and draw simple patterns with a pick.");
    }

    // Default garnish placement
    if (!hasRim) {
      if (/oyster/.test(garnishLower)) {
        steps.push("Serve with the oyster on the shell alongside or perched carefully.");
      } else if (/quail egg/.test(garnishLower)) {
        steps.push("Gently float the quail egg on the surface.");
      } else if (/gold leaf/.test(garnishLower)) {
        steps.push("Lay a small piece of gold leaf gently on top.");
      } else {
        steps.push(`Garnish with ${garnishLower}.`);
      }
    }

    return steps;
  }

  function resetList(ul) {
    while (ul.firstChild) ul.removeChild(ul.firstChild);
  }

  function addIngredient(ul, text) {
    const li = document.createElement("li");
    li.textContent = text;
    ul.appendChild(li);
  }

  function generateCocktail() {
    const creativity = el.creativity.value;
    const tier = tierForCreativity(creativity);

    const name = generateName();
    const baseSpirit = pick(spirits);

    const sourPool = poolFor("sour", creativity);
    const sweetPool = poolFor("sweet", creativity);
    const garnishPool = poolFor("garnish", creativity);

    const sour = pick(sourPool);
    const sweet = pick(sweetPool);
    const garnish = pick(garnishPool);

    const tech = techniqueFor();
    const glass = pick(glassware);

    // Optional extra: bitters or other ingredient
    const useExtra = coinFlip(0.75); // slightly higher for more variety
    const useBitters = coinFlip(0.6);
    const extra = useBitters ? pick(extrasBitters) : pick(extrasOther);
    const hasEggWhite = extra === "Egg white" || extra === "Aquafaba";

    // Variable ratio: ranges from strong (5:2:1) to balanced (3:2:1) to equal (1:1:1)
    const ratioOptionsClassic = [
      [3, 2, 1], [3.5, 2, 1], [3, 1.5, 1], [2.75, 2, 1], [3, 2, 0.75]
    ];
    const ratioOptionsExperimental = [
      [4, 2, 1], [3.5, 2, 1.5], [3, 2, 2], [2.5, 1.5, 1], [2.25, 1.5, 1], [2, 1.5, 1.25]
    ];
    const ratioOptionsWild = [
      [5, 2, 1], [4, 3, 2], [3, 3, 2], [2, 2, 2], [1.5, 1.5, 1.5], [1, 1, 1]
    ];
    const parts = tier === "classic"
      ? pick(ratioOptionsClassic)
      : tier === "experimental"
        ? pick(ratioOptionsExperimental)
        : pick(ratioOptionsWild);

    const PART_OZ = 0.5; // one "part" equals half an ounce
    const alcoholOz = parts[0] * PART_OZ;
    const sourOz = parts[1] * PART_OZ;
    const sweetOz = parts[2] * PART_OZ;

    const fmt = (n) => {
      const s = (Math.round(n * 100) / 100).toFixed(2);
      return `${s.replace(/\.00$/, "")} oz`;
    };

    // Populate UI
    el.name.textContent = name;
    el.technique.textContent = tech;
    el.glassware.textContent = glass;

    resetList(el.ingredientsList);
    addIngredient(el.ingredientsList, `${fmt(alcoholOz)} ${baseSpirit}`);
    addIngredient(el.ingredientsList, `${fmt(sourOz)} ${sour}`);
    addIngredient(el.ingredientsList, `${fmt(sweetOz)} ${sweet}`);
    if (useExtra) {
      if (useBitters) {
        addIngredient(el.ingredientsList, `2 dashes ${extra}`);
      } else {
        // small supporting measure
        const measure = hasEggWhite ? "" : (contains(extra.toLowerCase(), "top") ? "" : "0.25 oz ");
        addIngredient(el.ingredientsList, `${measure}${extra}`);
      }
    }

    // Build instructions with optional steps based on creativity
    const steps = buildInstructions({
      technique: tech,
      glass,
      garnish,
      extra,
      useExtra,
      useBitters,
      hasEggWhite,
      tier
    });

    resetList(el.instructionsList);
    steps.forEach((s) => addIngredient(el.instructionsList, s));

    el.garnish.textContent = garnish;
  }

  el.generate.addEventListener("click", generateCocktail);
  // Generate one on load for delight
  generateCocktail();
});