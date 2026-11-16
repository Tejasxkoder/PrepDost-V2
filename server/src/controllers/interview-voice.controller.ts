import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

import * as interviewVoiceService from "../services/interview-voice.service.js";
import type {
  InterviewType,
  Difficulty,
} from "../models/interview.model.js";

import { logger } from "../utils/logger.js";

export async function startVoiceInterviewController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const {
      type,
      company,
      difficulty,
      voice,
    } = req.body as {
      type?: InterviewType;
      company?: string;
      difficulty?: Difficulty;
      voice?: string;
    };

    if (!type) {
      res.status(400).json({
        success: false,
        message: "Interview type is required",
      });
      return;
    }

    logger.info(
      "api.interview.voice",
      "Starting voice interview",
      {
        userId,
        type,
      }
    );

    const result = await interviewVoiceService.startVoiceInterview(
      {
        userId,
        type,
        company,
        difficulty,
      },
      voice
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendVoiceMessageController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { interviewId } = req.params;

    if (!interviewId || Array.isArray(interviewId)) {
      res.status(400).json({
        success: false,
        message: "interviewId is required",
      });
      return;
    }

    if (!req.file) {
      logger.warn(
        "api.interview.voice",
        "Rejected: no audio file on request",
        { interviewId }
      );

      res.status(400).json({
        success: false,
        message: "Audio file is required (field: audio)",
      });
      return;
    }

    const {
      model,
      voice,
    } = req.body as {
      model?: string;
      voice?: string;
    };

    logger.info(
      "api.interview.voice",
      "Incoming voice turn",
      {
        interviewId,
        bytes: req.file.size,
      }
    );

    const result = await interviewVoiceService.sendVoiceMessage(
      interviewId,
      userId,
      {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname,
      },
      {
        sttModel: model,
        voice,
      }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}