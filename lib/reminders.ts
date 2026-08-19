import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const REMINDER_CHANNEL_ID = "lumo-reminders";
export const REMINDER_CATEGORY_ID = "lumo-note-reminder";
export const REMINDER_COMPLETE_ACTION = "LUMO_REMINDER_COMPLETE";
export const REMINDER_SNOOZE_ACTION = "LUMO_REMINDER_SNOOZE";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function configureLocalReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: "Recordatorios de Lumo",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 180, 100, 180],
      lightColor: "#6D5DFB",
    });
  }

  await Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY_ID, [
    {
      identifier: REMINDER_COMPLETE_ACTION,
      buttonTitle: "Completar",
      options: { opensAppToForeground: true },
    },
    {
      identifier: REMINDER_SNOOZE_ACTION,
      buttonTitle: "Posponer 15 min",
      options: { opensAppToForeground: true },
    },
  ]);
}

export async function ensureReminderPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  await configureLocalReminders();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === "granted";
}

export async function cancelReminder(notificationId?: string): Promise<void> {
  if (!notificationId || Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function scheduleNoteReminder(input: {
  noteId: string;
  title: string;
  reminderAt: string;
  previousNotificationId?: string;
}): Promise<string | null> {
  const date = new Date(input.reminderAt);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return null;
  const permitted = await ensureReminderPermissions();
  if (!permitted) return null;
  await cancelReminder(input.previousNotificationId);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Lumo te recuerda una idea",
      body: input.title.trim() || "Tienes una nota que quería volver a encontrarte.",
      data: { noteId: input.noteId },
      categoryIdentifier: REMINDER_CATEGORY_ID,
      color: "#6D5DFB",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
}
