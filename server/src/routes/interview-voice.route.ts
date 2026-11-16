import { Router } from "express";
import { uploadAudio } from "../middlewares/upload.middleware.js";
import {
  startVoiceInterviewController,
  sendVoiceMessageController,
} from "../controllers/interview-voice.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/start",
  protect,
  startVoiceInterviewController
);

router.post(
  "/:interviewId/message",
  protect,
  uploadAudio,
  sendVoiceMessageController
);

export default router;