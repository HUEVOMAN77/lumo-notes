import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { haptic } from "@/lib/haptics";
import { notePreview, type Note } from "@/lib/notes";

const NOTE_PALETTES = {
  lavender: { background: "#F0EDFF", accent: "#6D5DFB" },
  peach: { background: "#FFF0E7", accent: "#D97736" },
  mint: { background: "#E7F9F2", accent: "#17865D" },
  sky: { background: "#EAF5FF", accent: "#2879BF" },
};

type NoteListProps = {
  notes: Note[];
  emptyTitle: string;
  emptyDescription: string;
  onToggleFavorite?: (note: Note) => void;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date(value));
}

export function NoteList({ notes, emptyTitle, emptyDescription, onToggleFavorite }: NoteListProps) {
  return (
    <FlatList
      data={notes}
      keyExtractor={(note) => note.id}
      contentContainerStyle={notes.length ? styles.listContent : styles.emptyContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: note }) => {
        const palette = NOTE_PALETTES[note.color];
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir nota ${note.title || "sin título"}`}
            onPress={() => router.push(`/note/${note.id}` as never)}
            style={({ pressed }) => [styles.noteCard, { backgroundColor: palette.background }, pressed && styles.pressed]}
          >
            <View style={[styles.colorLine, { backgroundColor: palette.accent }]} />
            <View style={styles.noteBody}>
              <View style={styles.noteHeading}>
                <Text numberOfLines={1} style={styles.noteTitle}>{note.title.trim() || "Nota sin título"}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={note.isFavorite ? "Quitar de favoritas" : "Añadir a favoritas"}
                  hitSlop={10}
                  onPress={(event) => {
                    event.stopPropagation();
                    haptic.selection();
                    onToggleFavorite?.(note);
                  }}
                  style={({ pressed }) => [styles.favoriteButton, pressed && styles.iconPressed]}
                >
                  <MaterialIcons name={note.isFavorite ? "star" : "star-border"} size={22} color={note.isFavorite ? "#F59E0B" : "#766F87"} />
                </Pressable>
              </View>
              <Text numberOfLines={2} style={styles.notePreview}>{notePreview(note)}</Text>
              <View style={styles.metaRow}>
                <View style={[styles.tagPill, { borderColor: palette.accent }]}>
                  <Text style={[styles.tagText, { color: palette.accent }]}>{note.tag || "Sin etiqueta"}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(note.updatedAt)}</Text>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><MaterialIcons name="auto-awesome" size={30} color="#6D5DFB" /></View>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyDescription}>{emptyDescription}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 20, paddingBottom: 124, gap: 12 },
  emptyContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 124 },
  noteCard: { minHeight: 128, borderRadius: 22, flexDirection: "row", overflow: "hidden" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  colorLine: { width: 5 },
  noteBody: { flex: 1, padding: 16, gap: 8 },
  noteHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  noteTitle: { color: "#1E1B2E", fontSize: 17, fontWeight: "700", letterSpacing: -0.2, flex: 1, lineHeight: 22 },
  favoriteButton: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  iconPressed: { opacity: 0.55 },
  notePreview: { color: "#625D70", fontSize: 14, lineHeight: 20, minHeight: 40 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto", gap: 8 },
  tagPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, maxWidth: "70%" },
  tagText: { fontSize: 11, fontWeight: "700" },
  dateText: { color: "#7A7489", fontSize: 12, fontWeight: "500" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 34, paddingBottom: 76 },
  emptyIcon: { alignItems: "center", backgroundColor: "#F0EDFF", borderRadius: 20, height: 64, justifyContent: "center", marginBottom: 18, width: 64 },
  emptyTitle: { color: "#1E1B2E", fontSize: 20, fontWeight: "700", lineHeight: 26, textAlign: "center" },
  emptyDescription: { color: "#756F83", fontSize: 15, lineHeight: 22, marginTop: 8, textAlign: "center" },
});
