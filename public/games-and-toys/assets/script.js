// Curtis's Cabinet of Curiosities
// - Theme launchers and menus per theme
// - Render curiosities from assets/curiosities.json or window.CURIOSITIES
// - Tag filter chips

(function () {
  "use strict";

  const storageKey = "theme-preference";
  const root = document.documentElement;
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const filters = document.getElementById("filters");
  const homeBackBtn = document.getElementById("homeBackBtn");
  const win98ExplorerShortcut = document.getElementById("win98ExplorerShortcut");
  const win98ExplorerWindow = document.getElementById("win98ExplorerWindow");
  const win98ExplorerTitlebar = document.getElementById("win98ExplorerTitlebar");
  const win98ExplorerClose = document.getElementById("win98ExplorerClose");
  const win98ExplorerMaximize = document.getElementById("win98ExplorerMaximize");
  const win98ResizeHandles = document.querySelectorAll(".win98-resize-handle");
  const win98FileArea = document.getElementById("win98FileArea");
  const win98ContextMenu = document.getElementById("win98ContextMenu");
  const win98CtxVisitSite = document.getElementById("win98CtxVisitSite");
  const win98CtxVisitGithub = document.getElementById("win98CtxVisitGithub");

  let win98ContextTarget = null;
  let win98IsDragging = false;
  let win98IsMaximized = false;
  let win98DragOffsetX = 0;
  let win98DragOffsetY = 0;
  let win98IsResizing = false;
  let win98ResizeDir = "";
  let win98ResizeStartX = 0;
  let win98ResizeStartY = 0;
  let win98ResizeStartRect = null;
  let win98WindowRestoreRect = null;

  function getWin98DesktopRect() {
    return document.getElementById("win98Desktop")?.getBoundingClientRect() || null;
  }

  let ALL_ITEMS = [];
  const selectedTags = new Set();

  function getPreferredTheme() {
    const saved = localStorage.getItem(storageKey);
    if (saved === "win98" || saved === "geocities" || saved === "dark" || saved === "homepage")
      return saved;
    return "win98";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (theme !== "win98") {
      closeWin98Explorer();
      hideWin98ContextMenu();
    }
  }

  function openWin98Explorer() {
    if (!win98ExplorerWindow) return;
    win98ExplorerWindow.hidden = false;
    win98ExplorerWindow.style.display = "flex";
  }

  function closeWin98Explorer() {
    if (!win98ExplorerWindow) return;
    hideWin98ContextMenu();
    win98ExplorerWindow.style.display = "none";
    win98ExplorerWindow.hidden = true;
  }

  function setWin98Maximized(nextState) {
    if (!win98ExplorerWindow || !win98ExplorerMaximize) return;
    if (nextState) {
      const rect = win98ExplorerWindow.getBoundingClientRect();
      const desktopRect = getWin98DesktopRect();
      win98WindowRestoreRect = {
        left: desktopRect ? rect.left - desktopRect.left : rect.left,
        top: desktopRect ? rect.top - desktopRect.top : rect.top,
        width: rect.width,
        height: rect.height,
      };
      win98ExplorerWindow.classList.add("is-maximized");
      win98ExplorerWindow.style.left = "0px";
      win98ExplorerWindow.style.top = "0px";
      win98ExplorerWindow.style.width = "100%";
      win98ExplorerWindow.style.height = "100%";
      win98ExplorerMaximize.textContent = "❐";
      win98ExplorerMaximize.title = "Restore";
      win98ExplorerMaximize.setAttribute("aria-label", "Restore Explorer");
      win98IsMaximized = true;
      return;
    }

    win98ExplorerWindow.classList.remove("is-maximized");
    if (win98WindowRestoreRect) {
      win98ExplorerWindow.style.left = `${win98WindowRestoreRect.left}px`;
      win98ExplorerWindow.style.top = `${win98WindowRestoreRect.top}px`;
      win98ExplorerWindow.style.width = `${win98WindowRestoreRect.width}px`;
      win98ExplorerWindow.style.height = `${win98WindowRestoreRect.height}px`;
    }
    win98ExplorerMaximize.textContent = "□";
    win98ExplorerMaximize.title = "Maximize";
    win98ExplorerMaximize.setAttribute("aria-label", "Maximize Explorer");
    win98IsMaximized = false;
  }

  function hideWin98ContextMenu() {
    if (!win98ContextMenu) return;
    win98ContextMenu.hidden = true;
    win98ContextTarget = null;
  }

  function showWin98ContextMenu(x, y, site) {
    if (!win98ContextMenu || !site) return;
    win98ContextTarget = site;
    win98ContextMenu.hidden = false;
    win98ContextMenu.style.left = `${x}px`;
    win98ContextMenu.style.top = `${y}px`;
    win98CtxVisitGithub.disabled = !String(site.githubUrl || "").trim();
  }

  function renderWin98Files(items) {
    if (!win98FileArea) return;
    win98FileArea.innerHTML = "";
    const fragment = document.createDocumentFragment();

    items.forEach((site) => {
      const fileBtn = document.createElement("button");
      fileBtn.type = "button";
      fileBtn.className = "win98-file-icon";

      const img = new Image();
      img.src = String(site.screenshotUrl || "").trim();
      img.alt = String(site.title || "File");
      img.loading = "lazy";
      img.decoding = "async";
      fileBtn.appendChild(img);

      const title = document.createElement("span");
      title.className = "win98-file-title";
      title.textContent = String(site.title || "Untitled");
      fileBtn.appendChild(title);

      fileBtn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        showWin98ContextMenu(e.clientX, e.clientY, site);
      });

      fileBtn.addEventListener("click", () => {
        const url = String(site.url || "").trim();
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      });

      fragment.appendChild(fileBtn);
    });

    win98FileArea.appendChild(fragment);
  }

  function initTheme() {
    // Apply saved or default theme
    applyTheme(getPreferredTheme());
  }

  async function loadCuriosities() {
    try {
      const res = await fetch("assets/curiosities.json", { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return Array.isArray(window.CURIOSITIES) ? window.CURIOSITIES : [];
  }

  function normalizeTag(t) {
    return String(t || "")
      .trim()
      .toLowerCase();
  }

  function collectUniqueTags(items) {
    const map = new Map(); // key(lowercased) -> label(first seen)
    items.forEach((site) => {
      const tags = Array.isArray(site.tags) ? site.tags : [];
      tags.forEach((t) => {
        const label = String(t || "").trim();
        if (!label) return;
        const key = label.toLowerCase();
        if (!map.has(key)) map.set(key, label);
      });
    });
    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  function createCard(site) {
    const url = String(site.url || "").trim();
    const title = String(site.title || url || "Untitled").trim() || "Untitled";
    const desc = String(site.description || "").trim();
    const tags = Array.isArray(site.tags) ? site.tags.filter(Boolean).map(String) : [];

    // Allow explicit screenshot override per item
    let imgSrc = null;
    const override = site.screenshotUrl ? String(site.screenshotUrl).trim() : "";
    if (override) {
      imgSrc = override;
    } else {
      // Build screenshot URL from INSTANT_SITE_DOMAIN (e.g., "cosine" -> "screenshot.cosine.show")
      const domain = (
        typeof window.INSTANT_SITE_DOMAIN !== "undefined" ? String(window.INSTANT_SITE_DOMAIN) : ""
      )
        .trim()
        .replace(/\/*$/, "");
      if (domain) {
        let host = `screenshot.${domain}`;
        if (!host.endsWith(".show")) host += ".show";
        imgSrc = `https://${host}/?url=${url}`;
      }
    }

    const card = document.createElement("article");
    card.className = "card";

    const imageLink = document.createElement("a");
    imageLink.className = "image";
    imageLink.href = url;
    imageLink.target = "_blank";
    imageLink.rel = "noopener noreferrer";

    if (imgSrc) {
      const img = new Image();
      img.src = imgSrc;
      img.alt = `Preview of ${title}`;
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = () => {
        // Replace img with a fallback if screenshot fails
        const fallback = document.createElement("div");
        fallback.className = "img-fallback";
        imageLink.replaceChildren(fallback);
      };
      imageLink.appendChild(img);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "img-fallback";
      imageLink.appendChild(fallback);
    }

    const content = document.createElement("div");
    content.className = "content";

    const h3 = document.createElement("h3");
    h3.textContent = title;

    // Description: always include, height fixed to two lines via CSS
    const p = document.createElement("p");
    p.className = "desc";
    if (desc) p.textContent = desc;

    const tagsWrap = document.createElement("div");
    tagsWrap.className = "tags";
    if (tags.length) {
      tags.forEach((t) => {
        const chip = document.createElement("span");
        chip.className = "tag";
        chip.textContent = t;
        tagsWrap.appendChild(chip);
      });
    }

    const visit = document.createElement("a");
    visit.className = "visit";
    visit.href = url;
    visit.target = "_blank";
    visit.rel = "noopener noreferrer";
    visit.textContent = "Visit Site";

    // Assemble in fixed row order
    content.appendChild(h3);
    content.appendChild(p);
    content.appendChild(tagsWrap);
    content.appendChild(visit);

    card.appendChild(imageLink);
    card.appendChild(content);
    return card;
  }

  function renderCuriosities(items) {
    grid.innerHTML = "";
    if (!items || items.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    const fragment = document.createDocumentFragment();
    items.forEach((site) => fragment.appendChild(createCard(site)));
    grid.appendChild(fragment);
  }

  function renderFilters(tagsList) {
    if (!filters) return;
    filters.innerHTML = "";
    if (!tagsList || tagsList.length === 0) {
      filters.hidden = true;
      return;
    }
    filters.hidden = false;
    const wrap = document.createElement("div");
    wrap.className = "chips";
    wrap.setAttribute("role", "toolbar");
    wrap.setAttribute("aria-label", "Tag filters");

    // All chip
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "chip";
    allBtn.dataset.key = "all";
    allBtn.textContent = "All";
    allBtn.setAttribute("aria-pressed", "true");
    allBtn.classList.add("is-active");
    wrap.appendChild(allBtn);

    tagsList.forEach(({ key, label }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.dataset.key = key;
      btn.textContent = label;
      btn.setAttribute("aria-pressed", "false");
      wrap.appendChild(btn);
    });

    // Event delegation for clicks
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button.chip");
      if (!btn) return;
      const key = btn.dataset.key || "";
      if (key === "all") {
        selectedTags.clear();
      } else {
        const k = String(key);
        if (selectedTags.has(k)) selectedTags.delete(k);
        else selectedTags.add(k);
      }
      updateFilterUI();
      applyFilter();
    });

    filters.appendChild(wrap);
  }

  function updateFilterUI() {
    if (!filters) return;
    const wrap = filters.querySelector(".chips");
    if (!wrap) return;
    const chips = wrap.querySelectorAll("button.chip");
    const isAll = selectedTags.size === 0;
    chips.forEach((btn) => {
      const key = btn.dataset.key || "";
      const active = key === "all" ? isAll : selectedTags.has(key);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function applyFilter() {
    if (selectedTags.size === 0) {
      renderCuriosities(ALL_ITEMS);
      return;
    }
    const filtered = ALL_ITEMS.filter((site) => {
      const tags = Array.isArray(site.tags) ? site.tags : [];
      for (const t of tags) {
        if (selectedTags.has(normalizeTag(t))) return true;
      }
      return false;
    });
    renderCuriosities(filtered);
  }

  // Clicking tags inside cards sets the filter to that tag
  grid.addEventListener("click", (e) => {
    const chip = e.target.closest(".tag");
    if (!chip) return;
    const label = String(chip.textContent || "").trim();
    if (!label) return;
    selectedTags.clear();
    selectedTags.add(normalizeTag(label));
    updateFilterUI();
    applyFilter();
    if (filters) {
      try {
        filters.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {}
    }
  });

  // Theme launcher menus
  const themeMenuBtn = document.getElementById("themeMenuBtn");
  const themeMenu = document.getElementById("themeMenu");
  const winStartBtn = document.getElementById("winStartBtn");
  const winStartMenu = document.getElementById("winStartMenu");
  const geoThemeBtn = document.getElementById("geoThemeBtn");
  const geoThemeMenu = document.getElementById("geoThemeMenu");

  function hideAllMenus() {
    [themeMenu, winStartMenu, geoThemeMenu].forEach((m) => {
      if (m) m.hidden = true;
    });
  }

  function attachThemeClicks(menuEl) {
    if (!menuEl) return;
    menuEl.addEventListener("click", (e) => {
      const actionBtn = e.target.closest("button[data-action]");
      if (actionBtn) {
        const action = actionBtn.getAttribute("data-action");
        if (action === "go-home") {
          hideAllMenus();
          window.location.href = "/";
        }
        return;
      }

      const btn = e.target.closest("button[data-theme]");
      if (!btn) return;
      const t = btn.getAttribute("data-theme");
      if (!t) return;
      applyTheme(t);
      try {
        localStorage.setItem(storageKey, t);
      } catch {}
      hideAllMenus();
    });
  }

  function bindMenu(toggleBtn, menuEl, position = "default") {
    if (!toggleBtn || !menuEl) return;
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasHidden = menuEl.hidden;
      hideAllMenus();
      if (wasHidden) {
        // Optionally position menu relative to button for some launchers
        if (position === "relative") {
          const rect = toggleBtn.getBoundingClientRect();
          menuEl.style.left = `${rect.left}px`;
          menuEl.style.top = `${rect.bottom + 6}px`;
        }
        menuEl.hidden = false;
      }
    });
  }

  // Global close handlers
  document.addEventListener("click", () => hideAllMenus());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideAllMenus();
  });

  // Wire menus
  attachThemeClicks(themeMenu);
  attachThemeClicks(winStartMenu);
  attachThemeClicks(geoThemeMenu);

  bindMenu(themeMenuBtn, themeMenu, "relative");
  bindMenu(winStartBtn, winStartMenu); // fixed CSS positions the menu above (upwards)
  bindMenu(geoThemeBtn, geoThemeMenu, "relative");

  if (homeBackBtn) {
    homeBackBtn.addEventListener("click", () => {
      window.location.href = "/";
    });
  }

  if (win98ExplorerShortcut) {
    win98ExplorerShortcut.addEventListener("click", () => {
      openWin98Explorer();
    });
  }

  if (win98ExplorerClose) {
    win98ExplorerClose.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeWin98Explorer();
    });
  }

  if (win98ExplorerMaximize) {
    win98ExplorerMaximize.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setWin98Maximized(!win98IsMaximized);
    });
  }

  if (win98ExplorerTitlebar) {
    win98ExplorerTitlebar.addEventListener("mousedown", (e) => {
      if (!win98ExplorerWindow || win98IsMaximized) return;
      if (e.target.closest(".win98-window-control")) return;
      const rect = win98ExplorerWindow.getBoundingClientRect();
      win98DragOffsetX = e.clientX - rect.left;
      win98DragOffsetY = e.clientY - rect.top;
      win98IsDragging = true;
      e.preventDefault();
    });

    win98ExplorerTitlebar.addEventListener("dblclick", (e) => {
      if (e.target.closest(".win98-window-control")) return;
      setWin98Maximized(!win98IsMaximized);
    });
  }

  document.addEventListener("mousemove", (e) => {
    if (win98IsResizing && win98ExplorerWindow && win98ResizeStartRect) {
      const desktopRect = document.getElementById("win98Desktop")?.getBoundingClientRect();
      const minWidth = 360;
      const minHeight = 260;
      const dx = e.clientX - win98ResizeStartX;
      const dy = e.clientY - win98ResizeStartY;

      let left = win98ResizeStartRect.left;
      let top = win98ResizeStartRect.top;
      let width = win98ResizeStartRect.width;
      let height = win98ResizeStartRect.height;

      if (win98ResizeDir.includes("e")) {
        width = win98ResizeStartRect.width + dx;
      }
      if (win98ResizeDir.includes("s")) {
        height = win98ResizeStartRect.height + dy;
      }
      if (win98ResizeDir.includes("w")) {
        left = win98ResizeStartRect.left + dx;
        width = win98ResizeStartRect.width - dx;
      }
      if (win98ResizeDir.includes("n")) {
        top = win98ResizeStartRect.top + dy;
        height = win98ResizeStartRect.height - dy;
      }

      if (width < minWidth) {
        if (win98ResizeDir.includes("w")) {
          left -= minWidth - width;
        }
        width = minWidth;
      }

      if (height < minHeight) {
        if (win98ResizeDir.includes("n")) {
          top -= minHeight - height;
        }
        height = minHeight;
      }

      if (desktopRect) {
        const maxWidth = desktopRect.width - left;
        const maxHeight = desktopRect.height - top;
        if (left < 0) {
          width += left;
          left = 0;
        }
        if (top < 0) {
          height += top;
          top = 0;
        }
        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);
      }

      win98ExplorerWindow.style.left = `${left}px`;
      win98ExplorerWindow.style.top = `${top}px`;
      win98ExplorerWindow.style.width = `${Math.max(minWidth, width)}px`;
      win98ExplorerWindow.style.height = `${Math.max(minHeight, height)}px`;
      return;
    }

    if (!win98IsDragging || !win98ExplorerWindow) return;
    const desktopRect = getWin98DesktopRect();
    const nextLeft = e.clientX - win98DragOffsetX;
    const nextTop = e.clientY - win98DragOffsetY;

    if (desktopRect) {
      const relativeLeft = nextLeft - desktopRect.left;
      const relativeTop = nextTop - desktopRect.top;
      const maxLeft = desktopRect.width - win98ExplorerWindow.offsetWidth;
      const maxTop = desktopRect.height - win98ExplorerWindow.offsetHeight;
      win98ExplorerWindow.style.left = `${Math.max(0, Math.min(relativeLeft, maxLeft))}px`;
      win98ExplorerWindow.style.top = `${Math.max(0, Math.min(relativeTop, maxTop))}px`;
      return;
    }

    win98ExplorerWindow.style.left = `${Math.max(0, nextLeft)}px`;
    win98ExplorerWindow.style.top = `${Math.max(0, nextTop)}px`;
  });

  document.addEventListener("mouseup", () => {
    win98IsDragging = false;
    win98IsResizing = false;
    win98ResizeDir = "";
    win98ResizeStartRect = null;
  });

  win98ResizeHandles.forEach((handle) => {
    handle.addEventListener("mousedown", (e) => {
      if (!win98ExplorerWindow || win98IsMaximized) return;
      const dir = handle.getAttribute("data-dir");
      if (!dir) return;
      const rect = win98ExplorerWindow.getBoundingClientRect();
      const desktopRect = getWin98DesktopRect();
      win98ResizeStartX = e.clientX;
      win98ResizeStartY = e.clientY;
      win98ResizeDir = dir;
      win98ResizeStartRect = {
        left: desktopRect ? rect.left - desktopRect.left : rect.left,
        top: desktopRect ? rect.top - desktopRect.top : rect.top,
        width: rect.width,
        height: rect.height,
      };
      win98IsResizing = true;
      e.preventDefault();
      e.stopPropagation();
    });
  });

  if (win98CtxVisitSite) {
    win98CtxVisitSite.addEventListener("click", () => {
      if (!win98ContextTarget) return;
      const url = String(win98ContextTarget.url || "").trim();
      hideWin98ContextMenu();
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  if (win98CtxVisitGithub) {
    win98CtxVisitGithub.addEventListener("click", () => {
      if (!win98ContextTarget) return;
      const githubUrl = String(win98ContextTarget.githubUrl || "").trim();
      hideWin98ContextMenu();
      if (githubUrl) window.open(githubUrl, "_blank", "noopener,noreferrer");
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#win98ContextMenu") && !e.target.closest(".win98-file-icon")) {
      hideWin98ContextMenu();
    }
  });

  // Simple Win98 taskbar clock
  function updateWinClock() {
    const el = document.getElementById("winClock");
    if (!el) return;
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    el.textContent = `${h}:${m} ${ampm}`;
  }
  setInterval(updateWinClock, 1000);
  updateWinClock();

  // Initialize
  initTheme();
  loadCuriosities().then((items) => {
    ALL_ITEMS = Array.isArray(items) ? items : [];
    renderCuriosities(ALL_ITEMS);
    renderWin98Files(ALL_ITEMS);
    const tagsList = collectUniqueTags(ALL_ITEMS);
    renderFilters(tagsList);
    updateFilterUI();
  });
})();
