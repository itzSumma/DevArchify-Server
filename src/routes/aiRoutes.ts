import express from "express";
import { generateBlueprint, chatAssistant } from "../controllers/aiController.js";
import { validate } from "../middlewares/validate.js";
import { generateBlueprintSchema, chatSchema } from "../validations/index.js";

const router = express.Router();

router.post("/generate", validate(generateBlueprintSchema), generateBlueprint);
router.post("/chat", validate(chatSchema), chatAssistant);

export default router;
