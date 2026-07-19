import express from "express";
import { getStats, updateUserRole, getUsers } from "../controllers/adminController.js";
import { validate } from "../middlewares/validate.js";
import { updateUserRoleSchema, userIdSchema } from "../validations/index.js";

const router = express.Router();

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id", validate(userIdSchema, "params"), validate(updateUserRoleSchema), updateUserRole);

export default router;
