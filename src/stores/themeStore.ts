import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

// Read initial theme from localStorage or default to 'dark'
const getInitialTheme = (): Theme => {
    try {
        const stored = localStorage.getItem('family-theme');
        if (stored === 'light' || stored === 'dark') return stored;
    } catch { }
    return 'dark';
};

// Apply theme to the DOM
const applyTheme = (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
        localStorage.setItem('family-theme', theme);
    } catch { }
};

// Apply immediately on load (before React renders)
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
    theme: initialTheme,
    toggleTheme: () =>
        set((state) => {
            const next = state.theme === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            return { theme: next };
        }),
    setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
    },
}));
