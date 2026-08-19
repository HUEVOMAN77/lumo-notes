import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

import type { NoteAttachment } from "@/lib/notes";

const ATTACHMENTS_DIRECTORY = `${FileSystem.documentDirectory ?? ""}lumo-note-attachments/`;

function extensionFromUri(uri: string): string {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match?.[1]?.toLowerCase() || "jpg";
}

async function persistImage(uri: string, index: number): Promise<string> {
  if (Platform.OS === "web" || !FileSystem.documentDirectory) return uri;
  await FileSystem.makeDirectoryAsync(ATTACHMENTS_DIRECTORY, { intermediates: true });
  const destination = `${ATTACHMENTS_DIRECTORY}${Date.now()}-${index}.${extensionFromUri(uri)}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}

export async function pickNoteImages(): Promise<NoteAttachment[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: 4,
    quality: 0.74,
  });

  if (result.canceled) return [];

  return Promise.all(
    result.assets.map(async (asset, index) => ({
      id: `image-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      uri: await persistImage(asset.uri, index),
      width: asset.width,
      height: asset.height,
    })),
  );
}

export async function recoverPendingNoteImages(): Promise<NoteAttachment[]> {
  const result = await ImagePicker.getPendingResultAsync();
  if (!result || !("canceled" in result) || result.canceled || !result.assets) return [];

  return Promise.all(
    result.assets.map(async (asset, index) => ({
      id: `image-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      uri: await persistImage(asset.uri, index),
      width: asset.width,
      height: asset.height,
    })),
  );
}

export async function removeLocalAttachments(attachments: NoteAttachment[]): Promise<void> {
  if (Platform.OS === "web") return;
  await Promise.all(
    attachments.map(async (attachment) => {
      if (!attachment.uri.startsWith(FileSystem.documentDirectory ?? "")) return;
      const info = await FileSystem.getInfoAsync(attachment.uri);
      if (info.exists) await FileSystem.deleteAsync(attachment.uri, { idempotent: true });
    }),
  );
}
