import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { createNote, sortNotesByUpdatedAt, updateNoteRecord, type Note, type NoteInput } from "@/lib/notes";

const NOTES_STORAGE_KEY = "@lumo-notes/notes-v1";

type NotesContextValue = {
  notes: Note[];
  isReady: boolean;
  createNote: (input?: Partial<NoteInput>) => Promise<Note>;
  updateNote: (id: string, changes: Partial<Omit<Note, "id" | "createdAt">>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
};

const NotesContext = createContext<NotesContextValue | null>(null);

function parseStoredNotes(rawValue: string | null): Note[] {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? sortNotesByUpdatedAt(parsed as Note[]) : [];
  } catch {
    return [];
  }
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(NOTES_STORAGE_KEY)
      .then((saved) => {
        if (active) setNotes(parseStoredNotes(saved));
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (nextNotes: Note[]) => {
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(nextNotes));
  }, []);

  const create = useCallback(
    async (input: Partial<NoteInput> = {}) => {
      const newNote = createNote(input);
      setNotes((current) => {
        const next = sortNotesByUpdatedAt([newNote, ...current]);
        void persist(next);
        return next;
      });
      return newNote;
    },
    [persist],
  );

  const update = useCallback(
    async (id: string, changes: Partial<Omit<Note, "id" | "createdAt">>) => {
      setNotes((current) => {
        const next = sortNotesByUpdatedAt(current.map((note) => (note.id === id ? updateNoteRecord(note, changes) : note)));
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const remove = useCallback(
    async (id: string) => {
      setNotes((current) => {
        const next = current.filter((note) => note.id !== id);
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      notes,
      isReady,
      createNote: create,
      updateNote: update,
      deleteNote: remove,
      getNote: (id: string) => notes.find((note) => note.id === id),
    }),
    [create, isReady, notes, remove, update],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes(): NotesContextValue {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes debe utilizarse dentro de NotesProvider");
  return context;
}
