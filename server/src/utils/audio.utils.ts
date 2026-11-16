import type { AudioValidationResult, UploadedAudioFile } from "../types/voice.types.js";

export const SUPPORTED_AUDIO_TYPES: readonly string[] = [
  "audio/wav", "audio/wave", "audio/x-wav", "audio/mpeg", "audio/mp3",
  "audio/webm", "audio/ogg", "audio/mp4", "audio/x-m4a",
];

export const MAX_AUDIO_SIZE = 25 * 1024 * 1024;
export const MAX_TTS_CHARACTERS = 2000;

export function validateAudio(file: UploadedAudioFile): AudioValidationResult {
  if (!file.buffer || file.size === 0) {
    return { valid: false, reason: "Audio file is empty" };
  }
  if (!SUPPORTED_AUDIO_TYPES.includes(file.mimetype)) {
    return { valid: false, reason: `Unsupported audio type: ${file.mimetype}. Supported types: ${SUPPORTED_AUDIO_TYPES.join(", ")}` };
  }
  if (file.size > MAX_AUDIO_SIZE) {
    const maxMb = (MAX_AUDIO_SIZE / (1024 * 1024)).toFixed(0);
    return { valid: false, reason: `Audio file exceeds the ${maxMb}MB limit` };
  }
  return { valid: true };
}

export function truncateForTTS(text: string, maxChars: number = MAX_TTS_CHARACTERS): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  const slice = trimmed.slice(0, maxChars);
  const lastSentenceEnd = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastSentenceEnd > maxChars * 0.5) return slice.slice(0, lastSentenceEnd + 1).trim();
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim();
}

export function estimateCharacters(text: string): number {
  return text.trim().length;
}