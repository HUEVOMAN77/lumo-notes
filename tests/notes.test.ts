import { describe, expect, it } from "vitest";

import { createNote, matchesNoteSearch, sortNotesByUpdatedAt, updateNoteRecord } from "../lib/notes";

describe("modelo de notas de Lumo Notes", () => {
  it("crea una nota local con valores seguros por defecto", () => {
    const note = createNote();

    expect(note.id).toMatch(/^note-/);
    expect(note.title).toBe("");
    expect(note.tag).toBe("Sin etiqueta");
    expect(note.color).toBe("lavender");
    expect(note.isFavorite).toBe(false);
    expect(note.isArchived).toBe(false);
  });

  it("encuentra coincidencias en título, contenido y etiqueta sin distinguir mayúsculas", () => {
    const note = createNote({
      title: "Plan de viaje",
      content: "Reservar tren a Sevilla",
      tag: "Vacaciones",
    });

    expect(matchesNoteSearch(note, "viaje")).toBe(true);
    expect(matchesNoteSearch(note, "SEVILLA")).toBe(true);
    expect(matchesNoteSearch(note, "vacaciones")).toBe(true);
    expect(matchesNoteSearch(note, "factura")).toBe(false);
  });

  it("actualiza los cambios sin perder la identidad ni la fecha de creación", () => {
    const original = createNote({ title: "Borrador" });
    const updated = updateNoteRecord(original, { title: "Versión final", isFavorite: true });

    expect(updated.id).toBe(original.id);
    expect(updated.createdAt).toBe(original.createdAt);
    expect(updated.title).toBe("Versión final");
    expect(updated.isFavorite).toBe(true);
  });

  it("ordena las notas desde la última actualización", () => {
    const older = { ...createNote({ title: "Primera" }), updatedAt: "2026-01-01T09:00:00.000Z" };
    const newer = { ...createNote({ title: "Última" }), updatedAt: "2026-02-01T09:00:00.000Z" };

    expect(sortNotesByUpdatedAt([older, newer]).map((note) => note.title)).toEqual(["Última", "Primera"]);
  });
});
