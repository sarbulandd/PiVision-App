import { createContext, useContext, useState, ReactNode } from "react";

export const DARK_COLORS = {
    isDark: true,
    background: "#020617",
    card: "#0f172a",
    cardWhite: "#ffffff",
    text: "#ffffff",
    textDark: "#111827",
    muted: "#9ca3af",
    mutedDark: "#6b7280",
    border: "#1e293b",
    sectionTitle: "#9ca3af",
};

export const LIGHT_COLORS = {
    isDark: false,
    background: "#f1f5f9",
    card: "#ffffff",
    cardWhite: "#ffffff",
    text: "#0f172a",
    textDark: "#111827",
    muted: "#64748b",
    mutedDark: "#6b7280",
    border: "#e2e8f0",
    sectionTitle: "#64748b",
};

export type AppColors = typeof DARK_COLORS;

interface ThemeContextType {
    colors: AppColors;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    colors: DARK_COLORS,
    isDark: true,
    toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(true);
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
    return (
        <ThemeContext.Provider value={{ colors, isDark, toggleTheme: () => setIsDark((d) => !d) }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
