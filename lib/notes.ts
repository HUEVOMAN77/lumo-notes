export const NOTE_COLORS = ["lavender", "peach", "mint", "sky"] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

export type Note = {
  id: string;
  title: string;
  content: string;
  tag: string;
  color: NoteColor;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = Pick<Note, "title" | "content" | "tag" | "color" | "isFavorite">;

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function createNote(input: Partial<NoteInput> = {}): Note {
  const timestamp = new Date().toISOString();
  return {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title ?? "",
    content: input.content ?? "",
    tag: input.tag ?? "Sin etiqueta",
    color: input.color ?? "lavender",
    isFavorite: input.isFavorite ?? false,
    isArchived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateNoteRecord(note: Note, changes: Partial<Omit<Note, "id" | "createdAt">>): Note {
  return { ...note, ...changes, updatedAt: new Date().toISOString() };
}

export function matchesNoteSearch(note: Note, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  return [note.title, note.content, note.tag].some((field) => normalize(field).includes(normalizedQuery));
}

export function sortNotesByUpdatedAt(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function notePreview(note: Note): string {
  const text = note.content.trim();
  return text || "Toca para empezar a escribir";
}
