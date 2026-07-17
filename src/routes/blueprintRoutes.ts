import express from "express";
import { createBlueprint } from "../controllers/blueprintController.js";

const router = express.Router();

router.post("/create", createBlueprint);

export default router;