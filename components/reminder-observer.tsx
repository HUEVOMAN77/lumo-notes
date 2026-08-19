import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { Platform } from "react-native";

import { haptic } from "@/lib/haptics";
import { useNotes } from "@/lib/notes-provider";
import {
  configureLocalReminders,
  REMINDER_COMPLETE_ACTION,
  REMINDER_SNOOZE_ACTION,
  scheduleNoteReminder,
} from "@/lib/reminders";

export function ReminderObserver() {
  const { getNote, updateNote } = useNotes();

  const handleResponse = useCallback(async (response: Notifications.NotificationResponse) => {
    const noteId = response.notification.request.content.data?.noteId;
    if (typeof noteId !== "string") return;
    const note = getNote(noteId);
    if (!note) return;

    if (response.actionIdentifier === REMINDER_COMPLETE_ACTION) {
      haptic.success();
      await updateNote(note.id, { reminderAt: undefined, notificationId: undefined });
      return;
    }

    if (response.actionIdentifier === REMINDER_SNOOZE_ACTION) {
      const reminderAt = new Date(Date.now() + 15 * 60_000).toISOString();
      const notificationId = await scheduleNoteReminder({
        noteId: note.id,
        title: note.title,
        reminderAt,
        previousNotificationId: note.notificationId,
      });
      if (notificationId) await updateNote(note.id, { reminderAt, notificationId });
      haptic.light();
      return;
    }

    router.push(`/note/${note.id}` as never);
  }, [getNote, updateNote]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    void configureLocalReminders();
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) void handleResponse(response);
    });
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void handleResponse(response);
    });
    return () => subscription.remove();
  }, [handleResponse]);

  return null;
}
