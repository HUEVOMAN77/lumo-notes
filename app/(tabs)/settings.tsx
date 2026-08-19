import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { type ThemePreference, useThemeContext } from "@/lib/theme-provider";

const OPTIONS: { key: ThemePreference; label: string; icon: "light-mode" | "dark-mode" | "brightness-auto" }[] = [
  { key: "light", label: "Claro", icon: "light-mode" },
  { key: "dark", label: "Oscuro", icon: "dark-mode" },
  { key: "system", label: "Sistema", icon: "brightness-auto" },
];

export default function SettingsScreen() {
  const { themePreference, setThemePreference } = useThemeContext();
  return (
    <ScreenContainer>
      <View style={styles.header}><Text style={styles.eyebrow}>PREFERENCIAS</Text><Text style={styles.title}>Ajustes</Text><Text style={styles.subtitle}>Haz que Lumo se sienta como tu espacio.</Text></View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Apariencia</Text><View style={styles.choiceGroup}>{OPTIONS.map((option) => {
        const active = option.key === themePreference;
        return <Pressable key={option.key} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => { haptic.selection(); setThemePreference(option.key); }} style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.choicePressed]}><MaterialIcons name={option.icon} size={21} color={active ? "#FFFFFF" : "#625C70"} /><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{option.label}</Text></Pressable>;
      })}</View></View>
      <View style={styles.infoCard}><View style={styles.infoIcon}><MaterialIcons name="verified-user" size={22} color="#2CB67D" /></View><View style={styles.infoCopy}><Text style={styles.infoTitle}>Tus notas son privadas</Text><Text style={styles.infoDescription}>Se guardan solo en este dispositivo, sin cuenta ni sincronización externa.</Text></View></View>
      <View style={styles.footer}><Text style={styles.footerBrand}>LUMO NOTES</Text><Text style={styles.footerVersion}>Versión 1.0.0</Text></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 14 },
  eyebrow: { color: "#6D5DFB", fontSize: 11, fontWeight: "800", letterSpacing: 1.1, lineHeight: 16 },
  title: { color: "#1E1B2E", fontSize: 31, fontWeight: "800", letterSpacing: -0.9, lineHeight: 39, marginTop: 2 },
  subtitle: { color: "#756F83", fontSize: 15, lineHeight: 22, marginTop: 1 },
  section: { marginTop: 31, paddingHorizontal: 20 },
  sectionTitle: { color: "#5C5668", fontSize: 13, fontWeight: "800", letterSpacing: 0.55, marginBottom: 12, textTransform: "uppercase" },
  choiceGroup: { flexDirection: "row", gap: 8 },
  choice: { alignItems: "center", backgroundColor: "#F4F2F8", borderColor: "#E7E4EB", borderRadius: 16, borderWidth: 1, flex: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 52, paddingHorizontal: 8 },
  choiceActive: { backgroundColor: "#6D5DFB", borderColor: "#6D5DFB" },
  choicePressed: { opacity: 0.75 },
  choiceText: { color: "#625C70", fontSize: 13, fontWeight: "800" },
  choiceTextActive: { color: "#FFFFFF" },
  infoCard: { alignItems: "flex-start", backgroundColor: "#EAF8F1", borderRadius: 20, flexDirection: "row", gap: 12, marginHorizontal: 20, marginTop: 32, padding: 17 },
  infoIcon: { alignItems: "center", backgroundColor: "#D4F1E2", borderRadius: 12, height: 42, justifyContent: "center", width: 42 },
  infoCopy: { flex: 1 },
  infoTitle: { color: "#1A674A", fontSize: 15, fontWeight: "800", lineHeight: 20 },
  infoDescription: { color: "#39725B", fontSize: 13, lineHeight: 19, marginTop: 3 },
  footer: { alignItems: "center", marginTop: "auto", paddingBottom: 28 },
  footerBrand: { color: "#928B9F", fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  footerVersion: { color: "#AAA4B2", fontSize: 12, marginTop: 5 },
});
