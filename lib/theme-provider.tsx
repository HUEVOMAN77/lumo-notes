import AsyncStorage from "@react-native-async-storage/async-storage";
import { Animated, Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { AppThemes, type AppThemeId, type ColorScheme, type ThemeColorPalette } from "@/lib/_core/theme";

export type ThemePreference = AppThemeId | "system";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  palette: ThemeColorPalette;
  themePreference: ThemePreference;
  themeId: AppThemeId;
  setThemePreference: (preference: ThemePreference) => void;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = "@lumo-notes/theme-preference-v2";

function resolvePreference(stored: string | null): ThemePreference {
  if (stored === "light") return "white";
  if (stored === "dark") return "onyx";
  if (stored === "system" || stored === "lumo" || stored === "white" || stored === "onyx" || stored === "neon" || stored === "sunset" || stored === "aurora") return stored;
  return "lumo";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("lumo");
  const transitionOpacity = useRef(new Animated.Value(1)).current;
  const themeId: AppThemeId = themePreference === "system" ? (systemScheme === "dark" ? "onyx" : "lumo") : themePreference;
  const activeTheme = AppThemes[themeId];
  const colorScheme = activeTheme.colorScheme;

  const applyTheme = useCallback((nextTheme: typeof activeTheme) => {
    nativewindColorScheme.set(nextTheme.colorScheme);
    Appearance.setColorScheme?.(nextTheme.colorScheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = nextTheme.colorScheme;
      root.classList.toggle("dark", nextTheme.colorScheme === "dark");
      Object.entries(nextTheme.palette).forEach(([token, value]) => root.style.setProperty(`--color-${token}`, value));
    }
  }, []);

  useEffect(() => { AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => setThemePreferenceState(resolvePreference(stored))); }, []);
  useEffect(() => {
    applyTheme(activeTheme);
    transitionOpacity.setValue(0.84);
    Animated.timing(transitionOpacity, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [activeTheme, applyTheme, transitionOpacity]);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
  }, []);
  const setColorScheme = useCallback((scheme: ColorScheme) => setThemePreference(scheme === "dark" ? "onyx" : "white"), [setThemePreference]);

  const themeVariables = useMemo(() => vars(Object.fromEntries(Object.entries(activeTheme.palette).filter(([key]) => !["text", "tint", "icon", "tabIconDefault", "tabIconSelected"].includes(key)).map(([key, value]) => [`color-${key}`, value]))), [activeTheme.palette]);
  const value = useMemo(() => ({ colorScheme, palette: activeTheme.palette, themePreference, themeId, setThemePreference, setColorScheme }), [activeTheme.palette, colorScheme, setColorScheme, setThemePreference, themeId, themePreference]);

  return <ThemeContext.Provider value={value}><View style={[{ flex: 1 }, themeVariables]}><Animated.View style={{ flex: 1, opacity: transitionOpacity }}>{children}</Animated.View></View></ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
