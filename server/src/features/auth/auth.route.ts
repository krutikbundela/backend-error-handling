import { Router } from "express";

import { optionalProtect } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate.middleware";
import { login, logout, refreshToken, register } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", optionalProtect, logout);

export const authRouter = router;
