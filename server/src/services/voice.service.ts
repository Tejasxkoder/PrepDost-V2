import { validateAudio, truncateForTTS } from "../utils/audio.utils.js";
import * as deepgramProvider from "../providers/deepgram.provider.js";
import type { HealthCheckResult } from "../providers/deepgram.provider.js";
import {
  STT_MODELS,
  STT_MODEL_OPTIONS,
  DEFAULT_STT_MODEL,
  VOICE_MODELS,
  VOICE_OPTIONS,
  DEFAULT_VOICE,
  type SttModelId,
  type SttModelOption,
  type VoiceId,
  type VoiceOption,
  type TranscribeResult,
  type UploadedAudioFile,
} from "../types/voice.types.js";

export async function checkVoiceProviderHealth(): Promise<HealthCheckResult> {
  return deepgramProvider.healthCheck();
}

export function getAvailableSttModels(): readonly SttModelOption[] {
  return STT_MODEL_OPTIONS;
}

export function getAvailableVoices(): readonly VoiceOption[] {
  return VOICE_OPTIONS;
}

function resolveSttModel(model?: string): SttModelId {
  if (model && (STT_MODELS as readonly string[]).includes(model)) {
    return model as SttModelId;
  }
  return DEFAULT_STT_MODEL;
}

function resolveVoice(voice?: string): VoiceId {
  if (voice && (VOICE_MODELS as readonly string[]).includes(voice)) {
    return voice as VoiceId;
  }
  return DEFAULT_VOICE;
}

export async function transcribeInterviewAnswer(
  file: UploadedAudioFile,
  model?: string
): Promise<TranscribeResult> {
  const validation = validateAudio(file);
  if (!validation.valid) {
    throw new Error(validation.reason ?? "Invalid audio file");
  }

  const result = await deepgramProvider.transcribeAudio(file.buffer, {
    model: resolveSttModel(model),
  });

  if (!result.transcript.trim()) {
    throw new Error("No speech detected in audio. Please try again.");
  }

  return result;
}

export async function generateInterviewSpeech(text: string, voice?: string): Promise<Buffer> {
  if (!text.trim()) {
    throw new Error("Text is required for speech generation");
  }
  const safeText = truncateForTTS(text);
  return deepgramProvider.textToSpeech(safeText, { voice: resolveVoice(voice) });
}