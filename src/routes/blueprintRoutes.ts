import express from "express";
import { createBlueprint, getBlueprints, getBlueprintById, deleteBlueprint } from "../controllers/blueprintController.js";
import { validate } from "../middlewares/validate.js";
import { createBlueprintSchema, blueprintIdSchema } from "../validations/index.js";

const router = express.Router();

router.get("/", getBlueprints);
router.get("/:id", validate(blueprintIdSchema, "params"), getBlueprintById);
router.post("/", validate(createBlueprintSchema), createBlueprint);
router.delete("/:id", validate(blueprintIdSchema, "params"), deleteBlueprint);

export default router;