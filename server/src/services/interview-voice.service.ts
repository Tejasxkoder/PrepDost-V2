import {
  createInterview,
  sendMessage,
} from "./interview.service.js";

import {
  transcribeInterviewAnswer,
  generateInterviewSpeech,
} from "./voice.service.js";

import type {
  InterviewType,
  Difficulty,
} from "../models/interview.model.js";

import type {
  UploadedAudioFile,
} from "../types/voice.types.js";

import { logger } from "../utils/logger.js";

interface StartVoiceInterviewInput {
  userId: string;
  type: InterviewType;
  company?: string;
  difficulty?: Difficulty;
}

type SendMessageResult = Awaited<ReturnType<typeof sendMessage>>;

export interface VoiceTurnResult {
  transcript: string;
  message: string;
  audioBase64: string;
  audioMimeType: "audio/wav";
  isComplete: boolean;
  feedback: SendMessageResult["feedback"];
}

function toBase64Audio(buffer: Buffer): string {
  return buffer.toString("base64");
}


export async function startVoiceInterview(
  input: StartVoiceInterviewInput,
  voice?: string
) {
  logger.info(
    "interview.voice",
    "Starting voice interview",
    {
      userId: input.userId,
      type: input.type,
    }
  );

  const result = await createInterview(input);

  const audioBuffer = await generateInterviewSpeech(
    result.message,
    voice
  );

  logger.info(
    "interview.voice",
    "First question synthesized",
    {
      interviewId: result.interviewId.toString(),
      audioBytes: audioBuffer.length,
    }
  );

  return {
    ...result,
    audioBase64: toBase64Audio(audioBuffer),
    audioMimeType: "audio/wav" as const,
  };
}

export async function sendVoiceMessage(
  interviewId: string,
  userId: string,
  file: UploadedAudioFile,
  options?: {
    sttModel?: string;
    voice?: string;
  }
): Promise<VoiceTurnResult> {
  logger.info(
    "interview.voice",
    "Transcribing candidate answer",
    { interviewId }
  );

  const transcription = await transcribeInterviewAnswer(
    file,
    options?.sttModel
  );

  logger.info(
    "interview.voice",
    "Forwarding transcript to interview service",
    {
      interviewId,
      transcriptChars: transcription.transcript.length,
    }
  );

  const result = await sendMessage(
    interviewId,
    userId,
    transcription.transcript
  );

  const audioBuffer = await generateInterviewSpeech(
    result.message,
    options?.voice
  );

  logger.info(
    "interview.voice",
    "Voice turn complete",
    {
      interviewId,
      isComplete: result.isComplete,
      audioBytes: audioBuffer.length,
    }
  );

  return {
    transcript: transcription.transcript,
    message: result.message,
    audioBase64: toBase64Audio(audioBuffer),
    audioMimeType: "audio/wav",
    isComplete: result.isComplete,
    feedback: result.feedback,
  };
}