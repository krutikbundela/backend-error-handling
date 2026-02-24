import { ApiError } from "../../utils/apiError";
import { TodoModel } from "./todo.model";

interface CreateTodoInput {
  title: string;
  description?: string;
  completed?: boolean;
}

interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

export const createTodo = async (userId: string, payload: CreateTodoInput) => {
  return TodoModel.create({
    ...payload,
    owner: userId,
  });
};

export const getTodosByOwner = async (userId: string) => {
  return TodoModel.find({ owner: userId }).sort({ createdAt: -1 });
};

export const getTodoById = async (userId: string, todoId: string) => {
  const todo = await TodoModel.findOne({
    _id: todoId,
    owner: userId,
  });

  if (!todo) {
    throw new ApiError(404, "Todo not found");
  }

  return todo;
};

export const updateTodoById = async (
  userId: string,
  todoId: string,
  payload: UpdateTodoInput
) => {
  const todo = await TodoModel.findOneAndUpdate(
    {
      _id: todoId,
      owner: userId,
    },
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!todo) {
    throw new ApiError(404, "Todo not found");
  }

  return todo;
};

export const deleteTodoById = async (userId: string, todoId: string) => {
  const todo = await TodoModel.findOneAndDelete({
    _id: todoId,
    owner: userId,
  });

  if (!todo) {
    throw new ApiError(404, "Todo not found");
  }
};
