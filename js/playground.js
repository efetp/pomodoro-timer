// ============================================================
// Deeply — Theme Playground
// ============================================================

let _pg_savedThemeId = 'void';
let _pg_savedOverlay  = 'balanced';

function initPlayground() {
    preloadThemeImages();
    buildPlaygroundGrid();

    document.getElementById('btn-theme-fab').addEventListener('click', openPlayground);
    document.getElementById('btn-playground-apply').addEventListener('click', () => closePlayground(true));
    document.getElementById('btn-playground-discard').addEventListener('click', () => closePlayground(false));

    // Overlay radio buttons
    document.querySelectorAll('.overlay-radio').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                applyTheme(window._deeplyThemeId || 'void', radio.value);
            }
        });
    });

    // Escape key closes playground (discards)
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !document.getElementById('theme-playground').classList.contains('hidden')) {
            closePlayground(false);
        }
    });
}

function openPlayground() {
    // Snapshot current state so Discard can restore it
    _pg_savedThemeId = window._deeplyThemeId || 'void';
    _pg_savedOverlay  = window._deeplyOverlay  || 'balanced';

    // Sync overlay radios
    const radio = document.querySelector(`.overlay-radio[value="${_pg_savedOverlay}"]`);
    if (radio) radio.checked = true;

    // Sync active card
    syncPlaygroundCards(_pg_savedThemeId);

    document.getElementById('theme-playground').classList.remove('hidden');
}

function closePlayground(apply) {
    if (apply) {
        _pg_savedThemeId = window._deeplyThemeId || 'void';
        _pg_savedOverlay  = window._deeplyOverlay  || 'balanced';
        persistTheme(_pg_savedThemeId, _pg_savedOverlay);
    } else {
        // Revert to what was applied before playground was opened
        applyTheme(_pg_savedThemeId, _pg_savedOverlay);
    }
    document.getElementById('theme-playground').classList.add('hidden');
}

function buildPlaygroundGrid() {
    const grid = document.getElementById('playground-theme-grid');
    if (!grid) return;

    const frag = document.createDocumentFragment();

    DEEPLY_THEMES.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'pg-theme-card';
        card.dataset.themeId = theme.id;
        card.style.setProperty('--card-accent', theme.accent);

        card.innerHTML = `
            <div class="pg-card-gradient"></div>
            <span class="pg-card-name">${theme.name}</span>
            <div class="pg-card-check"></div>`;

        card.addEventListener('click', () => {
            applyTheme(theme.id, window._deeplyOverlay || 'balanced');
            syncPlaygroundCards(theme.id);
        });

        frag.appendChild(card);
    });

    grid.appendChild(frag);
}

function syncPlaygroundCards(activeId) {
    document.querySelectorAll('.pg-theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.themeId === activeId);
    });
}

// Save theme preference — Supabase if logged in, localStorage for guests
async function persistTheme(themeId, overlay) {
    if (typeof currentUser !== 'undefined' && currentUser) {
        if (typeof supabaseSaveTheme === 'function') {
            supabaseSaveTheme(themeId, overlay).catch(e => console.warn('persistTheme error:', e));
        }
    } else {
        localStorage.setItem('deeply_theme', JSON.stringify({ id: themeId, overlay }));
    }
}

// Load and apply theme from localStorage (guests) or called after Supabase load
function loadLocalTheme() {
    const raw = localStorage.getItem('deeply_theme');
    if (!raw) return;
    try {
        const { id, overlay } = JSON.parse(raw);
        applyTheme(id || 'void', overlay || 'balanced');
    } catch { /* ignore */ }
}
