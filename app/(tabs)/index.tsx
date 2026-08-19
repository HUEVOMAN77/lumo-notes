import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { NoteList } from "@/components/note-list";
import { haptic } from "@/lib/haptics";
import { matchesNoteSearch, sortNotesByUpdatedAt } from "@/lib/notes";
import { useNotes } from "@/lib/notes-provider";

/**
 * Home Screen - NativeWind Example
 *
 * This template uses NativeWind (Tailwind CSS for React Native).
 * You can use familiar Tailwind classes directly in className props.
 *
 * Key patterns:
 * - Use `className` instead of `style` for most styling
 * - Theme colors: use tokens directly (bg-background, text-foreground, bg-primary, etc.); no dark: prefix needed
 * - Responsive: standard Tailwind breakpoints work on web
 * - Custom colors defined in tailwind.config.js
 */
export default function HomeScreen() {
  const { notes, isReady, createNote, updateNote } = useNotes();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("Todas");

  const tags = useMemo(() => ["Todas", ...Array.from(new Set(notes.filter((note) => !note.isArchived).map((note) => note.tag).filter(Boolean)))], [notes]);
  const displayedNotes = useMemo(() => sortNotesByUpdatedAt(notes.filter((note) => !note.isArchived && matchesNoteSearch(note, query) && (activeTag === "Todas" || note.tag === activeTag))), [activeTag, notes, query]);

  const handleCreate = async () => {
    haptic.light();
    const note = await createNote();
    router.push(`/note/${note.id}` as never);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TU ESPACIO PERSONAL</Text>
        <Text style={styles.title}>Lumo Notes</Text>
        <Text style={styles.subtitle}>Pensamientos claros, siempre a mano.</Text>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={22} color="#746E83" />
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar en tus notas" placeholderTextColor="#918B9C" returnKeyType="search" style={styles.searchInput} />
          {query ? <Pressable onPress={() => setQuery("")} hitSlop={10}><MaterialIcons name="close" size={19} color="#746E83" /></Pressable> : null}
        </View>
      </View>
      <FlatList
        horizontal
        data={tags}
        keyExtractor={(tag) => tag}
        contentContainerStyle={styles.tagList}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: tag }) => {
          const isActive = activeTag === tag;
          return (
            <Pressable onPress={() => { haptic.selection(); setActiveTag(tag); }} style={({ pressed }) => [styles.filterTag, isActive && styles.filterTagActive, pressed && styles.tagPressed]}>
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{tag}</Text>
            </Pressable>
          );
        }}
        style={styles.tagsContainer}
      />
      <View style={styles.listHeader}><Text style={styles.listTitle}>{query || activeTag !== "Todas" ? "Resultados" : "Notas recientes"}</Text><Text style={styles.countText}>{displayedNotes.length}</Text></View>
      {isReady ? (
        <NoteList notes={displayedNotes} emptyTitle={query ? "No hay coincidencias" : "Tu primera idea empieza aquí"} emptyDescription={query ? "Prueba con otra palabra o etiqueta." : "Toca el botón de abajo para crear una nota."} onToggleFavorite={(note) => void updateNote(note.id, { isFavorite: !note.isFavorite })} />
      ) : <View style={styles.loader}><ActivityIndicator color="#6D5DFB" /></View>}
      <Pressable accessibilityRole="button" accessibilityLabel="Crear una nota" onPress={() => void handleCreate()} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <MaterialIcons name="add" size={29} color="#FFFFFF" />
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 14 },
  eyebrow: { color: "#6D5DFB", fontSize: 11, fontWeight: "800", letterSpacing: 1.1, lineHeight: 16 },
  title: { color: "#1E1B2E", fontSize: 31, fontWeight: "800", letterSpacing: -0.9, lineHeight: 39, marginTop: 2 },
  subtitle: { color: "#756F83", fontSize: 15, lineHeight: 22, marginTop: 1 },
  searchBox: { alignItems: "center", backgroundColor: "#F4F2F8", borderColor: "#E8E5EE", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, height: 52, marginTop: 20, paddingHorizontal: 15 },
  searchInput: { color: "#1E1B2E", flex: 1, fontSize: 15, height: "100%" },
  tagsContainer: { flexGrow: 0, marginTop: 16 },
  tagList: { gap: 8, paddingHorizontal: 20 },
  filterTag: { backgroundColor: "#F3F1F7", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  filterTagActive: { backgroundColor: "#6D5DFB" },
  filterText: { color: "#655F70", fontSize: 13, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
  tagPressed: { opacity: 0.75 },
  listHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 11, marginTop: 20, paddingHorizontal: 20 },
  listTitle: { color: "#312C40", fontSize: 18, fontWeight: "800", letterSpacing: -0.25 },
  countText: { alignItems: "center", backgroundColor: "#F0EDFF", borderRadius: 999, color: "#6354ED", fontSize: 12, fontWeight: "800", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 3 },
  loader: { alignItems: "center", flex: 1, justifyContent: "center" },
  fab: { alignItems: "center", backgroundColor: "#6D5DFB", borderRadius: 28, bottom: 26, elevation: 6, height: 56, justifyContent: "center", position: "absolute", right: 22, shadowColor: "#3B2BCB", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.28, shadowRadius: 10, width: 56 },
  fabPressed: { opacity: 0.92, transform: [{ scale: 0.97 }] },
});
