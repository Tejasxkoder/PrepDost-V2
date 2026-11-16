import multer from "multer";
import type { Request } from "express";
import { SUPPORTED_AUDIO_TYPES, MAX_AUDIO_SIZE } from "../utils/audio.utils.js";

const storage = multer.memoryStorage();

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void {
  if (SUPPORTED_AUDIO_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error(`Unsupported audio type: ${file.mimetype}`));
  }
}

export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_AUDIO_SIZE },
}).single("audio");