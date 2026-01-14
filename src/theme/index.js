export const COLORS = {
    // Void Mode
    background: '#000000',
    surface: '#050505',

    // Glass Accents
    glassLight: 'rgba(255, 255, 255, 0.12)',
    glassMedium: 'rgba(255, 255, 255, 0.18)',
    glassHeavy: 'rgba(20, 20, 30, 0.85)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    textTertiary: 'rgba(255, 255, 255, 0.4)',

    // Accents
    // Accents (Monochrome Premium)
    primary: '#FFFFFF',    // Pure White for focus/action
    primaryGlow: 'rgba(255, 255, 255, 0.3)',
    secondary: '#A1A1AA',  // Metallic Gray

    // Semantic
    info: '#3B82F6',       // Subtle Blue for info
    error: '#EF4444',      // Red for errors only

    // Borders
    borderLight: 'rgba(255, 255, 255, 0.1)',
    borderFocus: '#FFFFFF', // High contrast focus
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    s: 12,
    m: 20,
    l: 30, // For big glass cards
    round: 999, // For pills
};

export const SHADOWS = {
    glass: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    glow: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 10,
    }
};

export const STYLES = {
    // Helper for web-only backdrop filter
    glass: {
        backgroundColor: COLORS.glassLight,
        borderColor: COLORS.borderLight,
        borderWidth: 1,
        backdropFilter: 'blur(25px)', // Web only property
    }
};
