import { Router } from "express";

import { protect } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate.middleware";
import {
  createTodoController,
  deleteTodoController,
  getTodoByIdController,
  getTodosController,
  updateTodoController,
} from "./todo.controller";
import { createTodoSchema, todoIdSchema, updateTodoSchema } from "./todo.validation";

const router = Router();

router.use(protect);

router.post("/", validateRequest(createTodoSchema), createTodoController);
router.get("/", getTodosController);
router.get("/:todoId", validateRequest(todoIdSchema), getTodoByIdController);
router.patch("/:todoId", validateRequest(updateTodoSchema), updateTodoController);
router.delete("/:todoId", validateRequest(todoIdSchema), deleteTodoController);

export const todoRouter = router;
