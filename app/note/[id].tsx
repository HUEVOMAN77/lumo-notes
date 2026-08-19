import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { haptic } from "@/lib/haptics";
import { NOTE_COLORS, type NoteColor } from "@/lib/notes";
import { useNotes } from "@/lib/notes-provider";

const COLOR_OPTIONS: Record<NoteColor, { label: string; fill: string }> = {
  lavender: { label: "Lavanda", fill: "#B7AEFF" },
  peach: { label: "Melocotón", fill: "#FFB58B" },
  mint: { label: "Menta", fill: "#82DAB7" },
  sky: { label: "Cielo", fill: "#84C8FF" },
};

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNote, updateNote, deleteNote } = useNotes();
  const note = useMemo(() => getNote(id), [getNote, id]);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [tag, setTag] = useState(note?.tag ?? "Sin etiqueta");
  const [color, setColor] = useState<NoteColor>(note?.color ?? "lavender");
  const [isFavorite, setIsFavorite] = useState(note?.isFavorite ?? false);
  const [savedLabel, setSavedLabel] = useState("Guardado");

  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => {
      void updateNote(note.id, { title, content, tag: tag.trim() || "Sin etiqueta", color, isFavorite });
      setSavedLabel("Guardado");
    }, 550);
    setSavedLabel("Guardando…");
    return () => clearTimeout(timer);
  }, [color, content, isFavorite, note, tag, title, updateNote]);

  if (!note) {
    return <SafeAreaView style={styles.missing}><MaterialIcons name="search-off" size={34} color="#6D5DFB" /><Text style={styles.missingTitle}>Esta nota ya no existe</Text><Pressable onPress={() => router.back()} style={styles.backToNotes}><Text style={styles.backToNotesText}>Volver a mis notas</Text></Pressable></SafeAreaView>;
  }

  const toggleFavorite = () => {
    haptic.selection();
    setIsFavorite((current) => !current);
  };
  const toggleArchive = () => {
    haptic.medium();
    void updateNote(note.id, { isArchived: !note.isArchived });
    router.back();
  };
  const confirmDelete = () => {
    Alert.alert("¿Eliminar esta nota?", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => { haptic.medium(); void deleteNote(note.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={23} color="#342F42" /></Pressable>
          <Text style={styles.saved}>{savedLabel}</Text>
          <View style={styles.topActions}>
            <Pressable accessibilityRole="button" accessibilityLabel={isFavorite ? "Quitar de favoritas" : "Añadir a favoritas"} onPress={toggleFavorite} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}><MaterialIcons name={isFavorite ? "star" : "star-border"} size={23} color={isFavorite ? "#D89717" : "#342F42"} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Más acciones" onPress={() => Alert.alert("Organizar nota", "Elige una acción", [{ text: note.isArchived ? "Restaurar" : "Archivar", onPress: toggleArchive }, { text: "Eliminar", style: "destructive", onPress: confirmDelete }, { text: "Cancelar", style: "cancel" }])} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}><MaterialIcons name="more-horiz" size={25} color="#342F42" /></Pressable>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TextInput value={title} onChangeText={setTitle} placeholder="Título" placeholderTextColor="#AAA4B3" style={styles.titleInput} multiline maxLength={120} returnKeyType="next" />
          <View style={styles.tagField}><MaterialIcons name="sell" size={17} color="#746E83" /><TextInput value={tag} onChangeText={setTag} placeholder="Etiqueta" placeholderTextColor="#908A99" style={styles.tagInput} maxLength={28} returnKeyType="done" /></View>
          <TextInput value={content} onChangeText={setContent} placeholder="Escribe lo que quieras recordar…" placeholderTextColor="#AAA4B3" style={styles.bodyInput} multiline textAlignVertical="top" autoFocus={!note.title && !note.content} />
          <View style={styles.colorSection}><Text style={styles.colorLabel}>COLOR DE LA NOTA</Text><View style={styles.colorOptions}>{NOTE_COLORS.map((item) => { const selected = color === item; return <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={`Color ${COLOR_OPTIONS[item].label}`} onPress={() => { haptic.selection(); setColor(item); }} style={[styles.colorChoice, selected && styles.colorChoiceSelected]}><View style={[styles.colorDot, { backgroundColor: COLOR_OPTIONS[item].fill }]}>{selected ? <MaterialIcons name="check" size={17} color="#FFFFFF" /> : null}</View></Pressable>; })}</View></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#FFFFFF", flex: 1 },
  keyboard: { flex: 1 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 68, paddingHorizontal: 18 },
  topActions: { flexDirection: "row", gap: 4 },
  circleButton: { alignItems: "center", borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  pressed: { backgroundColor: "#F0EDFF", opacity: 0.7 },
  saved: { color: "#7B7489", fontSize: 12, fontWeight: "700" },
  content: { flexGrow: 1, paddingBottom: 32, paddingHorizontal: 23 },
  titleInput: { color: "#1E1B2E", fontSize: 30, fontWeight: "800", letterSpacing: -0.7, lineHeight: 38, minHeight: 48, padding: 0 },
  tagField: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#F3F1F7", borderRadius: 11, flexDirection: "row", gap: 7, marginTop: 16, paddingHorizontal: 10, height: 37 },
  tagInput: { color: "#5E5869", fontSize: 13, fontWeight: "700", minWidth: 90, padding: 0 },
  bodyInput: { color: "#3E3949", flex: 1, fontSize: 17, lineHeight: 27, marginTop: 25, minHeight: 280, padding: 0 },
  colorSection: { borderTopColor: "#EEEAF2", borderTopWidth: 1, marginTop: 18, paddingTop: 19 },
  colorLabel: { color: "#827C8C", fontSize: 11, fontWeight: "800", letterSpacing: 0.9 },
  colorOptions: { flexDirection: "row", gap: 14, marginTop: 13 },
  colorChoice: { borderColor: "transparent", borderRadius: 18, borderWidth: 2, padding: 2 },
  colorChoiceSelected: { borderColor: "#1E1B2E" },
  colorDot: { alignItems: "center", borderRadius: 14, height: 28, justifyContent: "center", width: 28 },
  missing: { alignItems: "center", backgroundColor: "#FFFFFF", flex: 1, gap: 12, justifyContent: "center", padding: 24 },
  missingTitle: { color: "#1E1B2E", fontSize: 19, fontWeight: "800" },
  backToNotes: { backgroundColor: "#6D5DFB", borderRadius: 14, marginTop: 8, paddingHorizontal: 17, paddingVertical: 12 },
  backToNotesText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
