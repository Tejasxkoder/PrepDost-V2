import { DeepgramError } from "@deepgram/sdk";
import type { ListenV1Response, ListenV1ResponseResultsChannelsItem } from "@deepgram/sdk";
import { deepgram } from "../config/deepgram.js";
import { logger } from "../utils/logger.js";
import {
  DEFAULT_STT_MODEL,
  DEFAULT_VOICE,
  type STT_MODELS,
  type VOICE_MODELS,
  type TranscribeResult,
  type TranscriptWord,
} from "../types/voice.types.js";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 500;

interface RetryOptions {
  retries?: number;
  delayMs?: number;
}

interface TranscribeOptions {
  model?: (typeof STT_MODELS)[number];
  language?: string;
}

interface TTSOptions {
  voice?: (typeof VOICE_MODELS)[number];
  encoding?: "linear16" | "mp3" | "opus" | "flac" | "aac" | "mulaw" | "alaw";
}

export interface HealthCheckResult {
  success: boolean;
  provider: "deepgram";
  status: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const retries = opts.retries ?? DEFAULT_RETRIES;
  const delayMs = opts.delayMs ?? DEFAULT_RETRY_DELAY_MS;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (err instanceof DeepgramError) {
        const status = err.statusCode;
        if (typeof status === "number" && status >= 400 && status < 500 && status !== 429) {
          throw err;
        }
      }

      if (attempt < retries) {
        logger.warn("deepgram.retry", `Attempt ${attempt + 1} failed, retrying`, { attempt: attempt + 1, retries });
        await sleep(delayMs * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise
      .then((res) => { clearTimeout(timer); resolve(res); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}

function isSyncListenResponse(response: unknown): response is ListenV1Response {
  return (
    typeof response === "object" &&
    response !== null &&
    "results" in response &&
    "metadata" in response
  );
}

export async function healthCheck(): Promise<HealthCheckResult> {
  const startedAt = Date.now();
  logger.info("deepgram.health", "Checking Deepgram connectivity");

  try {
    await withTimeout(deepgram.manage.v1.projects.list(), 10_000, "Deepgram health check");
    logger.info("deepgram.health", "Deepgram reachable", { durationMs: Date.now() - startedAt });
    return { success: true, provider: "deepgram", status: "operational" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unreachable";
    logger.error("deepgram.health", "Deepgram unreachable", { durationMs: Date.now() - startedAt, error: message });
    return { success: false, provider: "deepgram", status: message };
  }
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  options: TranscribeOptions = {}
): Promise<TranscribeResult> {
  const model = options.model ?? DEFAULT_STT_MODEL;
  const startedAt = Date.now();

  logger.info("deepgram.transcribe", "Sending audio for transcription", { model, bytes: audioBuffer.length });

  try {
    const response = await withRetry(() =>
      withTimeout(
        deepgram.listen.v1.media.transcribeFile(audioBuffer, {
          model,
          smart_format: true,
          punctuate: true,
          ...(options.language ? { language: options.language } : {}),
        }),
        DEFAULT_TIMEOUT_MS,
        "Deepgram transcription"
      )
    );

    if (!isSyncListenResponse(response)) {
      throw new Error("Deepgram returned an async accepted response, expected inline results");
    }

    const alternative: ListenV1ResponseResultsChannelsItem.Alternatives.Item | undefined =
      response.results.channels[0]?.alternatives?.[0];

    if (!alternative) {
      throw new Error("Deepgram returned no transcription alternatives");
    }

    const words: TranscriptWord[] = (alternative.words ?? []).map((w) => ({
      word: w.word ?? "",
      start: w.start ?? 0,
      end: w.end ?? 0,
      confidence: w.confidence ?? 0,
    }));

    logger.info("deepgram.transcribe", "Transcription succeeded", {
      durationMs: Date.now() - startedAt,
      model,
      transcriptChars: alternative.transcript?.length ?? 0,
      confidence: alternative.confidence ?? 0,
    });

    return {
      transcript: alternative.transcript ?? "",
      confidence: alternative.confidence ?? 0,
      duration: response.metadata.duration,
      words,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("deepgram.transcribe", "Transcription failed", { durationMs: Date.now() - startedAt, model, error: message });

    if (error instanceof DeepgramError) {
      throw new Error(`Deepgram transcription failed: ${error.message}`);
    }
    throw error;
  }
}

export async function textToSpeech(text: string, options: TTSOptions = {}): Promise<Buffer> {
  const voice = options.voice ?? DEFAULT_VOICE;
  const startedAt = Date.now();

  logger.info("deepgram.tts", "Generating speech", { voice, textChars: text.length });

  try {
    const response = await withRetry(() =>
      withTimeout(
        deepgram.speak.v1.audio.generate({ text, model: voice, encoding: options.encoding ?? "linear16", container: "wav" }),
        DEFAULT_TIMEOUT_MS,
        "Deepgram text-to-speech"
      )
    );

    const buffer = Buffer.from(await response.arrayBuffer());

    logger.info("deepgram.tts", "Speech generation succeeded", { durationMs: Date.now() - startedAt, voice, bytes: buffer.length });

    return buffer;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("deepgram.tts", "Speech generation failed", { durationMs: Date.now() - startedAt, voice, error: message });

    if (error instanceof DeepgramError) {
      throw new Error(`Deepgram text-to-speech failed: ${error.message}`);
    }
    throw error;
  }
}