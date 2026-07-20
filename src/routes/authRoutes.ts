import express from "express";
import { register, login, googleLogin, betterAuthExchange, getMe } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/auth.js";
import { registerSchema, loginSchema } from "../validations/index.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google", googleLogin);
router.post("/better-auth-exchange", betterAuthExchange);
router.get("/me", authenticate, getMe);

export default router;
