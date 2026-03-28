// ============================================================
// Deeply — Theme Engine
// ============================================================

const DEEPLY_THEMES = [
    // ── No-image default ──────────────────────────────────────
    {
        id: 'void',
        name: 'Void',
        accent: '#3caed1',
        image: null,
        light: false,
        bgColor: '#0b1220',
        overlayRgb: '5, 8, 18',
        overlayOpacity: { subtle: 0.0, balanced: 0.0, focused: 0.45 },
        glassAlpha:     { subtle: 0.80, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 110%, #1e2f4a 0%, #0d1628 45%, #070d1a 100%)',
        timerColors: { light: '#3caed1', deep: '#e74c3c', custom: '#a78bfa' },
    },

    // ── Dark themes ───────────────────────────────────────────
    {
        id: 'aurora',
        name: 'Aurora',
        accent: '#34d399',
        image: 'aurora',
        light: false,
        bgColor: '#020f0a',
        overlayRgb: '2, 8, 5',
        overlayOpacity: { subtle: 0.28, balanced: 0.52, focused: 0.74 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'linear-gradient(160deg, #021a0e 0%, #04291a 40%, #031410 70%, #010806 100%)',
        timerColors: { light: '#34d399', deep: '#f472b6', custom: '#a78bfa' },
    },
    {
        id: 'nebula',
        name: 'Nebula',
        accent: '#a78bfa',
        image: 'nebula',
        light: false,
        bgColor: '#08030f',
        overlayRgb: '5, 2, 10',
        overlayOpacity: { subtle: 0.28, balanced: 0.52, focused: 0.74 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 35% 65%, #2d0f52 0%, #160828 50%, #05010c 100%)',
        timerColors: { light: '#a78bfa', deep: '#f87171', custom: '#38bdf8' },
    },
    {
        id: 'sakura',
        name: 'Sakura',
        accent: '#f472b6',
        image: 'sakura',
        light: false,
        bgColor: '#100510',
        overlayRgb: '8, 3, 8',
        overlayOpacity: { subtle: 0.32, balanced: 0.56, focused: 0.76 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 60% 25%, #2a0820 0%, #140511 55%, #070207 100%)',
        timerColors: { light: '#f472b6', deep: '#c084fc', custom: '#67e8f9' },
    },
    {
        id: 'midnight-rain',
        name: 'Midnight Rain',
        accent: '#60a5fa',
        image: 'midnight-rain',
        light: false,
        bgColor: '#04080f',
        overlayRgb: '3, 5, 12',
        overlayOpacity: { subtle: 0.25, balanced: 0.50, focused: 0.72 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'linear-gradient(180deg, #0a1628 0%, #060e1e 55%, #03080f 100%)',
        timerColors: { light: '#60a5fa', deep: '#f87171', custom: '#c084fc' },
    },
    {
        id: 'dunes',
        name: 'Dunes',
        accent: '#f59e0b',
        image: 'dunes',
        light: false,
        bgColor: '#0a0500',
        overlayRgb: '8, 4, 0',
        overlayOpacity: { subtle: 0.32, balanced: 0.56, focused: 0.76 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 120%, #3d1400 0%, #1c0700 55%, #080200 100%)',
        timerColors: { light: '#f59e0b', deep: '#ef4444', custom: '#a3e635' },
    },
    {
        id: 'mist',
        name: 'Mist',
        accent: '#86efac',
        image: 'mist',
        light: false,
        bgColor: '#040a06',
        overlayRgb: '3, 6, 4',
        overlayOpacity: { subtle: 0.30, balanced: 0.54, focused: 0.75 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'linear-gradient(145deg, #091408 0%, #050e06 50%, #030804 100%)',
        timerColors: { light: '#86efac', deep: '#fb7185', custom: '#67e8f9' },
    },
    {
        id: 'abyss',
        name: 'Abyss',
        accent: '#22d3ee',
        image: 'abyss',
        light: false,
        bgColor: '#000d18',
        overlayRgb: '0, 5, 12',
        overlayOpacity: { subtle: 0.25, balanced: 0.50, focused: 0.72 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 0%, #001e38 0%, #000c1a 55%, #00040c 100%)',
        timerColors: { light: '#22d3ee', deep: '#f87171', custom: '#a78bfa' },
    },
    {
        id: 'fuji-night',
        name: 'Fuji Night',
        accent: '#fb7185',
        image: 'fuji-night',
        light: false,
        bgColor: '#100510',
        overlayRgb: '8, 3, 8',
        overlayOpacity: { subtle: 0.32, balanced: 0.56, focused: 0.76 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 30%, #1a0515 0%, #0e030c 55%, #070207 100%)',
        timerColors: { light: '#fb7185', deep: '#c084fc', custom: '#38bdf8' },
    },
    {
        id: 'ember',
        name: 'Ember',
        accent: '#fb923c',
        image: 'ember',
        light: false,
        bgColor: '#0a0400',
        overlayRgb: '8, 3, 0',
        overlayOpacity: { subtle: 0.32, balanced: 0.56, focused: 0.76 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 120%, #3d1500 0%, #1c0800 55%, #080200 100%)',
        timerColors: { light: '#fb923c', deep: '#ef4444', custom: '#fbbf24' },
    },
    {
        id: 'forest',
        name: 'Forest',
        accent: '#a3b18a',
        image: 'forest',
        light: false,
        bgColor: '#060a04',
        overlayRgb: '4, 6, 3',
        overlayOpacity: { subtle: 0.30, balanced: 0.54, focused: 0.75 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'linear-gradient(160deg, #0e1408 0%, #0a0f06 50%, #060a04 100%)',
        timerColors: { light: '#a3b18a', deep: '#e07a5f', custom: '#81b29a' },
    },
    {
        id: 'neon',
        name: 'Neon',
        accent: '#00f0ff',
        image: 'neon',
        light: false,
        bgColor: '#020810',
        overlayRgb: '1, 4, 8',
        overlayOpacity: { subtle: 0.22, balanced: 0.46, focused: 0.70 },
        glassAlpha:     { subtle: 0.70, balanced: 0.86, focused: 0.95 },
        thumbGradient: 'radial-gradient(ellipse at 50% 80%, #002838 0%, #000c18 55%, #00040a 100%)',
        timerColors: { light: '#00f0ff', deep: '#ff4081', custom: '#b388ff' },
    },
    {
        id: 'gilded',
        name: 'Gilded',
        accent: '#fbbf24',
        image: 'gilded',
        light: false,
        bgColor: '#0a0700',
        overlayRgb: '6, 4, 0',
        overlayOpacity: { subtle: 0.30, balanced: 0.54, focused: 0.75 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 100%, #3d2800 0%, #1c1200 55%, #080500 100%)',
        timerColors: { light: '#fbbf24', deep: '#ef4444', custom: '#f59e0b' },
    },
    {
        id: 'crimson',
        name: 'Crimson',
        accent: '#f87171',
        image: 'crimson',
        light: false,
        bgColor: '#0c0304',
        overlayRgb: '8, 2, 3',
        overlayOpacity: { subtle: 0.30, balanced: 0.54, focused: 0.75 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 70%, #2a0808 0%, #140404 55%, #080202 100%)',
        timerColors: { light: '#f87171', deep: '#c084fc', custom: '#fb923c' },
    },
    {
        id: 'skyline',
        name: 'Skyline',
        accent: '#94a3b8',
        image: 'skyline',
        light: false,
        bgColor: '#050810',
        overlayRgb: '3, 5, 10',
        overlayOpacity: { subtle: 0.25, balanced: 0.50, focused: 0.72 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'linear-gradient(180deg, #0c1220 0%, #080e18 55%, #040810 100%)',
        timerColors: { light: '#94a3b8', deep: '#f87171', custom: '#60a5fa' },
    },
    {
        id: 'summit',
        name: 'Summit',
        accent: '#cbd5e1',
        image: 'summit',
        light: false,
        bgColor: '#0a0c10',
        overlayRgb: '6, 8, 12',
        overlayOpacity: { subtle: 0.25, balanced: 0.48, focused: 0.70 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'linear-gradient(160deg, #141820 0%, #0e1218 55%, #080a10 100%)',
        timerColors: { light: '#cbd5e1', deep: '#fb7185', custom: '#a78bfa' },
    },

    // ── Light themes ──────────────────────────────────────────
    {
        id: 'shore',
        name: 'Shore',
        accent: '#0d9488',
        image: 'shore',
        light: true,
        bgColor: '#e8f0ef',
        overlayRgb: '240, 245, 244',
        overlayOpacity: { subtle: 0.15, balanced: 0.35, focused: 0.58 },
        glassAlpha:     { subtle: 0.65, balanced: 0.80, focused: 0.92 },
        thumbGradient: 'linear-gradient(160deg, #b8e0d8 0%, #d4ece8 50%, #e8f4f0 100%)',
        timerColors: { light: '#0d9488', deep: '#dc2626', custom: '#7c3aed' },
    },
    {
        id: 'lagoon',
        name: 'Lagoon',
        accent: '#0f766e',
        image: 'lagoon',
        light: true,
        bgColor: '#e4efee',
        overlayRgb: '235, 242, 241',
        overlayOpacity: { subtle: 0.15, balanced: 0.35, focused: 0.58 },
        glassAlpha:     { subtle: 0.65, balanced: 0.80, focused: 0.92 },
        thumbGradient: 'linear-gradient(160deg, #a8d8d0 0%, #c8e8e4 50%, #e0f2ef 100%)',
        timerColors: { light: '#0f766e', deep: '#dc2626', custom: '#7c3aed' },
    },
];

// Image cache — maps theme id to loaded Image object
const _imageCache = {};
let _themeImagesPreloaded = false;

function preloadThemeImages() {
    if (_themeImagesPreloaded) return;
    _themeImagesPreloaded = true;
    DEEPLY_THEMES.forEach(t => {
        if (t.image) {
            const img = new Image();
            img.src = `assets/themes/${t.image}.jpg`;
            _imageCache[t.id] = img;
        }
    });
}

function getThemeById(id) {
    return DEEPLY_THEMES.find(t => t.id === id) || DEEPLY_THEMES[0];
}

// Track which theme the background is waiting for — cancels stale loads
let _pendingBgTheme = null;

// Apply a theme + overlay preset to the live UI
function applyTheme(themeId, overlay = 'balanced') {
    const theme = getThemeById(themeId);
    const root  = document.documentElement;
    const bgEl  = document.getElementById('theme-bg');
    const ovEl  = document.getElementById('theme-overlay');

    // Light / dark mode class
    root.classList.toggle('theme-light', !!theme.light);

    // Accent colour
    root.style.setProperty('--light', theme.accent);
    root.style.setProperty('--active-color', theme.accent);

    // Timer mode colors
    root.style.setProperty('--timer-light', theme.timerColors.light);
    root.style.setProperty('--timer-deep', theme.timerColors.deep);
    root.style.setProperty('--timer-custom', theme.timerColors.custom);
    root.style.setProperty('--deep', theme.timerColors.deep);

    // Text & surface colours
    if (theme.light) {
        root.style.setProperty('--text', '#0f172a');
        root.style.setProperty('--text-muted', '#334155');
        root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.14)');
        root.style.setProperty('--glass-shine', 'rgba(255, 255, 255, 0.6)');
        root.style.setProperty('--surface-hover', 'rgba(0, 0, 0, 0.05)');
        root.style.setProperty('--surface-dim', 'rgba(0, 0, 0, 0.07)');
        root.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.12)');
    } else {
        root.style.setProperty('--text', '#e8e8f0');
        root.style.setProperty('--text-muted', '#9a9ab0');
        root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--glass-shine', 'rgba(255, 255, 255, 0.04)');
        root.style.setProperty('--surface-hover', 'rgba(255, 255, 255, 0.04)');
        root.style.setProperty('--surface-dim', 'rgba(255, 255, 255, 0.05)');
        root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.06)');
    }

    // Background image — use cache, wait for load if not ready
    _pendingBgTheme = themeId;
    if (bgEl) {
        bgEl.style.backgroundColor = theme.bgColor;
        if (!theme.image) {
            bgEl.style.backgroundImage = 'none';
        } else {
            const cached = _imageCache[theme.id];
            if (cached && cached.complete && cached.naturalWidth > 0) {
                // Already loaded — apply instantly
                bgEl.style.backgroundImage = `url(${cached.src})`;
            } else {
                // Not loaded yet — show bgColor, apply image when ready
                bgEl.style.backgroundImage = 'none';
                const img = cached || new Image();
                if (!cached) {
                    img.src = `assets/themes/${theme.image}.jpg`;
                    _imageCache[theme.id] = img;
                }
                img.onload = () => {
                    // Only apply if this is still the active theme
                    if (_pendingBgTheme === themeId && bgEl) {
                        bgEl.style.backgroundImage = `url(${img.src})`;
                    }
                };
            }
        }
    }

    // Overlay
    if (ovEl) {
        const op = theme.overlayOpacity[overlay] ?? theme.overlayOpacity.balanced;
        ovEl.style.background = `rgba(${theme.overlayRgb}, ${op})`;
    }

    // Glass panel opacity
    const ga = theme.glassAlpha[overlay] ?? theme.glassAlpha.balanced;
    root.style.setProperty('--glass-bg', theme.light
        ? `rgba(255, 255, 255, ${ga})`
        : `rgba(12, 16, 35, ${ga})`);

    // Update MODES colors if they exist (defined in app.js)
    if (typeof MODES !== 'undefined') {
        MODES.light.color  = theme.timerColors.light;
        MODES.deep.color   = theme.timerColors.deep;
        MODES.custom.color = theme.timerColors.custom;
    }

    window._deeplyThemeId = themeId;
    window._deeplyOverlay  = overlay;
}
