import { Platform } from "react-native";

import themeConfig from "@/theme.config";

export type ColorScheme = "light" | "dark";

export const ThemeColors = themeConfig.themeColors;

type ThemeColorTokens = typeof ThemeColors;
type ThemeColorName = keyof ThemeColorTokens;
type SchemePalette = Record<ColorScheme, Record<ThemeColorName, string>>;
type SchemePaletteItem = SchemePalette[ColorScheme];

function buildSchemePalette(colors: ThemeColorTokens): SchemePalette {
  const palette: SchemePalette = { light: {} as SchemePalette["light"], dark: {} as SchemePalette["dark"] };
  (Object.keys(colors) as ThemeColorName[]).forEach((name) => {
    const swatch = colors[name];
    palette.light[name] = swatch.light;
    palette.dark[name] = swatch.dark;
  });
  return palette;
}

export const SchemeColors = buildSchemePalette(ThemeColors);

type RuntimePalette = SchemePaletteItem & {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  border: string;
};

function buildRuntimePalette(base: SchemePaletteItem): RuntimePalette {
  return { ...base, text: base.foreground, background: base.background, tint: base.primary, icon: base.muted, tabIconDefault: base.muted, tabIconSelected: base.primary, border: base.border };
}

export const Colors = {
  light: buildRuntimePalette(SchemeColors.light),
  dark: buildRuntimePalette(SchemeColors.dark),
} satisfies Record<ColorScheme, RuntimePalette>;

export type ThemeColorPalette = RuntimePalette;

export type AppThemeId = "lumo" | "white" | "onyx" | "neon" | "sunset" | "aurora";
export type AppTheme = { label: string; description: string; colorScheme: ColorScheme; palette: ThemeColorPalette; preview: [string, string, string] };

function palette(tokens: SchemePaletteItem): ThemeColorPalette {
  return buildRuntimePalette(tokens);
}

export const AppThemes: Record<AppThemeId, AppTheme> = {
  lumo: { label: "Lumo", description: "Violeta editorial", colorScheme: "light", palette: Colors.light, preview: ["#6D5DFB", "#B7AEFF", "#F3F1FF"] },
  white: { label: "Blanco", description: "Papel luminoso", colorScheme: "light", palette: palette({ primary: "#202020", background: "#FFFFFF", surface: "#F6F6F6", foreground: "#161616", muted: "#747474", border: "#E7E7E7", success: "#21855A", warning: "#B36A00", error: "#C5374C" }), preview: ["#FFFFFF", "#DADADA", "#202020"] },
  onyx: { label: "Ónix", description: "Negro profundo", colorScheme: "dark", palette: palette({ primary: "#B9AFFF", background: "#08080B", surface: "#17171D", foreground: "#F4F3F8", muted: "#A4A1AE", border: "#2A2932", success: "#57D3A0", warning: "#F5BD52", error: "#FF7B8D" }), preview: ["#08080B", "#2A2932", "#B9AFFF"] },
  neon: { label: "Neón", description: "Cian eléctrico", colorScheme: "dark", palette: palette({ primary: "#48FFE0", background: "#070B16", surface: "#101A2D", foreground: "#E9FFFB", muted: "#9BB5C5", border: "#1D3850", success: "#61F6B6", warning: "#FFE76A", error: "#FF6DB3" }), preview: ["#070B16", "#48FFE0", "#FF6DB3"] },
  sunset: { label: "Atardecer", description: "Coral y ámbar", colorScheme: "light", palette: palette({ primary: "#E45D51", background: "#FFF8F4", surface: "#FFF0E7", foreground: "#382220", muted: "#8E6E68", border: "#F1D6CE", success: "#299C75", warning: "#C56D1E", error: "#CE4853" }), preview: ["#E45D51", "#FFAD67", "#FFF0E7"] },
  aurora: { label: "Aurora", description: "Menta boreal", colorScheme: "dark", palette: palette({ primary: "#8EF2C5", background: "#0A1720", surface: "#112934", foreground: "#ECFFF9", muted: "#A3C0BD", border: "#24444A", success: "#8EF2C5", warning: "#F6C76A", error: "#FF8095" }), preview: ["#0A1720", "#8EF2C5", "#81C7FF"] },
};

export const Fonts = Platform.select({
  ios: { sans: "system-ui", serif: "ui-serif", rounded: "ui-rounded", mono: "ui-monospace" },
  default: { sans: "normal", serif: "serif", rounded: "normal", mono: "monospace" },
  web: { sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", serif: "Georgia, 'Times New Roman', serif", rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic Pro', Meiryo, 'MS PGothic', sans-serif", mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" },
});
