import express from "express";
import {
  generateBlueprintHandler,
  chatAssistant,
  getChatHistoryHandler,
  deleteChatHistoryHandler,
} from "../controllers/aiController.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { generateBlueprintSchema, chatSchema } from "../validations/index.js";

const router = express.Router();

router.post("/generate", authenticate, validate(generateBlueprintSchema), generateBlueprintHandler);
router.post("/chat", authenticate, validate(chatSchema), chatAssistant);
router.get("/history", authenticate, getChatHistoryHandler);
router.delete("/history", authenticate, deleteChatHistoryHandler);

export default router;
