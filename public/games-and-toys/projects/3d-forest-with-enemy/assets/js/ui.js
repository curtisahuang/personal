export const overlay = document.getElementById('overlay');
export const startBtn = document.getElementById('start');
const staminaFill = document.getElementById('stamina-fill');
const inventoryPanel = document.getElementById('inventory');
const inventoryListEl = document.getElementById('inventory-list');
const pickupMsgEl = document.getElementById('pickup-message');
const interactPromptEl = document.getElementById('interact-prompt');
const clockEl = document.getElementById('clock');
const debugEl = document.getElementById('debug');

// Game over UI
const deathOverlayEl = document.getElementById('death-overlay');
const deathMsgEl = document.getElementById('death-message');
const restartBtn = document.getElementById('restart');

// Shelter UI
const waitPanelEl = document.getElementById('shelter-panel');
const waitHoursInput = document.getElementById('wait-hours');
const waitHoursValEl = document.getElementById('wait-hours-val');
const waitConfirmBtn = document.getElementById('wait-confirm');
const waitCancelBtn = document.getElementById('wait-cancel');

let isWaiting = false;
let inventoryVisible = false;

// Track overlay visibility for pausing
let overlayVisible = !!(overlay && (overlay.style.display === '' || overlay.style.display === 'flex' || overlay.style.display === 'block'));

export const inventory = {
  money: 0,
  treasures: {
    common: 0,
    uncommon: 0,
    rare: 0,
    superRare: 0,
    legendary: 0,
  },
  items: [] // { name, rarity, count }
};

let callbacks = {
  onStart: null,
  onWaitConfirm: null,
  onWaitCancel: null,
};

export function initializeUI(cb = {}) {
  callbacks = { ...callbacks, ...cb };

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (callbacks.onStart) callbacks.onStart();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }

  if (waitHoursInput && waitHoursValEl) {
    waitHoursInput.addEventListener('input', () => {
      waitHoursValEl.textContent = waitHoursInput.value;
    });
    waitHoursValEl.textContent = waitHoursInput.value;
  }
  if (waitConfirmBtn) {
    waitConfirmBtn.addEventListener('click', () => {
      const hours = parseInt(waitHoursInput ? waitHoursInput.value : '6', 10) || 6;
      if (callbacks.onWaitConfirm) callbacks.onWaitConfirm(hours);
    });
  }
  if (waitCancelBtn) {
    waitCancelBtn.addEventListener('click', () => {
      if (callbacks.onWaitCancel) callbacks.onWaitCancel();
    });
  }
}

export function setOverlayVisible(show) {
  if (!overlay) return;
  overlay.style.display = show ? 'flex' : 'none';
  overlayVisible = !!show;
}
export function getOverlayVisible() { return overlayVisible; }

export function updateStamina(ratio) {
  if (!staminaFill) return;
  const r = Math.max(0, Math.min(1, ratio));
  staminaFill.style.width = `${(r * 100).toFixed(1)}%`;
  staminaFill.style.backgroundColor = r > 0.6 ? '#22c55e' : (r > 0.3 ? '#f59e0b' : '#ef4444');
}

export function setInteractPrompt(text) {
  if (!interactPromptEl) return;
  if (text) {
    interactPromptEl.textContent = text;
    interactPromptEl.style.display = 'block';
    interactPromptEl.style.opacity = '0.95';
  } else {
    interactPromptEl.style.display = 'none';
  }
}

export function showPickupMessage(msg) {
  if (!pickupMsgEl) return;
  pickupMsgEl.textContent = msg;
  pickupMsgEl.style.display = 'block';
  pickupMsgEl.style.opacity = '1';
  clearTimeout(showPickupMessage._t);
  showPickupMessage._t = setTimeout(() => {
    pickupMsgEl.style.opacity = '0';
    setTimeout(() => { pickupMsgEl.style.display = 'none'; }, 220);
  }, 3000);
}

export function updateClockUI(hours) {
  if (!clockEl) return;
  const dayHours = ((hours % 24) + 24) % 24;
  const hh = Math.floor(dayHours);
  const mm = Math.floor((dayHours - hh) * 60);
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  clockEl.textContent = `${pad(hh)}:${pad(mm)}`;
}

export function setDebugInfo(text) {
  if (!debugEl) return;
  if (text == null || text === '') {
    debugEl.style.display = 'none';
  } else {
    debugEl.style.display = 'block';
    debugEl.textContent = text;
  }
}

export function setInventoryVisible(show) {
  inventoryVisible = !!show;
  if (inventoryPanel) inventoryPanel.style.display = show ? 'block' : 'none';
  if (show) updateInventoryUI();
}
export function getInventoryVisible() { return inventoryVisible; }

export function addInventoryItem(name, rarity, count = 1) {
  let found = null;
  for (let i = 0; i < inventory.items.length; i++) {
    if (inventory.items[i].name === name) { found = inventory.items[i]; break; }
  }
  if (found) {
    found.count += count;
  } else {
    inventory.items.push({ name, rarity, count });
  }
}

export function updateInventoryUI() {
  if (!inventoryListEl) return;
  const icon = { common: '•', uncommon: '◆', rare: '💎', superRare: '✨', legendary: '👑' };
  const order = { legendary: 5, superRare: 4, rare: 3, uncommon: 2, common: 1 };

  const items = inventory.items.slice().sort((a, b) => {
    const o = order[b.rarity] - order[a.rarity];
    if (o !== 0) return o;
    return a.name.localeCompare(b.name);
  });

  let html = `
    <div class="inv-item"><span class="emoji">💰</span><span class="name">Money</span><span class="count">${inventory.money}</span></div>
  `;
  if (!items.length) {
    html += `<div class="inv-item"><span class="emoji"></span><span class="name">No treasures yet</span><span class="count">—</span></div>`;
  } else {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      html += `<div class="inv-item"><span class="emoji">${icon[it.rarity] || ''}</span><span class="name">${it.name}</span><span class="count">${it.count}</span></div>`;
    }
  }
  inventoryListEl.innerHTML = html;
}

// Shelter helpers
export function setWaitPanelVisible(show) {
  isWaiting = !!show;
  if (waitPanelEl) waitPanelEl.style.display = show ? 'flex' : 'none';
  if (show && waitHoursValEl && waitHoursInput) waitHoursValEl.textContent = waitHoursInput.value;
  if (show && overlay) { overlay.style.display = 'none'; overlayVisible = false; }
}
export function getIsWaiting() { return isWaiting; }
export function getWaitHours() {
  return parseInt(waitHoursInput ? waitHoursInput.value : '6', 10) || 6;
}

// Game over
export function showGameOver(message) {
  if (overlay) { overlay.style.display = 'none'; overlayVisible = false; }
  if (inventoryPanel) inventoryPanel.style.display = 'none';
  if (interactPromptEl) interactPromptEl.style.display = 'none';
  if (pickupMsgEl) pickupMsgEl.style.display = 'none';
  if (deathMsgEl) deathMsgEl.textContent = message || 'Game Over';
  if (deathOverlayEl) deathOverlayEl.style.display = 'flex';
}