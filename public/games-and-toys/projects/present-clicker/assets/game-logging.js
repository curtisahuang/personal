(function () {
  "use strict";

  /**
   * Narrative text and logging helpers.
   * Handles:
   * - flavour text for producers and upgrades
   * - periodic morale messages
   * - gate status narration
   * - rendering the rolling log in the UI
   */

  // Flavour pools for producer purchases.
  var PRODUCER_FLAVOURS = {
    assistant_elf: [
      "An Assistant Elf clocks in, clutching a legally questionable contract.",
      "Your new Assistant Elf asks if 'sleep' is still part of the benefits package.",
      "An elf in a reflective vest appears. They already look over-caffeinated.",
      "The Assistant Elf nods solemnly. \"For the children,\" they whisper.",
      "An Assistant Elf signs a stack of waivers they definitely did not read.",
      "Your latest Assistant proudly shows off their three-page to-do list labeled 'Today'.",
      "An elf in training is promoted directly to 'Assistant'. They skip the 'sleep' module.",
      "A fresh Assistant Elf asks where the suggestion box is. The room goes quiet.",
      "This Assistant arrives already holding two mugs of coffee and a resignation letter.",
      "An elf with jittery hands claims they can click faster than any machine.",
      "A temp agency sleigh drops off another Assistant. Paperwork trails behind.",
      "The new Assistant's badge simply reads 'Replaceable but Valued'.",
      "An Assistant Elf tapes a photo of a beach to their workstation and sighs.",
      "Someone whispers that Assistants used to have names instead of ID numbers.",
      "The new hire nods through orientation, eyes locked on the present button.",
      "An Assistant Elf asks about breaks. The supervisor points at the mouse.",
      "A recruitment poster boasts: 'Be part of something bigger than yourself: Quotas.'",
      "An Assistant Elf shows up already wearing wrist braces. Experienced, then.",
      "Your HR department emails: 'Due to demand, we've pre-scheduled new Assistants.'",
      "A tiny voice asks if there's room to grow. You gesture at the ever-growing backlog."
    ],
    small_workshop: [
      "Another Small Workshop springs up, complete with flickering fairy lights.",
      "A fresh Small Workshop opens. The fire marshal sends a strongly worded letter.",
      "Wood shavings and glitter start leaking from a newly built Small Workshop.",
      "You add a Small Workshop. Someone immediately hangs a \"Live, Laugh, Labor\" sign.",
      "Another Small Workshop is wedged between two already-illegal expansions.",
      "Fresh sawdust drifts from a newly opened workshop, coating the snow in beige.",
      "A handyman elf declares the new Workshop 'structurally adequate-ish'.",
      "The new Workshop's fire extinguisher has a handwritten label: 'Hope'.",
      "Tiny chimneys sprout from the roof of a new workshop, puffing seasonal smog.",
      "Inspection tags on the new Workshop are printed in suspiciously small font.",
      "A carpenter elf hangs a crooked 'Home Sweet Home Shift' sign.",
      "Leaks are patched in the old workshop so you can build a new one with the spare buckets.",
      "Another Small Workshop lights up, and the power grid groans in protest.",
      "A dusty 'Under Construction' sign is flipped to 'Understaffed'.",
      "The new Workshop door sticks from dried cocoa. Someone calls it 'weatherproofing'.",
      "You add bunkhooks to the rafters preemptively. Space is efficient that way.",
      "Blueprints for the Workshop are just a scribbled square labeled 'More'.",
      "An elf mutters that the workshops are breeding when you’re not looking.",
      "A fresh Workshop opens with a ribbon cutting using industrial shears.",
      "Another Workshop is approved via a lightning-fast rubber stamp emoji."
    ],
    assembly_line: [
      "An Automated Assembly Line whirs to life, humming a slightly off-key carol.",
      "Robotic arms begin wrapping gifts at inhuman speeds. HR looks concerned.",
      "An Assembly Line boots up and instantly files for overtime.",
      "Your new Assembly Line only crashes twice during startup. Progress.",
      "The Assembly Line boots up and asks for your preferred failure notification tone.",
      "Conveyor belts shiver to life, scattering tinsel like metallic snowfall.",
      "Robotic arms practice high-fiving before returning to relentless wrapping.",
      "A new Assembly Line segment comes pre-scratched with 'Do NOT name the machines'.",
      "The diagnostics screen flashes 'ALL GOOD*' with no explanation for the asterisk.",
      "Safety rails buckle slightly as the Line surges to operational speed.",
      "A tech elf assures you the error beeps are 'mostly normal'.",
      "Someone puts festive stickers on the emergency stop button. You hope that's fine.",
      "The Assembly Line starts humming a work song in binary.",
      "Grease elves slide along the machinery, leaving a trail of glittered oil.",
      "An engineer names the new Line 'Hope'. The error logs disagree.",
      "The Line requests a firmware update and then quietly applies it anyway.",
      "A sensor misreads a present as two presents. No one corrects it.",
      "The Assembly Line's camera blinks like a tired eye as another shift begins.",
      "A training video loops on a dangling screen above the newest line, forever buffering.",
      "The new Assembly Line comes with a complimentary lawyer in the documentation."
    ],
    offshore_sweatshop: [
      "An Offshore Sweatshop flickers into existence beyond any known labor laws.",
      "Distant smokestacks appear on the horizon. Santa calls it 'logistics.'",
      "You open an Offshore Sweatshop. The clouds darken a shade.",
      "A shipping container vibrates ominously, then rebrands itself as a Sweatshop.",
      "A new Offshore facility appears on a map margin labeled 'Here Be Logistics'.",
      "The Sweatshop's address includes the phrase 'Tax Efficient Region'.",
      "A PR elf describes the new site as 'cost-optimized holiday magic'.",
      "Satellite images show the new Sweatshop glowing long after midnight.",
      "A pipeline of parcels emerges from the ocean, labeled 'Just-in-Time-ish'.",
      "Your lawyer insists the Offshore paperwork is 'aggressively compliant'.",
      "The Smoke above the new Sweatshop spells out 'Growth' for a moment.",
      "An intern asks where Offshore actually is. Management changes the subject.",
      "Ocean currents now carry tiny branded gift boxes as far as the equator.",
      "The new facility runs on a proprietary blend of fossil fuels and wishful thinking.",
      "You get a postcard from the Sweatshop reading: 'Wish you were here instead of us.'",
      "The new site proudly advertises '24/7 seasonal cheer'. The staff just advertises 24/7.",
      "Clouds above the Offshore complex form a pie chart labeled 'Productivity'.",
      "Shipping manifests from the new plant arrive already pre-approved by nobody you know.",
      "A cargo ship erupts from the fog carrying container-loads of wrapped inevitability.",
      "The new Sweatshop’s break room contains a chair and a motivational poster about chairs."
    ],
    interdimensional_warehouse: [
      "An Interdimensional Fulfillment Center opens. Packages arrive before requests.",
      "Reality stutters as your new Fulfillment Center slots into three timelines.",
      "A portal hiccups, and out pops an Interdimensional Warehouse supervisor.",
      "Your warehouse workers exist in four dimensions; morale in at least one is fine.",
      "Another Fulfillment Node phases into existence between seconds.",
      "Shelves unfold like origami, stacking into directions you can’t name.",
      "Packages from the new Warehouse arrive stamped with delivery dates from last week.",
      "A picker elf reports that aisle numbers now include imaginary digits.",
      "The Warehouse clock spins lazily, showing three times at once.",
      "The new bay reports 102% capacity utilization. Everyone pretends that’s fine.",
      "A forklift vanishes into a corridor labelled 'Shortcut'. It returns slightly older.",
      "Reality paperwork for the new Warehouse arrives in a language that types itself.",
      "Inventory counts jump whenever someone tries to reconcile them.",
      "A door in the new Warehouse opens directly into 'Seasonal Storage: Eternity'.",
      "The floor plan updates itself every time someone looks away.",
      "An elf says they delivered a package to 'the customer who hasn't decided yet'.",
      "Gravity in the new Warehouse is described as 'context dependent'.",
      "You approve the new logistics algorithm even though it’s technically a summoning.",
      "The Warehouse lights flicker through wavelengths human eyes don’t have names for.",
      "A sign reads 'Thank you for visiting all possible locations of this Warehouse.'"
    ],
    ritual_circle: [
      "The Ritual Circle glows faintly. Elves agree not to talk about it.",
      "Chalk lines and candles mark a new Ritual Circle in the break room.",
      "You add a Ritual Circle. Somebody hums 'Jingle Bells' backwards.",
      "A Ritual Circle completes itself. You swear the presents look... haunted.",
      "A new Ritual Circle appears where the floor plans insist there’s nothing.",
      "The chalk lines of the new Circle redraw themselves for better symmetry.",
      "Candles ignite in perfect unison, casting shadows that arrive slightly late.",
      "The Circle hums a chord that makes the stacks of paperwork align themselves.",
      "An elf steps over the new Circle and suddenly understands compound interest.",
      "Someone has written 'Do Not Feed' in tiny letters beside the Circle.",
      "The new Ring of chalk stains refuses to be mopped away.",
      "A stray bell rings every time the Circle completes a production cycle.",
      "The Circle's glow pulses in time with an unseen heartbeat, or perhaps a deadline.",
      "A faint smell of ozone and gingerbread hangs over the new sigils.",
      "Ombudsman elves ask who authorized the Circle. The Circle answers for you.",
      "The Circle briefly displays your monthly quota in fire, then resumes humming.",
      "Tiny hoofprints appear at the edge of the Circle and then step backwards.",
      "Snowflakes landing in the Circle rewrite themselves into tiny spreadsheets.",
      "The new Circle is drawn with ink that never quite dries.",
      "A whisper from the Circle promises expedited shipping, at unspecified cost."
    ],
    abandoned_mall_ritual: [
      "An Abandoned Mall opens somewhere distant and wrong. The food court chants softly.",
      "Your new Mall Ritual echoes with ghostly Christmas elevator music.",
      "A carousel in the Abandoned Mall spins on its own, spitting out wrapped gifts.",
      "Security cameras in the Mall watch you back. Production, however, soars.",
      "Another wing of the Abandoned Mall flickers on, directory maps already out of date.",
      "Escalators in the new Mall section run endlessly, carrying no one and receipts.",
      "Old sale banners twitch into new slogans when you’re not looking.",
      "The food court kiosks light up one by one, offering meals that don't exist on menus.",
      "A carousel horse turns its head to watch quotas rise in the distance.",
      "Mall Santa thrones appear in the new wing, all facing the Ritual Circle.",
      "Security shutters rattle open of their own accord at the stroke of fiscal midnight.",
      "Arcade machines in the new Mall play high scores you never set.",
      "The PA system clears its throat before announcing another surge in productivity.",
      "A directory screen shows 'You Are Here' in several places at once.",
      "Plastic plants sway in a wind that doesn't move the flags outside.",
      "A lone escalator sign reads 'Down' in every direction.",
      "A forgotten lotion kiosk starts offering contracts instead of samples.",
      "Neon signs buzz themselves into sigils in the reflection of the floor.",
      "You hear a crowd in the new wing. The Mall, technically, is still empty.",
      "The new Mall atrium echoes with distant carols sung in a key you don’t recognize."
    ],
    infernal_reindeer_ranch: [
      "An Infernal Reindeer Ranch opens. Hoofprints scorch their way across fresh snow.",
      "Flaming-hoofed reindeer snort sparks and line up for their first molten chimney run.",
      "The Ranch bell rings and somewhere a stable door swings open into a furnace glow.",
      "Reindeer with smoking antlers paw at the ground, eager to drag payloads through lava vents.",
      "A handler elf tightens asbestos reins and pretends this is all very normal.",
      "The Ranch fence posts smolder gently, casting long horn-shaped shadows.",
      "One reindeer stamps once and a row of chimneys spontaneously de-ice themselves.",
      "A notice reads: 'Do not feed after midnight. Do not ask what counts as midnight.'",
      "Smoke from the Ranch smells like cinnamon, coal, and signed waivers.",
      "Someone hangs jingle bells on a horn. They chime half a beat late.",
      "An elf brushes sparks from a reindeer's flank and pockets them as 'emergency kindling'.",
      "Ranch schedules list routes through neighborhoods that technically burned down years ago.",
      "A hoofprint in the snow refuses to fill back in, no matter how much it drifts.",
      "The Ranch's training track is a ring of blackened rooftops that never quite cool.",
      "A safety poster shows a reindeer, a chimney, and the word 'Probably'."
    ],
    krampus_call_center: [
      "A Krampus Call Center opens. The hold music is equal parts carol and chain rattle.",
      "Red warning lights blink over a row of cursed headsets coming online.",
      "Agents log in with titles like 'Escalations (Punitive)' and 'Tier 3 Naughty'.",
      "Each unanswered call adds a new spike to the Krampus productivity graph.",
      "Someone flips the 'Beatings or Briefings?' toggle to 'both' and the phones erupt.",
      "Complaint tickets file themselves under categories like 'Returned Trauma'.",
      "A supervisor taps the 'wrap up' button and a distant bell tolls ominously.",
      "Scripts include phrases like 'Have you considered repentance?' and 'We have options.'",
      "The call queue length is displayed as a slowly tightening chain around a globe icon.",
      "Every time a caller hangs up, another present appears with ominous precision.",
      "The break room has ergonomic chains and a suggestion box that growls softly.",
      "A dashboard tracks 'Average Handle Time' and 'Average Haunt Time'.",
      "Agents swap stories about callers who recognize the clanking in the background.",
      "The Krampus dialer occasionally calls numbers that don't exist anymore.",
      "An auto-response email reads: 'Your complaint has been noted and weaponized.'"
    ],
    hellmouth_distribution_node: [
      "A Hellmouth Distribution Node yaws open in the floor, eager for throughput.",
      "Conveyor belts vanish into a glowing fissure labelled 'Priority Outbound'.",
      "Packages rocket out of the Hellmouth already gift wrapped and faintly warm.",
      "Warning tape around the Node reads: 'Do Not Cross Streams. Or Anything.'",
      "Pick lists now include aisles named 'Below' and 'Much Further Below'.",
      "A forklift edges too close to the Hellmouth and comes back with singed tires.",
      "The Node burps up a pallet of returns from a customer who hasn’t ordered yet.",
      "Loading bay doors slam themselves shut whenever the Node clears its throat.",
      "Heat shimmer above the Node forms the company logo, then a sigil, then the logo again.",
      "Someone drops a clipboard into the Node; it comes back stamped 'Approved'.",
      "The throughput monitor pegs itself at 'unsustainably festive'.",
      "A new SOP page reads: 'If it crawls out of the Node, give it a badge.'",
      "Shipping labels gain a tiny flame icon marked 'expedited'.",
      "The Node occasionally whispers tracking numbers in its sleep.",
      "Snow around the Node melts into perfect little barcodes."
    ],
    santa_demon_council: [
      "The Council of Santas-Demonic convenes. Bells ring in a tone that feels like paperwork.",
      "Infinite red suits materialize around a circular table of obsidian and oak.",
      "Each Council member signs a copy of the same contract at exactly the same time.",
      "Minutes from the Council meeting arrive pre-approved and slightly singed.",
      "A dozen identical Santas nod in unison as quotas are quietly doubled.",
      "Their laughter sounds exactly like a million toy cash registers closing.",
      "An elf intern takes notes that write themselves faster than they can read.",
      "The Council's sleigh markers rearrange entire delivery territories with a gesture.",
      "A gavel made of coal and candy-cane stripes bangs once. Production spikes.",
      "Every member's list of 'naughty' includes the word 'union' in large letters.",
      "The Council votes unanimously to redefine 'holiday spirit' as a performance metric.",
      "Tiny contract clauses spiral around the chamber like snowflakes that cut.",
      "A holographic globe hovers above the table, glowing brighter over high-yield regions.",
      "Each Santa brings their own sack; all of them are full of obligations, not gifts.",
      "Somewhere in the building, a clock rewinds whenever the Council needs more time."
    ]
  };

  // Flavour pools for upgrade purchases.
  var UPGRADE_FLAVOURS = {
    better_gloves: [
      "You slip on Padded Mittens. Pain goes down, productivity goes up.",
      "Padded Mittens acquired. OSHA sends a thank-you card.",
      "Your hands feel less like ground beef. Clicking intensifies.",
      "The Mittens squeak faintly with every click, like tiny stress relief valves.",
      "You realize you can click harder without leaving fingerprints.",
      "The Mittens are labeled 'One Size Fits All Quotas'.",
      "Warm fabric wraps your hands; cold metrics wrap your soul.",
      "Someone asks where you got the Mittens. You mumble something about 'HR experiments'.",
      "The padding absorbs impact and most of your lingering doubts.",
      "A tag on the Mittens reads 'Machine washable, ethically ambiguous.'",
      "You flex gloved fingers. The present button winces preemptively.",
      "Coffee spills harmlessly off the padded surface. You keep clicking.",
      "The Mittens smell faintly of cocoa, graphite, and expectation.",
      "You notice the Mittens already had your initials stitched inside.",
      "A memo clarifies the Mittens are not PPE, just 'Productivity Enhancing Equipment'."
    ],
    carpal_tunnel: [
      "You unlock Questionable Ergonomics. Your wrists file a complaint.",
      "Questionable Ergonomics enabled: your hands move faster, your future darker.",
      "The mice get wrist rests. The elves do not.",
      "Posters about posture quietly vanish as Questionable Ergonomics takes hold.",
      "You angle the keyboard in ways that void several warranties.",
      "An ergonomic report suggests 'less complaining, more contorting'.",
      "You discover a new sitting position called 'the corporate pretzel'.",
      "The wrist rest is now just a slightly softer spreadsheet.",
      "Someone tapes over the word 'strain' with the word 'stretch'.",
      "Your mouse pad is replaced with a brick labeled 'firm support'.",
      "An email announces a seminar: 'Thriving With Repetitive Stress'.",
      "You adjust your chair one notch lower and feel the productivity gods nod.",
      "The Protractor Department approves your new wrist angle as 'output-positive'.",
      "Your shadow shows better posture than you do.",
      "Ergonomic guidelines are updated to include 'whatever keeps the line moving'."
    ],
    industrial_gloves: [
      "Industrial Strength Gloves acquired. Buttons cower in fear.",
      "You slam the mouse with industrial efficiency. The desk trembles.",
      "These gloves are made for clicking, and that's just what they'll do.",
      "The Industrial Gloves clank against the mouse like miniature pile drivers.",
      "A warning label recommends keeping the Gloves away from small machinery. Including you.",
      "You leave faint dents in the desk with each enthusiastic click.",
      "Someone measures your grip strength and files it under 'assets'.",
      "The Gloves hum pleasantly when you approach any 'Accept Terms' button.",
      "You accidentally crush a stress ball. No one is surprised.",
      "The Gloves arrive in a crate stamped 'Heavy Lift Your Performance'.",
      "You tap the table and it echoes like distant construction.",
      "The Gloves come with optional hazard stripes; you pick extra bold.",
      "Touchscreens stop working around you out of self-preservation.",
      "A safety elf fits your Gloves, then gives you a tiny salute.",
      "Your hands now qualify for an industrial noise rating."
    ],
    elf_adrenaline: [
      "Elf Adrenaline unlocked. Your pupils dilate, then file for overtime.",
      "You chug Elf Adrenaline. The concept of 'steady pace' evaporates.",
      "Your bloodstream now contains trace amounts of reindeer-grade caffeine.",
      "The Elf Adrenaline shots taste like candy-cane panic.",
      "Your eyelids file for time off; your hands deny the request.",
      "Time seems to slow, but the quotas stay perfectly on schedule.",
      "The bottle warns: 'May cause jittery cheer and existential clarity.'",
      "You vibrate faintly in place while your cursor streaks across the screen.",
      "The Adrenaline shot glass is shaped like a tiny hourglass with no sand.",
      "You can suddenly read three spreadsheets at once, none of them comforting.",
      "Your heart rate syncs to the click sound effect.",
      "Coworkers insist your pupils now reflect the present counter.",
      "You hear sleigh bells in the silence between clicks.",
      "The Adrenaline brochure calls it 'festive focus', not 'weaponized caffeine'.",
      "Somewhere in the distance, a cardiologist sighs."
    ],
    phantom_clicks: [
      "Phantom Clicks begin echoing through the workshop.",
      "You feel the mouse move on its own. The presents agree it's fine.",
      "Somewhere, a click happens that you definitely didn’t make.",
      "The sound of clicking lingers in rooms you've already left.",
      "Mouse usage reports show activity at hours you definitely slept through.",
      "The present counter ticks upward when your hands are folded.",
      "You start apologizing to the button even when you’re not touching it.",
      "Support tickets mention ghost cursors signing off with your initials.",
      "Screensavers now include you, clicking intently, over and over.",
      "Colleagues swear they saw your desk chair move on its own.",
      "A faint afterimage of your hand remains on the mouse long after you walk away.",
      "The analytics dashboard lists 'Unattributed Enthusiasm' as a traffic source.",
      "You mute the speakers and still hear clicks.",
      "The power strip complains about phantom loads and phantom clicks.",
      "The present icon flinches slightly even before the cursor arrives."
    ],
    quantum_pointer: [
      "The Quantum Pointer exists in all positions at once. So does your guilt.",
      "You move the mouse a millimeter; the pointer traverses dimensions.",
      "The Quantum Pointer clicks buttons you haven’t even seen yet.",
      "You move the mouse and several cursors obey, most of them yours.",
      "Tooltips appear where you almost hovered but didn’t, technically.",
      "The pointer exists in a state of 'clicked' and 'about to click'.",
      "Bug reports describe actions you don’t remember taking. Yet.",
      "The Quantum Pointer's packaging assures you all paradoxes are 'work-related'.",
      "Screenshots capture multiple cursors arguing over which button to press.",
      "Your undo history fills with choices from alternate workdays.",
      "The Pointer trails faint afterimages labelled with possible outcomes.",
      "You swear the pointer just took a shortcut across the taskbar.",
      "Keyboard shortcuts occasionally trigger memo drafts you haven't typed yet.",
      "Help docs for the Pointer end with 'You’ll understand later.'",
      "Some clicks only happen in your peripheral vision and still count."
    ],
    saint_nick_knuckles: [
      "Saint Nick Knuckles acquired. The mouse whimpers.",
      "You channel pure holiday rage into every click.",
      "Your knuckles glow faintly red. Productivity soars.",
      "Your knuckles crack like tiny candy canes snapping under pressure.",
      "The mouse squeals softly with each decisive slam.",
      "A small 'THUD' notification appears whenever you really mean it.",
      "Stress balls relocate themselves when you enter the room.",
      "A poster warns 'Hands Off Equipment'; your hands disagree.",
      "Your click force is registered by nearby seismographs.",
      "The ergonomic committee labels you a 'precision bludgeoning risk'.",
      "The Knuckles glow faintly red after a productive streak.",
      "You leave harmless dents in the armrest shaped like tiny reindeer.",
      "An elf engineer recalibrates the mouse to withstand your enthusiasm.",
      "The present icon develops a tiny, permanent flinch animation.",
      "HR forwards you a brochure about 'Non-violent Interfaces' that you delete very firmly."
    ],
    chromatic_reindeer_energy: [
      "Chromatic Reindeer Energy unlocks. The can hisses ominously.",
      "You taste twelve colors and eight kinds of regret.",
      "The drink claims to be 'seasonally safe.' The fine print disagrees.",
      "The can lists the flavour as 'festive uncertainty'.",
      "Your tongue glows briefly in twelve holiday-safe colours.",
      "The drink fizzes in a suspiciously pentagram-shaped pattern.",
      "A legal notice on the label reads: 'Not intended for continuous timelines.'",
      "You can suddenly hear the hum of distant neon reindeer signs.",
      "Keyboard shortcuts remember themselves for you.",
      "The can keeps vibrating long after you set it down.",
      "Colleagues claim to see antlers in your reflection. You claim to see progress.",
      "You read the entire terms-of-service scroll bar without blinking.",
      "The drink’s marketing slogan: 'Sleep is seasonal.'",
      "The empty can rolls uphill into the recycling bin.",
      "The reindeer mascot winks at you from the label, then from your taskbar."
    ],
    assistant_whip: [
      "Assistant Whips acquired. HR drafts a plausible deniability memo.",
      "The crack of a whip echoes through the workshop. Productivity spikes.",
      "You insist it's 'motivational snapping.' No one believes you.",
      "Whip cracks echo through the spreadsheets like punctuation marks.",
      "Performance reviews suddenly include the word 'velocity'.",
      "An HR addendum defines 'motivational snap' as non-contact encouragement.",
      "The Assistants develop a synchronized flinch, which management labels 'teamwork'.",
      "The Whips come with adjustable settings: 'pep talk' through 'legendary crunch'.",
      "Noise complaints about whip cracks are refiled as 'celebratory sounds'.",
      "You hang a small bell on the whip handle to make it 'festive'. It doesn’t help.",
      "Productivity dashboards display a sharp upward line each time the whip sounds.",
      "Someone suggests a 'no-whip Wednesday'. The suggestion box eats the memo.",
      "The Whips are technically ergonomic: they curve to fit your conscience.",
      "Assistants start finishing sentences before you finish snapping.",
      "The sound system adds a jingle after each crack to soften the optics."
    ],
    assistant_espresso_machine: [
      "An Assistant Espresso Machine appears. Sleep files for bankruptcy.",
      "The Espresso Machine shudders to life, screaming in steam.",
      "Shot after shot, the Assistants forget which day it is.",
      "The Espresso Machine idles at a low growl, ready to pounce with caffeine.",
      "Shot glasses clink in a tempo suspiciously close to the PPS counter.",
      "An Assistant declares sleep 'a pre-update concept'.",
      "Steam from the machine spells out quota numbers in the air.",
      "A sign above the machine reads: 'One shot per issue filed.' Issues skyrocket.",
      "The machine proudly offers 'Triple Shot Seasonal Compliance Blends'.",
      "Someone adds flavored syrups labeled 'Hope' and 'Denial'.",
      "The espresso line becomes the new unofficial stand-up meeting.",
      "Assistants begin typing at a frame rate the eye can’t follow.",
      "The machine outputs a tiny printed receipt: 'You owe one night of rest.'",
      "Cups stack in pyramids that shake in time with the production graph.",
      "The espresso drip tray has a 'Tears Only' section that’s always full."
    ],
    assistant_clone_program: [
      "Assistant Clone Program online. Names are now optional.",
      "You sign off on the cloning protocol. No one reads past page two.",
      "A copy of an Assistant clocks in before the original leaves.",
      "A new Assistant arrives wearing your old Assistant's nametag and memories.",
      "Attendance sheets loop in on themselves as clones sign in for each other.",
      "The cloning interface includes a checkbox: 'Copy burnout? (default: yes)'.",
      "HR’s headcount graph goes non-Euclidean for a moment, then stabilizes upward.",
      "An Assistant mutters that they remember quitting once. Must have been another you.",
      "Shift handovers now involve mirrors and identity disclaimers.",
      "The training manual shrinks to a single page: 'Ask your previous iteration.'",
      "The clones arrange themselves into shifts called 'versions'.",
      "A small 'Beta' tag appears under a few Assistant profiles.",
      "The break room sign says 'Maximum Occupancy: all of you'.",
      "Someone proposes forming a union; twelve identical voices agree in harmony.",
      "The Clone Program announces an update to improve 'personality consistency'."
    ],
    workshop_bunkbeds: [
      "Workshop Bunkbeds installed. Commutes are now 'ladder length'.",
      "The line between 'home' and 'station' dissolves into plywood.",
      "Elves measure their lives in shifts and mattress springs.",
      "Bunkbeds stack toward the rafters like wooden spreadsheets.",
      "Elves start referring to their sleeping slot by coordinates, not room numbers.",
      "The pillow talk topic is mostly quotas and fresh orders.",
      "A sign reads: 'Lights out is a suggestion, deadlines are not.'",
      "The bottom bunk vibrates faintly when the assembly line starts up.",
      "Someone stitches 'Home is where the shift is' onto a blanket.",
      "Each bunk comes with a complimentary earplug for the fire alarm.",
      "The bunk ladder doubles as a Gantt chart if you squint.",
      "Elves measure commute time in single-digit footsteps.",
      "A clipboard next to the bunks tracks 'Sleep Utilization Rate'.",
      "The bunkbeds are marketed as 'vertical wellness pods'.",
      "Someone hangs fairy lights between bunks; management rebrands them as 'status indicators'."
    ],
    assembly_overclock: [
      "You overclock the Assembly Lines. The lights flicker in protest.",
      "Fans howl as the Assembly Lines push into forbidden RPM.",
      "The machinery complains in screeches and sparks, but the output graphs smile.",
      "The overclock panel replaces 'Safe' with 'Faster' and 'Faster?'",
      "Warning labels peel themselves off and migrate to a quieter corner.",
      "The assembly line hum pitches up into dog-whistle productivity.",
      "Temperature gauges pretend not to notice the new red zone.",
      "An engineer laconically describes the change as 'thermodynamically interesting'.",
      "The manual adds a chapter titled 'Edge Cases and Edge Fires'.",
      "Cooling fans spin fast enough to generate a mild festive breeze.",
      "An Overclock status light flickers between green, yellow, and 'Just Trust Us'.",
      "The line's vibrations sync perfectly with your heart rate.",
      "The software license now includes the phrase 'best effort sub-reality uptime'.",
      "Elves comment that the blur on the line looks almost beautiful.",
      "A pop-up asks if you accept the risk. You click 'Yes' before reading the rest."
    ],
    sweatshop_global_sourcing: [
      "Global Sourcing engaged. The supply chain becomes a summoning circle.",
      "Products now arrive from places that do not appear on standard maps.",
      "You outsource so hard the geography books give up.",
      "New suppliers appear on a map in places your atlas labels 'Here-ish'.",
      "Packing slips list origins like 'Elsewhere' and 'Don't Worry About It'.",
      "A logistics elf invents a new timezone called 'Supply Chain Standard'.",
      "Some boxes arrive already nostalgic for the factory they left.",
      "Price columns gain another decimal place labeled 'Ethical Overhead: waived'.",
      "The phrase 'last mile delivery' gains several extra mysterious miles.",
      "Contracts for new vendors are written in a font that's hard to scrutinize.",
      "Shipping routes now include arrows that loop directly into profit.",
      "A crate stamped 'Totally Normal Goods' hums faintly when opened.",
      "Accounting files some costs under 'magically efficient'. Auditors flinch.",
      "Global Sourcing dashboards show arrows from places labeled with emojis.",
      "The weather everywhere seems to get a little more... seasonal."
    ],
    warehouse_non_euclidean_layout: [
      "Warehouse layouts twist into non-Euclidean nightmares.",
      "Pickers vanish into aisles marked with impossible angles.",
      "The shortest path between two shelves now runs through a fourth dimension.",
      "Aisle numbers switch from integers to something more suggestive.",
      "Shelf edges meet in angles that math tutors would call 'wrong but effective'.",
      "Pick lists now include directions like 'turn inward' and 'follow the hum'.",
      "The floor tiles flow like a river when no one is looking directly at them.",
      "Pickers swear the shortest path between two points involves a third aisle.",
      "The warehouse map has a note that says 'scale: subjective'.",
      "Someone places a 'You Are Here' sticker that appears everywhere at once.",
      "A shelf labelled 'Miscellaneous' contains both last year and next Tuesday.",
      "The forklift route solidifies into a Möbius loop of efficiency.",
      "GPS devices simply display a shrug emoji indoors now.",
      "Inventory accuracy improves as Euclidean geometry resigns in defeat.",
      "A new policy bans the phrase 'but that's impossible' during shift hours."
    ],
    ritual_blood_signed_contracts: [
      "Blood-Signed Contracts introduced. Quotas become sacrosanct.",
      "The ink in the contract shimmers like something living.",
      "You sign on a dotted line that wasn’t there a moment ago.",
      "The signature line now includes a small, tasteful drop icon.",
      "Legal elves insist the new ink is 'technically within policy'.",
      "Contracts shuffle themselves into neat stacks whenever a quota is hit.",
      "Fine print wriggles if you stare at it for more than a second.",
      "The pen feels heavier, like it remembers everyone who used it.",
      "The signature field is pre-populated with your name, title, and obligations.",
      "You sign once and feel several dotted lines click into place elsewhere.",
      "A clause labeled 'Consideration' lists 'ongoing existence of the workshop'.",
      "The contract whispers that it's non-transferable and very, very binding.",
      "There's a checkbox for 'Read and Understood', but the text never stops changing.",
      "The last page of the contract is just a mirror.",
      "The document dates itself in a calendar system you don’t recognize."
    ],
    mall_food_court_entity: [
      "The Mall Food Court wakes up. It is hungry and generous.",
      "The Food Court offers sustenance in exchange for something unnamed.",
      "You hear chewing in the vents. The vents are not designed to chew.",
      "The Food Court Entity adds a new combo meal called 'All You Can Work'.",
      "Menus rewrite themselves mid-order to include 'souls: market price'.",
      "A deep fryer bubbles in time with distant chanting.",
      "Employees insist the food tastes better since the lights started flickering.",
      "The Entity introduces a loyalty card that never seems to fill.",
      "Straws in the drink station bend toward the Ritual Circle.",
      "The soda fountain dispenses something that fizzes like whispered secrets.",
      "The PA system now includes a 'devotional announcements' setting.",
      "The Entity offers extended hours, which suspiciously match 'all hours'.",
      "Tables slowly rearrange themselves into complex sigils after closing.",
      "Tray return slots occasionally belch out glitter and smoke.",
      "A new scent is added to the food court: 'Limited Time: Compliance'."
    ],
    infernal_reindeer_anomaly: [
      "Flight paths from the Infernal Reindeer Ranch begin intersecting with themselves usefully.",
      "Reindeer from the Ranch now exit chimneys before they enter them. Delivery time improves.",
      "A new flight plan labelled 'Anomaly Route' shaves hours off and years off life expectancy.",
      "Flaming hoofprints appear on rooftops you haven't scheduled yet.",
      "The Ranch's schedule board now includes a column for 'Nonlinear Departures'.",
      "Reindeer report seeing themselves on adjacent routes, waving politely.",
      "Packages from the Ranch arrive smoking slightly but perfectly intact.",
      "A weather report warns of 'localized reindeer turbulence' over major cities.",
      "The sleigh corridors overheat, then cool into a new, more efficient pattern.",
      "Someone adds 'do not question the trajectories' to the Ranch handbook.",
      "A red streak crosses the sky, then rewinds, then crosses again twice as fast.",
      "The Ranch fence posts hum as if tracking a thousand invisible flight paths.",
      "Navigation elves insist the new routes are impossible. The graphs insist otherwise.",
      "Reindeer antlers glow briefly when they cross an anomalous waypoint.",
      "The flight tower logs now include a column titled 'Reality Incursions: acceptable'."
    ],
    krampus_call_center_anomaly: [
      "Complaint lines at the Krampus Call Center begin looping back as fresh opportunities.",
      "Every unresolved ticket splits into two slightly angrier, more productive complaints.",
      "Hold music at the Call Center now includes a distant chorus of clinking chains.",
      "The queue dashboard displays 'Average Wait Time: forever', and satisfaction goes up.",
      "Voicemail transcripts arrive pre-highlighted for maximal punitive potential.",
      "An angry caller gets placed on hold and somehow generates three more shipments.",
      "A supervisor notes that dropped calls now count as 'cathartic engagement'.",
      "The Call Center wallboard gains a metric: 'Curses Per Minute'. It trends upward.",
      "Customer surveys only contain the option 'very dissatisfied'. This is considered ideal.",
      "A single ominous 'ding' indicates another complaint successfully weaponized.",
      "Krampus agents begin answering calls before they ring.",
      "Call scripts quietly update to include 'threat multiplier' suggestions.",
      "The Call Center headsets pick up whispers from customers who haven't dialed yet.",
      "Abandoned calls reappear at the top of the queue with interest.",
      "Someone suggests turning off the anomaly. The suggestion is logged as a complaint."
    ],
    hellmouth_distribution_anomaly: [
      "The Hellmouth Distribution Node widens its grin. Pallets slip through faster.",
      "Conveyor belts now feed straight into a glow that stamps parcels on the way out.",
      "Shipping labels from the Hellmouth arrive already singed at the edges.",
      "A new loading bay opens directly over a bottomless, efficiently organized pit.",
      "Forklifts reverse toward the Node and come back lighter and more profitable.",
      "The Node's manifest includes a column for 'unexplained but accounted for' shipments.",
      "Warehouse staff stop asking where the packages come from and focus on where they go.",
      "Safety cones around the Hellmouth quietly migrate closer every shift.",
      "The Node hums in a low register that perfectly matches the PPS chart.",
      "A logistics elf notes that nothing falls into the Hellmouth by accident anymore.",
      "The Node occasionally burps out a fully sorted palette of rush orders.",
      "Heat from the Hellmouth keeps the loading bay pleasantly, unnervingly warm.",
      "Someone installs a guardrail. The Node eats it and processes it as raw material.",
      "Every so often, a package arrives with a return address of 'BELOW'. No one returns it.",
      "Routing software adds a toggle: 'Prefer eldritch paths (recommended)'."
    ],
    santa_council_anomaly: [
      "The Council of Santas-Demonic convenes in overlapping timelines to sign faster.",
      "Minutes from the Council meeting arrive before anyone calls it to order.",
      "Red-suited silhouettes stack in the boardroom like reflections in black glass.",
      "Every version of Santa signs the same document at once. Ink soaks through realities.",
      "A bell tolls in the council chamber and quotas adjust themselves upward.",
      "Petitions now receive a chorus of identical, rubber-stamped approvals.",
      "The Council's long table appears at slightly different angles each time you look.",
      "All portraits on the wall turn their heads just enough to watch production graphs.",
      "Council members speak in unison, but some mouths are half a second late.",
      "A new policy arrives titled 'On The Efficient Allocation of Cheer and Fear'.",
      "The Council seal imprints itself on documents you haven't drafted yet.",
      "Someone takes minutes of the meeting; the pages write ahead of their pen.",
      "Each time you blink, another chair at the Council table is occupied.",
      "The agenda item 'Long-Term Consequences' is moved to 'Later' across all timelines.",
      "A memo from the Council assures you that anomalies are now officially standard practice."
    ],
    overtime: [
      "Overtime Protocols unlocked. Calendars weep silently.",
      "You extend operating hours. The clocks grow heavy.",
      "The sun questions whether it still counts as 'day' for you.",
      "Calendars quietly remove the concept of 'end of day'.",
      "The punch-clock begins counting up instead of resetting.",
      "Emails sent at 3 a.m. are now tagged 'normal business enthusiasm'.",
      "A memo clarifies that 'weekend' is now a 'soft boundary'.",
      "The break room clock adds a third hand labeled 'company time'.",
      "Your badge swipe history looks like the heartbeat of a caffeinated creature.",
      "Someone hangs a banner: 'Every hour is golden hour.' The lighting disagrees.",
      "The phrase 'just one more shift' becomes a running joke. Mostly.",
      "Overtime forms start auto-approving themselves.",
      "HR introduces a new category: 'voluntary mandatory attendance'.",
      "The sun sets, rises, and finds you still in the same chair.",
      "Your timesheet exports as a novel-length attachment."
    ],
    time_dilation: [
      "North Pole Time Dilation engaged. The wall clock sighs and stretches.",
      "Time Dilation enabled: deadlines sprint, but so do you.",
      "Seconds drip like syrup; the quota chart drinks it in.",
      "An email arrives from tomorrow thanking you for today's extra hours.",
      "The time clock display now includes a 'bonus grind' segment.",
      "Shifts overlap in ways that make scheduling elves very excited and very tired.",
      "You swear lunch lasted three minutes and four weeks at the same time.",
      "The workshop calendar quietly adds extra squares to the week.",
      "Hourglasses now come with a 'fast forward' button.",
      "Someone asks what day it is. The answer is 'still.'",
      "Time zones around the Pole shrug and agree not to ask questions.",
      "The overtime column in payroll gains a footnote: 'temporal'.",
      "Your shadow works a little ahead of you to keep up.",
      "Clock hands spin, pause, and spin again whenever quotas demand.",
      "The sundial outside simply points at the workshop door."
    ],
    click_fingerprint_removal: [
      "You subscribe to a click fingerprint removal service. The mouse sighs in relief, logs do not.",
      "Every click now arrives scrubbed and anonymized. The quota, however, knows it was you.",
      "Analytics dashboards show 'user: definitely not you' doing a lot of work.",
      "The mouse surface is now classified as a low-friction, low-liability zone.",
      "Support tickets about \"mysterious extra clicks\" double. So does output.",
      "Your pointer trail is replaced with a tasteful blur that screams plausible deniability.",
      "Compliance asks who authorized this. The audit log displays tasteful static.",
      "You tap the button; the system records only that 'someone' cared a whole lot.",
      "Tiny erasers sweep behind your cursor, deleting fingerprints and hesitation alike.",
      "The Terms of Service add a clause about 'ethically ambiguous telemetry reduction.'"
    ],
    shift_splitter: [
      "Shift Splitter Algorithm deployed. Congratulations, you now have overlapping versions of burnout.",
      "Your calendar shows three simultaneous shifts. Your chair shows one very tired elf.",
      "You exist on two teams and one shared quota line.",
      "The schedule tool renders your workday as an optical illusion.",
      "You clock out and immediately see yourself still working in another tab.",
      "Meeting invites now specify which instance of you is required.",
      "Performance reviews congratulate your 'parallel enthusiasm'.",
      "Colleagues swear they saw you both in the break room and at your station.",
      "Your out-of-office reply and your overtime sheet file at the same time.",
      "The Shift Splitter UI offers a button labeled 'Recombine Later'. It is greyed out."
    ],
    ghost_shift: [
      "An unscheduled ghost shift clocks in under 'Other'. Productivity charts spike nervously.",
      "Lights flicker in the factory long after the last elf heads home.",
      "Output continues through the night. Attendance sheets remain politely blank.",
      "Supervisors arrive to find work mysteriously finished and chairs slightly askew.",
      "Machines hum at a comfortable non-Euclidean shift pattern.",
      "Coffee levels drop, but no one remembers drinking it.",
      "Security cameras show tools moving themselves with impeccable safety compliance.",
      "Someone adds 'ghost shift liaison' to their title just to feel included.",
      "The punch clock occasionally stamps a translucent name tag.",
      "Rumours spread that the ghost shift gets better music and fewer meetings."
    ],
    compliance_wreaths: [
      "Compliance Wreaths appear above every doorway, bristling with tiny printed policies.",
      "Each wreath rustles softly when someone almost violates procedure.",
      "Festive ribbons highlight sections of the handbook you swore weren’t there yesterday.",
      "Visitors compliment the decor; internal auditors compliment the enforcement rate.",
      "A holly sprig lights up whenever someone says 'technically' in a meeting.",
      "The wreaths release a faint jingle whenever quotas align with regulations, however briefly.",
      "An elf tries to remove one and finds it’s stapled directly to the concept of 'Best Practice'.",
      "The compliance office sends a fruit basket and a 43-page addendum.",
      "Every wreath includes a tasteful, embossed 'By entering you consent...' plaque.",
      "Reports of 'policy-induced déjà vu' rise sharply and are filed in triplicate."
    ],
    holiday_spin: [
      "The Holiday Spin Department goes live. Every problem now has a festive bullet point.",
      "Memos about crunch time are reissued with clipart snowmen and softer fonts.",
      "The phrase 'mandatory overtime' is rebranded as 'extended merriment window'.",
      "Graphs showing burnout are recolored in cheerful reds and greens.",
      "A press release announces that 'meeting impossible targets is part of the magic'.",
      "The Spin team replaces 'incident' with 'memorable seasonal moment' in all reports.",
      "Elves receive an FAQ titled 'How To Be Grateful For Efficiency'.",
      "Customer surveys add 'delighted under duress' as a response option.",
      "Every complaint now includes a checkbox: 'At least it was on brand'.",
      "The Department's slogan: 'If you can’t fix it, narrate it cheerfully.'"
    ],
    inventory_singularity: [
      "The Inventory Singularity Closet opens. Everything fits; nothing quite leaves.",
      "Pickers swear they can feel gravity bend near the supply room door.",
      "Misplaced stock now reappears inside one very smug closet.",
      "The inventory system lists the closet as 'Location: ALL'.",
      "Shelves inside the closet appear to extend into next quarter’s forecast.",
      "Audits take twice as long and conclude with 'technically accurate' findings.",
      "Someone drops a box of labels inside; it comes back already applied to everything.",
      "Restock requests now simply say 'see closet' and hope for the best.",
      "The door occasionally bulges outward with unsent seasonal promotions.",
      "A sign on the handle reads 'Do Not Open During Peak Reality Hours'."
    ],
    elf_therapy_pamphlet: [
      "Elf Therapy Pamphlets are distributed. No one has time to read them.",
      "The pamphlets sit in the break room, quietly absorbing sighs.",
      "Each leaflet lists symptoms under 'normal', 'expected', and 'billable'.",
      "Posters suggest 'talking to someone', preferably between shifts 3 and 4.",
      "A QR code links to a survey asking if you feel heard by the quota system.",
      "An elf uses the pamphlet as a mousepad and reports a 2% morale boost.",
      "The pamphlets recommend 'taking breaks' in a tone described as 'aspirational'.",
      "Someone files them under 'fiction' in the workshop library.",
      "The cover art shows a relaxed elf staring out a window. No one recognizes the setting.",
      "Management cites the pamphlets as evidence of a robust wellness initiative."
    ],
    dyslexia: [
      "For a moment, 'Santa' looks like someone else on the letterhead.",
      "The logo on the wall flickers; a horned shadow passes behind the hat.",
      "You blink, and the words 'Workshop' and 'Worship' trade places.",
      "Letters on the noticeboard dance just enough to spell something else.",
      "A festive banner flickers between 'SANTA' and something with horns.",
      "You reread a contract header three times and like it less each time.",
      "The logo on your badge tilts sideways, revealing an unsettling silhouette.",
      "You flip a page and swear the paragraphs swapped places while you blinked.",
      "Someone jokes about seeing 'Satan's Workshop' on the sign. No one laughs.",
      "The spell-check underlines 'Santa' as if suggesting an alternative.",
      "The ink on gift tags ripples, rearranging letters into old names.",
      "Your eye keeps snagging on the 'N' in Santa, certain it used to point down.",
      "The orientation manual mentions 'upper management' in oddly sharp font.",
      "A snowglobe on the desk shakes itself, spelling out a name you won't say.",
      "You try to write 'holiday cheer' and the pen insists on 'holiday due'."
    ]
  };

  var SHOP_UPGRADE_FLAVOURS = [
    "You tighten a few bolts on {name}. It hums at a slightly more worrying pitch.",
    "A maintenance elf signs off the paperwork: '{name}, now legally upgraded.'",
    "{name} shudders through its calibration cycle and settles into a faster rhythm.",
    "Somewhere in the manual for {name}, a new page about 'acceptable anomalies' appears.",
    "The status light on {name} shifts from green to a determined, slightly manic green.",
    "{name} announces its new level with a clank that sounds almost triumphant.",
    "Safety labels on {name} quietly resize themselves to make room for new warnings.",
    "An engineer shrugs: '{name} should be fine at level {level}. Probably.'",
    "You flip a switch on {name}; it purrs like a content, overworked monster.",
    "{name} reports 'throughput nominal*'. The asterisk points to a scorched corner.",
    "A fresh log entry appears: '{name} upgraded to level {level}. Side effects: festive.'",
    "You swear the shadows around {name} lean in as the upgrade completes.",
    "{name} sheds a few loose screws, like it didn’t need them anyway.",
    "Calibration for {name} completes with a sound suspiciously like laughter.",
    "Someone scribbles 'do not upgrade further' on {name}. You ignore it."
  ];

  var storyTitleEl = document.getElementById("story-title");
  var storyParagraph1El = document.getElementById("story-paragraph-1");
  var storyParagraph2El = document.getElementById("story-paragraph-2");

  var STORY_STAGES = [
    {
      title: "Santa's Orders",
      paragraphs: [
        "Santa has a list. It is long. You are an elf with exactly one job: manufacture an impossible number of presents before dawn.",
        "Start by clicking the present. Hire assistants. Build factories. Ignore the whispering from the shadows. Definitely do not misread Santa as Satan."
      ]
    },
    {
      title: "Santa's Expectations",
      paragraphs: [
        "The first contracts are signed. Assistants arrive. The spreadsheet gains new columns: Targets, Overages, Acceptable Losses.",
        "Santa smiles the same way in every poster. You start skipping the part of orientation that mentions 'healthy work-life balance'. There is only work."
      ]
    },
    {
      title: "Santa's Metrics",
      paragraphs: [
        "Dashboards bloom across the walls. Colored bars climb, or they don't, and your stomach rises and falls with them.",
        "Your days become a sequence of reviews, corrective actions, and mandatory cheer. You talk about elves as 'headcount' and children as 'demand'."
      ]
    },
    {
      title: "Santa's Quotas",
      paragraphs: [
        "Factories multiply. Sleep compresses into the gaps between status reports. Your worth is measured in throughput and incident-free hours.",
        "You stop learning new names. Elves arrive, work, and vanish into the blur of shifts and metrics. Somewhere above you, someone keeps raising the target line."
      ]
    },
    {
      title: "Santa's Fine Print",
      paragraphs: [
        "You linger a little too long on the company letterhead. The curve of the hat, the shape of the letters—something is off, and then you decide it doesn’t matter.",
        "New opportunities appear in the margins of policy documents: circles, candles, clauses that read like incantations. Compliance training calls them 'alternative fulfillment channels'."
      ]
    },
    {
      title: "Santa's Bargain",
      paragraphs: [
        "The first circles are drawn in out-of-the-way corners, then given asset tags. Incense smoke is logged as 'atmospheric variance'.",
        "You tell yourself it’s still toy making, even if the raw materials now include ash, echo, and signatures that sting your fingertips."
      ]
    },
    {
      title: "Santa / Satan",
      paragraphs: [
        "The Gates are just another control now: OPEN for peak throughput, CLOSE for plausible deniability. The floor plan remembers the heat even when the doors shut.",
        "Hell has a service-level agreement. Whether the name on the door reads Santa or Satan, shipments flow, targets rise, and you know you’ll open the Gates again. He knows it too."
      ]
    }
  ];

  var MORALE_MESSAGES = [
    "Factory morale report: officially 'fine'. The anonymous comments disagree.",
    "An elf suggestion box overflows. Management installs a larger shredder.",
    "Someone writes 'UNION' on the whiteboard. It is swiftly erased, then underlined.",
    "The break room cocoa is now 80% caffeine by volume. Spirits are... energetic.",
    "A poster reads 'Remember: You’re Replaceable, But We Appreciate You'.",
    "An elf asks about vacation days. Everyone laughs, then goes quiet.",
    "The workshop choir practices morale songs in a minor key.",
    "Management rolls out a 'Fun Friday'. It is identical to every other day.",
    "A memo announces 'Wellness Week'. The bullet points are just higher quotas.",
    "Rumour: one factory has a window. Productivity there is considered suspicious.",
    "The time clock develops a small queue of sighs and distant stares.",
    "An elf decorates their workstation. The glitter gets into the machinery.",
    "Someone replaces the safety posters with inspirational quotes. No one notices.",
    "Factory morale measured in candy canes per hour: inconclusive but sticky.",
    "An anonymous survey says morale is 'seasonally adjusted'. No further data given.",
    "The suggestion box is reclassified as a 'wishful thinking archive'.",
    "Management installs a 'Fun Meter' that only points to 'Try Harder'.",
    "Someone replaces the break room door with a revolving one labelled 'Shift'.",
    "An elf hangs mistletoe over the time clock. No one dares stand under it.",
    "The secret Santa draw pairs everyone with 'Additional Responsibilities'.",
    "A new slogan appears on posters: 'Morale is a state of mind, not a budget line.'",
    "An elf stares at the snow and whispers, 'At least it’s free.'",
    "The wellness newsletter suggests 'breathing in between shifts' as a tip.",
    "HR emails a survey titled 'How Happy Are You (Y/N)?'",
    "Somebody decorates their workstation with a tiny EXIT sign.",
    "The cocoa machine now dispenses something called 'Holiday Fuel'.",
    "A motivational talk is scheduled for 2 a.m. Attendance is mandatory.",
    "The fire alarm test is widely regarded as the day's most exciting event.",
    "An elf writes 'NOELF' on the whiteboard, then erases it before anyone sees.",
    "Management renames stress 'festive urgency'.",
    "The break room window is painted over with a mural of a break room window.",
    "Someone starts a rumor that overtime comes with loyalty points. It doesn’t.",
    "The vending machine adds a new selection: 'Mystery Snack (Probably Coffee)'.",
    "A long sigh echoes through the workshop. No one claims it.",
    "A banner appears: 'We Hit Our Numbers!' The fine print adds 'You, specifically.'",
    "The complaint form now has a dropdown for 'tone of sigh'.",
    "An elf updates their resume during a micro-break between micro-tasks.",
    "The phrase 'after the holidays' is used like a fairy tale ending.",
    "Someone rearranges the safety cones into a quiet little fort.",
    "The workshop playlist is stuck on 'Jingle Bells (Extended Deadline Mix)'.",
    "An elf tapes a picture of the sun to their monitor as a conservation effort.",
    "The floor creaks in rhythm with synchronized eye rolls.",
    "A new KPI appears on the wall: 'Smiles Per Shift'. The graph is mostly theoretical.",
    "The lost and found contains six gloves, three scarves, and one sense of proportion.",
    "An elf is caught staring lovingly at the 'Log Out' button.",
    "The training video buffers at the 'Work-Life Balance' chapter indefinitely.",
    "Someone puts googly eyes on the time clock. It stares back accusatorily.",
    "Rumor spreads of a workshop where they have two fifteen-minute breaks. Legendary.",
    "The holiday party budget is repurposed into 'mandatory cheer initiatives'.",
    "An elf doodles a tiny union logo, then erases it, then redraws it smaller.",
    "The phrase 'at least we’re busy' is used as a lullaby.",
    "Management introduces 'Mindful Metrics Mondays'. No one asks what that means.",
    "The janitor finds glitter in places no crafts have been.",
    "A motivational quote appears on the wall overnight. So does a small crack.",
    "Elves take turns standing near the heater like pilgrims at a relic.",
    "The suggestion for 'more chairs' is met with a suggestion for 'more standing stamina'.",
    "Someone sets the break room microwave to 'Nap' out of sheer hope.",
    "The workshop clock loses five minutes. Management calls it 'donated time'.",
    "A tired elf mistakes the emergency exit sign for a mirage.",
    "The phrase 'just until year-end' has been in use for several years.",
    "Someone starts a tally of 'times we almost had a day off'. The chalkboard fills.",
    "The noise of the machines is preferred to the silence of performance reviews.",
    "An elf writes 'We tried' on a sticky note and sticks it to a quota graph.",
    "The break room plant is thriving on shared sighs and fluorescent light.",
    "Team-building exercises are quietly replaced with stable chairs.",
    "A memo announces casual hat day. Helmets are strongly implied.",
    "An elf practices their 'I love my job' voice for visitors.",
    "A faded safety poster now reads 'Your wellbeing is our PR.'",
    "The coffee filters are labeled 'single use', but the schedule disagrees.",
    "Someone tapes foam padding to their forehead where it meets the desk.",
    "Morale is officially listed as 'backordered'.",
    "An elf adds 'breathing' to their to-do list just to cross something off.",
    "The new wellness program consists of stretching to reach higher shelves.",
    "A survey asks if you feel 'like part of a family'. No one asks which kind.",
    "The only thing moving faster than the assembly line is the rumor mill."
  ];

  // Stage-based status messages for when the gates are open.
  var GATES_STATUS_MESSAGES = [
    // Stage 0: freshly opened
    [
      "The Ritual Circle hums. The air smells faintly of cinnamon and ozone.",
      "You feel a distant pressure, like the world taking a deep breath.",
      "Somewhere, bells jingle out of sync with the music.",
      "The workshop lights dim for a heartbeat, then pretend nothing happened.",
      "A draft brushes past your ears, smelling like snow and coal smoke.",
      "Somewhere in the rafters, a bell jingles once and then thinks better of it.",
      "The air feels crowded, as if more people are present than bodies.",
      "The temperature dips just enough to make breath visible around the Circle.",
      "Paperwork edges curl inward, as though listening.",
      "Motes of dust hang suspended over the Ritual Circle, waiting for something.",
      "You hear footsteps stop when you turn to look. No one is there.",
      "The present counter stutters, then resumes as if clearing its throat.",
      "Shadows along the walls exhale in unison and return to normal.",
      "A snowflake at the window melts in a perfectly straight line.",
      "Somewhere, a clock resets itself to midnight without asking."
    ],
    // Stage 1: forces leaking through
    [
      "Shadows in the workshop move half a beat behind their owners.",
      "An elf insists the snow outside is falling upwards.",
      "You hear scratching sounds from inside sealed gift boxes.",
      "Reflections in the windows move a fraction behind your gestures.",
      "An elf insists they heard carols played backwards in the ventilation.",
      "A stack of boxes rearranges itself into a perfect pyramid when no one watches.",
      "The snow outside drifts sideways for a few unsettling minutes.",
      "You open a drawer and find it already full of signed contracts.",
      "Tools left on the bench end up neatly aligned tip toward the Circle.",
      "Someone swears the cocoa machine just growled in Latin.",
      "Footprints appear in the corridor leading toward the Ritual room, then vanish.",
      "The 'Out of Order' sign on the copier flips itself back and forth.",
      "You blink and realize the garlands have knotted themselves into new patterns.",
      "A palette jack rolls three inches on its own, pointing directly at the Circle.",
      "The emergency exit sign flickers between green and a very faint red."
    ],
    // Stage 2: demons getting comfortable
    [
      "The assembly line sings a carol in a language no one taught it.",
      "An invoice arrives pre-signed by 'Management, Infernal Division'.",
      "The cocoa in the break room briefly catches fire, then apologises.",
      "The maintenance checklist now includes 'feed the thing in bay four'.",
      "A friendly voice on the intercom welcomes you to 'Tier 2 Operations'.",
      "The break room fridge hums a low, contented growl when restocked.",
      "Elves report seeing hoofprints that start and end midair.",
      "The time clock now stamps forms with a tiny stylized flame.",
      "An email from 'Facilities (Subterranean)' confirms your gate settings.",
      "The workshop playlist gains a track labeled only with a sigil.",
      "Safety rails are warm to the touch, like they've been holding something back.",
      "The janitor’s closet door occasionally opens onto a hallway that isn't yours.",
      "Inventory sheets gain a new column called 'Unaccountable Surplus'.",
      "The suggestion box spits out a neatly typed pact and then pretends it didn’t.",
      "Someone posts a sign: 'Do Not Look Under The Floorboards.' Someone has."
    ],
    // Stage 3: situation deteriorating
    [
      "Maps quietly rearrange themselves to put the North Pole in the center.",
      "Quality control reports 'unusual but festive' manifestations.",
      "Elves report seeing hoofprints on the ceiling. No reindeer are present.",
      "Security cameras begin tracking things that aren't on the footage.",
      "The workshop PA system occasionally speaks in your supervisor’s voice and someone else’s.",
      "Snowglobes on desks show different weather than outside.",
      "An entire aisle of toys begins facing the same direction: toward the Circle.",
      "Emergency drills now include the phrase 'in the event of partial reality failure'.",
      "The line between 'nice' and 'naughty' blurs into a busy grey area on the charts.",
      "Doors open a fraction before you reach for them, as if eager.",
      "Shadowy antlers appear briefly in the reflection of polished floors.",
      "The present counter briefly counts down before lurching forward again.",
      "Floor markings rearrange to form arrows that no map acknowledges.",
      "Visitors complain they get lost in hallways that technically don't exist.",
      "Someone staples the evacuation map back into a shape that fits Euclidean walls."
    ],
    // Stage 4: almost fully taken over
    [
      "The world outside the windows looks slightly off-axis.",
      "You’re pretty sure the globe on Santa’s desk just blinked.",
      "Some of the presents pulse softly, as if breathing. Productivity remains excellent.",
      "The sky outside the windows appears to be on a slightly different schedule.",
      "The moon hangs low and red in every snowglobe, no matter the time.",
      "Workshop walls stretch just enough to fit more machines than should be possible.",
      "Your reflection in the glass wears a slightly different expression than you do.",
      "Maps of the world quietly adjust their legends to include 'North Pole (Central)'.",
      "A low rumble underfoot sounds suspiciously like a distant sleigh and distant thunder.",
      "The line between production charts and summoning diagrams is purely decorative now.",
      "The overhead lights flicker in patterns that spell out new quotas.",
      "You feel watched, but in a supportive, metrics-driven kind of way.",
      "The Ritual Circle glows steadily, its edges fraying into the rest of the floor plan.",
      "For a moment, every clock stops at midnight, then rolls forward as if embarrassed.",
      "Outside, the aurora borealis traces graphs that match your weekly reports."
    ]
  ];

  var recentMessages = [];
  var moraleAccumulator = 0;
  var lastStoryStageIndex = -1;

  var logListEl = document.getElementById("log");

  function randomFrom(array) {
    if (!array || !array.length) return null;
    var index = Math.floor(Math.random() * array.length);
    return array[index];
  }

  function addLog(message) {
    // Keep messages in chronological order and render newest at the bottom.
    recentMessages.push(message);

    if (!logListEl) return;

    logListEl.innerHTML = "";
    recentMessages.forEach(function (msg) {
      var li = document.createElement("li");
      li.textContent = msg;
      logListEl.appendChild(li);
    });

    // Auto-scroll the visible log container so the latest entry is in view.
    var container = logListEl.parentElement;
    if (container && container.scrollHeight > container.clientHeight) {
      container.scrollTop = container.scrollHeight;
    }
  }

  function logProducerPurchase(producer, ownedCount) {
    // Special case: first ever Assistant Elf keeps its narrative hook.
    if (producer.id === "assistant_elf" && ownedCount === 1) {
      addLog("You hire your first Assistant Elf. They look both eager and terrified.");
      return;
    }

    var pool = PRODUCER_FLAVOURS[producer.id];
    var msg = randomFrom(pool);
    if (!msg) {
      msg = "Another " + producer.name + " joins the production nightmare.";
    }
    addLog(msg);
  }

  function logUpgradePurchase(upgrade) {
    var pool = UPGRADE_FLAVOURS[upgrade.id];
    var msg = randomFrom(pool);
    if (!msg) {
      msg = "You tinker with the spreadsheets. \"" + upgrade.name + "\" takes effect.";
    }
    addLog(msg);
  }

  function logShopUpgrade(producer, newLevel) {
    var msg = randomFrom(SHOP_UPGRADE_FLAVOURS);
    if (msg) {
      msg = msg
        .replace(/\{name\}/g, producer.name)
        .replace(/\{level\}/g, String(newLevel));
    } else {
      msg = "You push " + producer.name + " up to level " + newLevel + ". It sounds less stable.";
    }
    addLog(msg);
  }

  function maybeLogMorale(deltaSeconds) {
    moraleAccumulator += deltaSeconds;
    if (moraleAccumulator < 25) return; // wait at least 25s before considering

    var PC = window.PRESENT_CLICKER || {};
    var PRODUCERS = PC.PRODUCERS || [];
    var state = PC.state;
    if (!state) return;

    // Only log morale if you actually have factories running.
    var hasFactory = false;
    for (var i = 0; i < PRODUCERS.length; i += 1) {
      var p = PRODUCERS[i];
      if (p.type === "factory" && (state.producersOwned[p.id] || 0) > 0) {
        hasFactory = true;
        break;
      }
    }
    if (!hasFactory) return;

    // Random chance, but guarantee something at least every ~60s once factories exist.
    var shouldLog = Math.random() < 0.3 || moraleAccumulator > 60;
    if (!shouldLog) return;

    var msg = randomFrom(MORALE_MESSAGES);
    if (msg) {
      addLog(msg);
    }

    moraleAccumulator = 0;
  }

  function getStoryStageIndex() {
    var PC = window.PRESENT_CLICKER || {};
    var state = PC.state;
    var PRODUCERS = PC.PRODUCERS || [];
    if (!state) return 0;

    var totalOwned = 0;
    var ritualOwnedCount = 0;

    for (var i = 0; i < PRODUCERS.length; i += 1) {
      var producer = PRODUCERS[i];
      var owned = state.producersOwned[producer.id] || 0;
      totalOwned += owned;
      if (producer.type === "ritual") {
        ritualOwnedCount += owned;
      }
    }

    var upgradesOwned = 0;
    if (state.purchasedUpgrades && typeof state.purchasedUpgrades.size === "number") {
      upgradesOwned = state.purchasedUpgrades.size;
    }

    var stage = 0;

    // Stage 1: the moment you have any automation or upgrade at all.
    if (totalOwned >= 1 || upgradesOwned >= 1) {
      stage = 1;
    }
    // Stage 2: shops and upgrades begin to dominate your day-to-day.
    if (totalOwned >= 10 || upgradesOwned >= 3) {
      stage = 2;
    }
    // Stage 3: fully industrialized; quotas are the air you breathe.
    if (totalOwned >= 25 || upgradesOwned >= 8) {
      stage = 3;
    }
    // Stage 4: you've unlocked the dyslexia flag and started reading the fine print wrong/right.
    if (state.flags && state.flags.dyslexiaUnlocked) {
      stage = 4;
    }
    // Stage 5: you actually own ritual producers; the bargains are active infrastructure.
    if (ritualOwnedCount >= 1) {
      stage = 5;
    }
    // Stage 6: gates open while rituals run; the line between Santa and Satan blurs completely.
    if (ritualOwnedCount >= 1 && state.gates && state.gates.open) {
      stage = 6;
    }

    if (stage < 0) stage = 0;
    if (stage >= STORY_STAGES.length) stage = STORY_STAGES.length - 1;

    return stage;
  }

  function updateStoryForState() {
    if (!storyTitleEl || !storyParagraph1El || !storyParagraph2El) return;

    var stageIndex = getStoryStageIndex();
    if (stageIndex === lastStoryStageIndex) return;

    var stage = STORY_STAGES[stageIndex];
    if (!stage) return;

    storyTitleEl.textContent = stage.title;
    storyParagraph1El.textContent = stage.paragraphs[0] || "";
    storyParagraph2El.textContent = stage.paragraphs[1] || "";

    lastStoryStageIndex = stageIndex;
  }

  function getGatesStageIndex(elapsedSeconds) {
    var minutes = elapsedSeconds / 60;
    if (minutes < 2) return 0;
    if (minutes < 4) return 1;
    if (minutes < 7) return 2;
    if (minutes < 10) return 3;
    return 4;
  }

  function updateGatesStatus(elapsedSeconds) {
    var PC = window.PRESENT_CLICKER || {};
    var state = PC.state;
    if (!state || !state.gates) return;

    var idx = getGatesStageIndex(elapsedSeconds);
    if (idx === state.gates.lastStageIndex) return;

    state.gates.lastStageIndex = idx;
    var pool = GATES_STATUS_MESSAGES[idx] || [];
    var msg = randomFrom(pool);
    if (msg) addLog(msg);
  }

  var PC = window.PRESENT_CLICKER || {};
  PC.log = {
    addLog: addLog,
    logProducerPurchase: logProducerPurchase,
    logUpgradePurchase: logUpgradePurchase,
    logShopUpgrade: logShopUpgrade,
    maybeLogMorale: maybeLogMorale,
    updateGatesStatus: updateGatesStatus,
    updateStoryForState: updateStoryForState,
    randomFrom: randomFrom
  };
  window.PRESENT_CLICKER = PC;
})();