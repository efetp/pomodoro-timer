// ============================================================
// Deeply — Theme Engine
// ============================================================

const DEEPLY_THEMES = [
    {
        id: 'void',
        name: 'Void',
        accent: '#3caed1',
        image: null,
        bgColor: '#0b1220',
        overlayRgb: '5, 8, 18',
        overlayOpacity: { subtle: 0.0, balanced: 0.0, focused: 0.45 },
        glassAlpha:     { subtle: 0.80, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 110%, #1e2f4a 0%, #0d1628 45%, #070d1a 100%)',
    },
    {
        id: 'aurora',
        name: 'Aurora',
        accent: '#34d399',
        image: 'B-vjWtZLC9g',
        bgColor: '#020f0a',
        overlayRgb: '2, 8, 5',
        overlayOpacity: { subtle: 0.28, balanced: 0.52, focused: 0.74 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'linear-gradient(160deg, #021a0e 0%, #04291a 40%, #031410 70%, #010806 100%)',
    },
    {
        id: 'nebula',
        name: 'Nebula',
        accent: '#a78bfa',
        image: '7SNIi6tu-68',
        bgColor: '#08030f',
        overlayRgb: '5, 2, 10',
        overlayOpacity: { subtle: 0.28, balanced: 0.52, focused: 0.74 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 35% 65%, #2d0f52 0%, #160828 50%, #05010c 100%)',
    },
    {
        id: 'sakura',
        name: 'Sakura',
        accent: '#f472b6',
        image: '2JEEwLUo5Sc',
        bgColor: '#100510',
        overlayRgb: '8, 3, 8',
        overlayOpacity: { subtle: 0.32, balanced: 0.56, focused: 0.76 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 60% 25%, #2a0820 0%, #140511 55%, #070207 100%)',
    },
    {
        id: 'midnight-rain',
        name: 'Midnight Rain',
        accent: '#60a5fa',
        image: 'gtG0y9CUgcA',
        bgColor: '#04080f',
        overlayRgb: '3, 5, 12',
        overlayOpacity: { subtle: 0.25, balanced: 0.50, focused: 0.72 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'linear-gradient(180deg, #0a1628 0%, #060e1e 55%, #03080f 100%)',
    },
    {
        id: 'dunes',
        name: 'Dunes',
        accent: '#f59e0b',
        image: 'CfDta2k-15g',
        bgColor: '#0a0500',
        overlayRgb: '8, 4, 0',
        overlayOpacity: { subtle: 0.32, balanced: 0.56, focused: 0.76 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 120%, #3d1400 0%, #1c0700 55%, #080200 100%)',
    },
    {
        id: 'mist',
        name: 'Mist',
        accent: '#86efac',
        image: 'tvJX2DTeCiQ',
        bgColor: '#040a06',
        overlayRgb: '3, 6, 4',
        overlayOpacity: { subtle: 0.30, balanced: 0.54, focused: 0.75 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'linear-gradient(145deg, #091408 0%, #050e06 50%, #030804 100%)',
    },
    {
        id: 'abyss',
        name: 'Abyss',
        accent: '#22d3ee',
        image: 'nsKKH8ILrkM',
        bgColor: '#000d18',
        overlayRgb: '0, 5, 12',
        overlayOpacity: { subtle: 0.25, balanced: 0.50, focused: 0.72 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 0%, #001e38 0%, #000c1a 55%, #00040c 100%)',
    },
    {
        id: 'fuji-night',
        name: 'Fuji Night',
        accent: '#fb7185',
        image: '1QFBle6fAHU',
        bgColor: '#100510',
        overlayRgb: '8, 3, 8',
        overlayOpacity: { subtle: 0.32, balanced: 0.56, focused: 0.76 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 30%, #1a0515 0%, #0e030c 55%, #070207 100%)',
    },
    {
        id: 'ember',
        name: 'Ember',
        accent: '#fb923c',
        image: 'MKKs8DQpKfE',
        bgColor: '#0a0400',
        overlayRgb: '8, 3, 0',
        overlayOpacity: { subtle: 0.32, balanced: 0.56, focused: 0.76 },
        glassAlpha:     { subtle: 0.72, balanced: 0.88, focused: 0.96 },
        thumbGradient: 'radial-gradient(ellipse at 50% 120%, #3d1500 0%, #1c0800 55%, #080200 100%)',
    },
];

function getThemeById(id) {
    return DEEPLY_THEMES.find(t => t.id === id) || DEEPLY_THEMES[0];
}

// Apply a theme + overlay preset to the live UI
function applyTheme(themeId, overlay = 'balanced', animate = true) {
    const theme = getThemeById(themeId);
    const root  = document.documentElement;
    const bgEl  = document.getElementById('theme-bg');
    const ovEl  = document.getElementById('theme-overlay');

    const doApply = () => {
        // Accent colour — updates timer ring, buttons, all --active-color uses
        root.style.setProperty('--light', theme.accent);
        root.style.setProperty('--active-color', theme.accent);

        // Background image / colour
        if (bgEl) {
            if (theme.image) {
                bgEl.style.backgroundImage =
                    `url(https://images.unsplash.com/photo-${theme.image}?w=1920&h=1080&fit=crop&q=80&auto=format)`;
            } else {
                bgEl.style.backgroundImage = 'none';
            }
            bgEl.style.backgroundColor = theme.bgColor;
        }

        // Dark overlay on top of image
        if (ovEl) {
            const op = theme.overlayOpacity[overlay] ?? theme.overlayOpacity.balanced;
            ovEl.style.background = `rgba(${theme.overlayRgb}, ${op})`;
        }

        // Glass panel opacity
        const ga = theme.glassAlpha[overlay] ?? theme.glassAlpha.balanced;
        root.style.setProperty('--glass-bg', `rgba(12, 16, 35, ${ga})`);
    };

    if (animate && bgEl) {
        bgEl.style.transition = 'opacity 0.2s ease';
        bgEl.style.opacity = '0';
        setTimeout(() => {
            doApply();
            bgEl.style.opacity = '1';
        }, 200);
    } else {
        if (bgEl) { bgEl.style.transition = 'none'; bgEl.style.opacity = '1'; }
        doApply();
    }

    window._deeplyThemeId = themeId;
    window._deeplyOverlay  = overlay;
}
