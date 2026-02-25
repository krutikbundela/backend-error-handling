import type { RequestHandler } from "express";

import { ApiError } from "../../utils/apiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createTodo,
  deleteTodoById,
  getTodoById,
  getTodosByOwner,
  updateTodoById,
} from "./todo.service";

interface CreateTodoBody {
  title: string;
  description?: string;
  completed?: boolean;
}

interface UpdateTodoBody {
  title?: string;
  description?: string;
  completed?: boolean;
}

const getUserId = (req: Parameters<RequestHandler>[0]): string => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Authentication is required");
  }

  return userId;
};

const getTodoId = (req: Parameters<RequestHandler>[0]): string => {
  const value = req.params.todoId;

  if (typeof value !== "string") {
    throw new ApiError(400, "Invalid todo id");
  }

  return value;
};

export const createTodoController: RequestHandler = asyncHandler(
  async (req, res) => {
    const userId = getUserId(req);
    const payload = req.body as CreateTodoBody;

    const todo = await createTodo(userId, payload);

    return res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: todo,
    });
  }
);

export const getTodosController: RequestHandler = asyncHandler(
  async (req, res) => {
    const userId = getUserId(req);

    const todos = await getTodosByOwner(userId);

    return res.status(200).json({
      success: true,
      message: "Todos fetched successfully",
      data: todos,
    });
  }
);

export const getTodoByIdController: RequestHandler = asyncHandler(
  async (req, res) => {
    const userId = getUserId(req);
    const todoId = getTodoId(req);

    const todo = await getTodoById(userId, todoId);

    return res.status(200).json({
      success: true,
      message: "Todo fetched successfully",
      data: todo,
    });
  }
);

export const updateTodoController: RequestHandler = asyncHandler(
  async (req, res) => {
    const userId = getUserId(req);
    const todoId = getTodoId(req);
    const payload = req.body as UpdateTodoBody;

    const todo = await updateTodoById(userId, todoId, payload);

    return res.status(200).json({
      success: true,
      message: "Todo updated successfully",
      data: todo,
    });
  }
);

export const deleteTodoController: RequestHandler = asyncHandler(
  async (req, res) => {
    const userId = getUserId(req);
    const todoId = getTodoId(req);

    await deleteTodoById(userId, todoId);

    return res.status(200).json({
      success: true,
      message: "Todo deleted successfully",
    });
  }
);
