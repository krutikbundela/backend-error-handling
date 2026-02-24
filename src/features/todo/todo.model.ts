import { Schema, Types, model, type HydratedDocument } from "mongoose";

export interface ITodo {
  title: string;
  description?: string;
  completed: boolean;
  owner: Types.ObjectId;
}

export type TodoDocument = HydratedDocument<ITodo>;

const todoSchema = new Schema<ITodo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

todoSchema.index({ owner: 1, createdAt: -1 });

export const TodoModel = model<ITodo>("Todo", todoSchema);
