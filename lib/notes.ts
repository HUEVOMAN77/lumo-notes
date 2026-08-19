export const NOTE_COLORS = ["lavender", "peach", "mint", "sky"] as const;
export const NOTE_MOODS = ["calm", "spark", "focus", "brave"] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];
export type NoteMood = (typeof NOTE_MOODS)[number];

export type NoteAttachment = {
  id: string;
  uri: string;
  width: number;
  height: number;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tag: string;
  color: NoteColor;
  mood: NoteMood;
  attachments: NoteAttachment[];
  isFavorite: boolean;
  isArchived: boolean;
  reminderAt?: string;
  notificationId?: string;
  unlockAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = Pick<Note, "title" | "content" | "tag" | "color" | "mood" | "attachments" | "isFavorite">;

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function createNote(input: Partial<NoteInput> = {}): Note {
  const timestamp = new Date().toISOString();
  return {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title ?? "",
    content: input.content ?? "",
    tag: input.tag ?? "Sin etiqueta",
    color: input.color ?? "lavender",
    mood: input.mood ?? "calm",
    attachments: input.attachments ?? [],
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
  if (isTimeCapsuleLocked(note)) return "Esta cápsula guarda una idea para tu yo del futuro.";
  const text = note.content.trim();
  return text || "Toca para empezar a escribir";
}

export function isTimeCapsuleLocked(note: Pick<Note, "unlockAt">, now = Date.now()): boolean {
  return Boolean(note.unlockAt && new Date(note.unlockAt).getTime() > now);
}

export function formatRelativeUnlockDate(value?: string): string {
  if (!value) return "";
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
  if (days <= 1) return "se abre mañana";
  return `se abre en ${days} días`;
}
