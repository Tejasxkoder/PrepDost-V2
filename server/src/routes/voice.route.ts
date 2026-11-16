import { Router } from "express";
import { uploadAudio } from "../middlewares/upload.middleware.js";
import {
  healthCheckController,
  listSttModelsController,
  listVoicesController,
  transcribeController,
  textToSpeechController,
} from "../controllers/voice.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/health", healthCheckController);
router.get("/models", listSttModelsController);
router.get("/voices", listVoicesController);
router.post("/transcribe", protect, uploadAudio, transcribeController);
router.post("/speak", protect, textToSpeechController);

export default router;