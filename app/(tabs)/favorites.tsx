import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { NoteList } from "@/components/note-list";
import { ScreenContainer } from "@/components/screen-container";
import { sortNotesByUpdatedAt } from "@/lib/notes";
import { useNotes } from "@/lib/notes-provider";
import { useColors } from "@/hooks/use-colors";

export default function FavoritesScreen() {
  const { notes, updateNote } = useNotes();
  const colors = useColors();
  const favorites = useMemo(() => sortNotesByUpdatedAt(notes.filter((note) => note.isFavorite && !note.isArchived)), [notes]);
  return (
    <ScreenContainer>
      <View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>ACCESO RÁPIDO</Text><Text style={[styles.title, { color: colors.foreground }]}>Favoritas</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Las notas que quieres tener cerca.</Text></View>
      <NoteList notes={favorites} emptyTitle="Todavía no tienes favoritas" emptyDescription="Marca con una estrella las ideas que quieras recordar primero." onToggleFavorite={(note) => void updateNote(note.id, { isFavorite: !note.isFavorite })} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 22, paddingHorizontal: 20, paddingTop: 14 },
  eyebrow: { color: "#6D5DFB", fontSize: 11, fontWeight: "800", letterSpacing: 1.1, lineHeight: 16 },
  title: { color: "#1E1B2E", fontSize: 31, fontWeight: "800", letterSpacing: -0.9, lineHeight: 39, marginTop: 2 },
  subtitle: { color: "#756F83", fontSize: 15, lineHeight: 22, marginTop: 1 },
});
