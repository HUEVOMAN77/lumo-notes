import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { removeLocalAttachments } from "@/lib/attachments";
import { cancelReminder } from "@/lib/reminders";
import { createNote, sortNotesByUpdatedAt, updateNoteRecord, type Note, type NoteInput } from "@/lib/notes";

const NOTES_STORAGE_KEY = "@lumo-notes/notes-v2";
const FOCUS_STORAGE_KEY = "@lumo-notes/focus-mode-v1";

type NotesContextValue = {
  notes: Note[];
  isReady: boolean;
  isFocusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
  createNote: (input?: Partial<NoteInput>) => Promise<Note>;
  updateNote: (id: string, changes: Partial<Omit<Note, "id" | "createdAt">>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
};

const NotesContext = createContext<NotesContextValue | null>(null);

function parseStoredNotes(rawValue: string | null): Note[] {
  if (!rawValue) return [];
  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    const notes = parsed
      .filter((item): item is Partial<Note> => typeof item === "object" && item !== null)
      .filter((note): note is Note => typeof note.id === "string" && typeof note.createdAt === "string" && typeof note.updatedAt === "string")
      .map((note) => ({
        ...note,
        title: note.title ?? "",
        content: note.content ?? "",
        tag: note.tag ?? "Sin etiqueta",
        color: note.color ?? "lavender",
        mood: note.mood ?? "calm",
        attachments: Array.isArray(note.attachments) ? note.attachments : [],
        isFavorite: Boolean(note.isFavorite),
        isArchived: Boolean(note.isArchived),
      }));
    return sortNotesByUpdatedAt(notes);
  } catch {
    return [];
  }
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isFocusMode, setFocusModeState] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem(NOTES_STORAGE_KEY), AsyncStorage.getItem(FOCUS_STORAGE_KEY)])
      .then(([savedNotes, savedFocus]) => {
        if (!active) return;
        setNotes(parseStoredNotes(savedNotes));
        setFocusModeState(savedFocus === "true");
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => { active = false; };
  }, []);

  const persist = useCallback(async (nextNotes: Note[]) => {
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(nextNotes));
  }, []);

  const setFocusMode = useCallback((enabled: boolean) => {
    setFocusModeState(enabled);
    void AsyncStorage.setItem(FOCUS_STORAGE_KEY, String(enabled));
  }, []);

  const create = useCallback(async (input: Partial<NoteInput> = {}) => {
    const newNote = createNote(input);
    setNotes((current) => {
      const next = sortNotesByUpdatedAt([newNote, ...current]);
      void persist(next);
      return next;
    });
    return newNote;
  }, [persist]);

  const update = useCallback(async (id: string, changes: Partial<Omit<Note, "id" | "createdAt">>) => {
    setNotes((current) => {
      const next = sortNotesByUpdatedAt(current.map((note) => (note.id === id ? updateNoteRecord(note, changes) : note)));
      void persist(next);
      return next;
    });
  }, [persist]);

  const remove = useCallback(async (id: string) => {
    const noteToDelete = notes.find((note) => note.id === id);
    setNotes((current) => {
      const next = current.filter((note) => note.id !== id);
      void persist(next);
      return next;
    });
    if (noteToDelete) {
      void cancelReminder(noteToDelete.notificationId);
      void removeLocalAttachments(noteToDelete.attachments);
    }
  }, [notes, persist]);

  const getNote = useCallback((id: string) => notes.find((note) => note.id === id), [notes]);

  const value = useMemo(() => ({
    notes,
    isReady,
    isFocusMode,
    setFocusMode,
    createNote: create,
    updateNote: update,
    deleteNote: remove,
    getNote,
  }), [create, getNote, isFocusMode, isReady, notes, remove, setFocusMode, update]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes(): NotesContextValue {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes debe utilizarse dentro de NotesProvider");
  return context;
}
