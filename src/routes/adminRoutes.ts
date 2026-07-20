import express from "express";
import { getStats, updateUserRole, getUsers } from "../controllers/adminController.js";
import { authenticate, authorizeRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { updateUserRoleSchema, userIdSchema } from "../validations/index.js";

const router = express.Router();

router.get("/stats", authenticate, authorizeRole("admin"), getStats);
router.get("/users", authenticate, authorizeRole("admin"), getUsers);
router.patch("/users/:id", authenticate, authorizeRole("admin"), validate(userIdSchema, "params"), validate(updateUserRoleSchema), updateUserRole);

export default router;
