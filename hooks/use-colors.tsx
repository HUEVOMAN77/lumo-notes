import { type ThemeColorPalette } from "@/constants/theme";
import { useThemeContext } from "@/lib/theme-provider";

export function useColors(): ThemeColorPalette {
  return useThemeContext().palette;
}
