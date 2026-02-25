import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid todo id");

export const createTodoSchema = {
  body: z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(500).optional(),
    completed: z.boolean().optional(),
  }),
};

export const updateTodoSchema = {
  params: z.object({
    todoId: objectIdSchema,
  }),
  body: z
    .object({
      title: z.string().min(1).max(120).optional(),
      description: z.string().max(500).optional(),
      completed: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
};

export const todoIdSchema = {
  params: z.object({
    todoId: objectIdSchema,
  }),
};
