import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { pickNoteImages, recoverPendingNoteImages, removeLocalAttachments } from "@/lib/attachments";
import { haptic } from "@/lib/haptics";
import { NOTE_COLORS, NOTE_MOODS, type NoteAttachment, type NoteColor, type NoteMood } from "@/lib/notes";
import { useNotes } from "@/lib/notes-provider";
import { cancelReminder, scheduleNoteReminder } from "@/lib/reminders";
import { useColors } from "@/hooks/use-colors";

const COLOR_OPTIONS: Record<NoteColor, { label: string; fill: string }> = {
  lavender: { label: "Lavanda", fill: "#B7AEFF" },
  peach: { label: "Melocotón", fill: "#FFB58B" },
  mint: { label: "Menta", fill: "#82DAB7" },
  sky: { label: "Cielo", fill: "#84C8FF" },
};

const MOOD_OPTIONS: Record<NoteMood, { label: string; icon: "spa" | "auto-awesome" | "center-focus-strong" | "bolt"; tint: string }> = {
  calm: { label: "Calma", icon: "spa", tint: "#478F78" },
  spark: { label: "Chispa", icon: "auto-awesome", tint: "#A56B18" },
  focus: { label: "Enfoque", icon: "center-focus-strong", tint: "#6254EA" },
  brave: { label: "Valentía", icon: "bolt", tint: "#CE5872" },
};

function futureIso(minutesFromNow: number): string {
  return new Date(Date.now() + minutesFromNow * 60_000).toISOString();
}

function tomorrowMorningIso(): string {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  value.setHours(9, 0, 0, 0);
  return value.toISOString();
}

function formatReminder(value?: string): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNote, updateNote, deleteNote } = useNotes();
  const colors = useColors();
  const note = useMemo(() => getNote(id), [getNote, id]);
  const noteId = note?.id;
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [tag, setTag] = useState(note?.tag ?? "Sin etiqueta");
  const [color, setColor] = useState<NoteColor>(note?.color ?? "lavender");
  const [mood, setMood] = useState<NoteMood>(note?.mood ?? "calm");
  const [attachments, setAttachments] = useState<NoteAttachment[]>(note?.attachments ?? []);
  const [isFavorite, setIsFavorite] = useState(note?.isFavorite ?? false);
  const [savedLabel, setSavedLabel] = useState("Guardado");

  useEffect(() => {
    if (!noteId) return;
    const timer = setTimeout(() => {
      void updateNote(noteId, { title, content, tag: tag.trim() || "Sin etiqueta", color, mood, attachments, isFavorite });
      setSavedLabel("Guardado");
    }, 550);
    setSavedLabel("Guardando…");
    return () => clearTimeout(timer);
  }, [attachments, color, content, isFavorite, mood, noteId, tag, title, updateNote]);

  useEffect(() => {
    void recoverPendingNoteImages().then((pending) => {
      if (!pending.length) return;
      setAttachments((current) => [...current, ...pending].slice(0, 4));
    });
  }, []);

  if (!note) {
    return <SafeAreaView style={[styles.missing, { backgroundColor: colors.background }]}><MaterialIcons name="search-off" size={34} color={colors.primary} /><Text style={[styles.missingTitle, { color: colors.foreground }]}>Esta nota ya no existe</Text><Pressable onPress={() => router.back()} style={[styles.backToNotes, { backgroundColor: colors.primary }]}><Text style={[styles.backToNotesText, { color: colors.background }]}>Volver a mis notas</Text></Pressable></SafeAreaView>;
  }

  const toggleFavorite = () => { haptic.selection(); setIsFavorite((current) => !current); };
  const toggleArchive = () => { haptic.medium(); void updateNote(note.id, { isArchived: !note.isArchived }); router.back(); };
  const confirmDelete = () => {
    Alert.alert("¿Eliminar esta nota?", "También se eliminarán sus recordatorios y adjuntos locales.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => { haptic.medium(); void deleteNote(note.id); router.back(); } },
    ]);
  };
  const addImages = async () => {
    const remaining = 4 - attachments.length;
    if (remaining <= 0) { Alert.alert("Límite de adjuntos", "Cada nota admite hasta cuatro imágenes para mantenerla ligera."); return; }
    const selected = await pickNoteImages();
    if (!selected.length) return;
    haptic.light();
    setAttachments((current) => [...current, ...selected].slice(0, 4));
  };
  const removeImage = (attachment: NoteAttachment) => {
    haptic.selection();
    setAttachments((current) => current.filter((item) => item.id !== attachment.id));
    void removeLocalAttachments([attachment]);
  };
  const setReminder = async (reminderAt: string) => {
    const notificationId = await scheduleNoteReminder({ noteId: note.id, title, reminderAt, previousNotificationId: note.notificationId });
    if (!notificationId) { Alert.alert("Permiso necesario", "Activa las notificaciones para recibir este recordatorio en el dispositivo."); return; }
    await updateNote(note.id, { reminderAt, notificationId });
    haptic.success();
    setSavedLabel("Recordatorio listo");
  };
  const manageReminder = () => {
    Alert.alert("Recordatorio local", "Lumo te avisará aunque la aplicación esté cerrada.", [
      { text: "En 1 hora", onPress: () => { void setReminder(futureIso(60)); } },
      { text: "Mañana a las 09:00", onPress: () => { void setReminder(tomorrowMorningIso()); } },
      ...(note.reminderAt ? [{ text: "Quitar recordatorio", style: "destructive" as const, onPress: () => { void cancelReminder(note.notificationId); void updateNote(note.id, { reminderAt: undefined, notificationId: undefined }); } }] : []),
      { text: "Cancelar", style: "cancel" as const },
    ]);
  };
  const manageCapsule = () => {
    Alert.alert("Cápsula de tiempo", "Oculta el texto de esta nota hasta la fecha elegida. Podrás verla en el archivo de tiempo.", [
      { text: "Abrir mañana", onPress: () => { void updateNote(note.id, { unlockAt: futureIso(24 * 60) }); haptic.light(); } },
      { text: "Abrir en 7 días", onPress: () => { void updateNote(note.id, { unlockAt: futureIso(7 * 24 * 60) }); haptic.light(); } },
      ...(note.unlockAt ? [{ text: "Abrir ahora", style: "destructive" as const, onPress: () => { void updateNote(note.id, { unlockAt: undefined }); } }] : []),
      { text: "Cancelar", style: "cancel" as const },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={23} color={colors.foreground} /></Pressable>
          <Text style={[styles.saved, { color: colors.muted }]}>{savedLabel}</Text>
          <View style={styles.topActions}>
            <Pressable accessibilityRole="button" accessibilityLabel={isFavorite ? "Quitar de favoritas" : "Añadir a favoritas"} onPress={toggleFavorite} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}><MaterialIcons name={isFavorite ? "star" : "star-border"} size={23} color={isFavorite ? colors.warning : colors.foreground} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Más acciones" onPress={() => Alert.alert("Organizar nota", "Elige una acción", [{ text: note.isArchived ? "Restaurar" : "Archivar", onPress: toggleArchive }, { text: "Eliminar", style: "destructive", onPress: confirmDelete }, { text: "Cancelar", style: "cancel" }])} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}><MaterialIcons name="more-horiz" size={25} color={colors.foreground} /></Pressable>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TextInput value={title} onChangeText={setTitle} placeholder="Título" placeholderTextColor={colors.muted} style={[styles.titleInput, { color: colors.foreground }]} multiline maxLength={120} returnKeyType="next" />
          <View style={[styles.tagField, { backgroundColor: colors.surface }]}><MaterialIcons name="sell" size={17} color={colors.muted} /><TextInput value={tag} onChangeText={setTag} placeholder="Etiqueta" placeholderTextColor={colors.muted} style={[styles.tagInput, { color: colors.foreground }]} maxLength={28} returnKeyType="done" /></View>
          <View style={styles.signalRow}>
            <Pressable onPress={manageReminder} style={({ pressed }) => [styles.signalPill, { backgroundColor: note.reminderAt ? `${colors.primary}1C` : colors.surface }, pressed && styles.signalPressed]}><MaterialIcons name="notifications-none" size={17} color={note.reminderAt ? colors.primary : colors.muted} /><Text style={[styles.signalText, { color: note.reminderAt ? colors.primary : colors.muted }]}>{note.reminderAt ? formatReminder(note.reminderAt) : "Recordarme"}</Text></Pressable>
            <Pressable onPress={manageCapsule} style={({ pressed }) => [styles.signalPill, { backgroundColor: note.unlockAt ? `${colors.warning}22` : colors.surface }, pressed && styles.signalPressed]}><MaterialIcons name={note.unlockAt ? "lock-clock" : "lock-outline"} size={17} color={note.unlockAt ? colors.warning : colors.muted} /><Text style={[styles.signalText, { color: note.unlockAt ? colors.warning : colors.muted }]}>{note.unlockAt ? "Cápsula activa" : "Cápsula"}</Text></Pressable>
          </View>
          <TextInput value={content} onChangeText={setContent} placeholder="Escribe lo que quieras recordar…" placeholderTextColor={colors.muted} style={[styles.bodyInput, { color: colors.foreground }]} multiline textAlignVertical="top" autoFocus={!note.title && !note.content} />
          <View style={[styles.attachmentsSection, { borderTopColor: colors.border }]}>
            <View style={styles.sectionHeader}><View><Text style={[styles.sectionTitle, { color: colors.muted }]}>MEMORIAS VISUALES</Text><Text style={[styles.sectionDescription, { color: colors.muted }]}>Hasta cuatro imágenes por nota.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Adjuntar imágenes" onPress={() => { void addImages(); }} style={({ pressed }) => [styles.addImageButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><MaterialIcons name="add-photo-alternate" size={19} color={colors.background} /></Pressable></View>
            {attachments.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachmentList}>{attachments.map((attachment) => <View key={attachment.id} style={styles.imageFrame}><Image source={{ uri: attachment.uri }} style={styles.attachmentImage} /><Pressable accessibilityRole="button" accessibilityLabel="Quitar imagen" onPress={() => removeImage(attachment)} style={[styles.removeImageButton, { backgroundColor: colors.foreground }]}><MaterialIcons name="close" size={15} color={colors.background} /></Pressable></View>)}</ScrollView> : <Pressable onPress={() => { void addImages(); }} style={({ pressed }) => [styles.emptyAttachment, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="image" size={21} color={colors.muted} /><Text style={[styles.emptyAttachmentText, { color: colors.muted }]}>Añade una imagen a esta idea</Text></Pressable>}
          </View>
          <View style={styles.moodSection}><Text style={styles.sectionTitle}>PULSO DE LA IDEA</Text><View style={styles.moodOptions}>{NOTE_MOODS.map((item) => { const selected = mood === item; const option = MOOD_OPTIONS[item]; return <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => { haptic.selection(); setMood(item); }} style={({ pressed }) => [styles.moodChoice, selected && { backgroundColor: `${option.tint}18`, borderColor: option.tint }, pressed && styles.pressed]}><MaterialIcons name={option.icon} size={19} color={selected ? option.tint : "#7D768A"} /><Text style={[styles.moodText, selected && { color: option.tint }]}>{option.label}</Text></Pressable>; })}</View></View>
          <View style={styles.colorSection}><Text style={styles.sectionTitle}>COLOR DE LA NOTA</Text><View style={styles.colorOptions}>{NOTE_COLORS.map((item) => { const selected = color === item; return <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={`Color ${COLOR_OPTIONS[item].label}`} onPress={() => { haptic.selection(); setColor(item); }} style={[styles.colorChoice, selected && styles.colorChoiceSelected]}><View style={[styles.colorDot, { backgroundColor: COLOR_OPTIONS[item].fill }]}>{selected ? <MaterialIcons name="check" size={17} color="#FFFFFF" /> : null}</View></Pressable>; })}</View></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#FFFFFF", flex: 1 }, keyboard: { flex: 1 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 68, paddingHorizontal: 18 }, topActions: { flexDirection: "row", gap: 4 },
  circleButton: { alignItems: "center", borderRadius: 20, height: 40, justifyContent: "center", width: 40 }, pressed: { backgroundColor: "#F0EDFF", opacity: 0.72 }, saved: { color: "#7B7489", fontSize: 12, fontWeight: "700" },
  content: { flexGrow: 1, paddingBottom: 36, paddingHorizontal: 23 }, titleInput: { color: "#1E1B2E", fontSize: 30, fontWeight: "800", letterSpacing: -0.7, lineHeight: 38, minHeight: 48, padding: 0 },
  tagField: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#F3F1F7", borderRadius: 11, flexDirection: "row", gap: 7, marginTop: 16, paddingHorizontal: 10, height: 37 }, tagInput: { color: "#5E5869", fontSize: 13, fontWeight: "700", minWidth: 90, padding: 0 },
  signalRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }, signalPill: { alignItems: "center", backgroundColor: "#F5F3F8", borderRadius: 999, flexDirection: "row", gap: 6, minHeight: 35, paddingHorizontal: 11 }, signalPillActive: { backgroundColor: "#EEEBFF" }, capsulePill: { backgroundColor: "#FFF3D9" }, signalText: { color: "#746E83", fontSize: 12, fontWeight: "800" }, signalTextActive: { color: "#5E4DE4" }, capsuleText: { color: "#8B5A1D" }, signalPressed: { opacity: 0.65 },
  bodyInput: { color: "#3E3949", flex: 1, fontSize: 17, lineHeight: 27, marginTop: 25, minHeight: 236, padding: 0 },
  attachmentsSection: { borderTopColor: "#EEEAF2", borderTopWidth: 1, marginTop: 18, paddingTop: 19 }, sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, sectionTitle: { color: "#827C8C", fontSize: 11, fontWeight: "800", letterSpacing: 0.9 }, sectionDescription: { color: "#AAA4B2", fontSize: 12, marginTop: 4 }, addImageButton: { alignItems: "center", backgroundColor: "#6D5DFB", borderRadius: 13, height: 38, justifyContent: "center", width: 40 },
  attachmentList: { gap: 10, marginTop: 14 }, imageFrame: { height: 112, overflow: "visible", position: "relative", width: 112 }, attachmentImage: { backgroundColor: "#EEEAF3", borderRadius: 15, height: 112, width: 112 }, removeImageButton: { alignItems: "center", backgroundColor: "#342F42", borderRadius: 13, height: 26, justifyContent: "center", position: "absolute", right: -5, top: -5, width: 26 },
  emptyAttachment: { alignItems: "center", backgroundColor: "#F7F5FA", borderColor: "#E9E5EF", borderRadius: 15, borderStyle: "dashed", borderWidth: 1, flexDirection: "row", gap: 9, marginTop: 14, minHeight: 58, paddingHorizontal: 15 }, emptyAttachmentText: { color: "#7D768A", fontSize: 13, fontWeight: "700" },
  moodSection: { borderTopColor: "#EEEAF2", borderTopWidth: 1, marginTop: 21, paddingTop: 19 }, moodOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, moodChoice: { alignItems: "center", backgroundColor: "#F7F5FA", borderColor: "#F0EDF3", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 6, minHeight: 39, paddingHorizontal: 10 }, moodText: { color: "#746E83", fontSize: 12, fontWeight: "800" },
  colorSection: { borderTopColor: "#EEEAF2", borderTopWidth: 1, marginTop: 21, paddingTop: 19 }, colorOptions: { flexDirection: "row", gap: 14, marginTop: 13 }, colorChoice: { borderColor: "transparent", borderRadius: 18, borderWidth: 2, padding: 2 }, colorChoiceSelected: { borderColor: "#1E1B2E" }, colorDot: { alignItems: "center", borderRadius: 14, height: 28, justifyContent: "center", width: 28 },
  missing: { alignItems: "center", backgroundColor: "#FFFFFF", flex: 1, gap: 12, justifyContent: "center", padding: 24 }, missingTitle: { color: "#1E1B2E", fontSize: 19, fontWeight: "800" }, backToNotes: { backgroundColor: "#6D5DFB", borderRadius: 14, marginTop: 8, paddingHorizontal: 17, paddingVertical: 12 }, backToNotesText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
