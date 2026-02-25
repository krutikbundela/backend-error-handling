import { Router } from "express";

import { authRouter } from "./features/auth/auth.route";
import { todoRouter } from "./features/todo/todo.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/todos", todoRouter);

export const apiRouter = router;
