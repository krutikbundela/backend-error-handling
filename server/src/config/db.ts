import mongoose from "mongoose";

import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  // `strictQuery` prevents unknown query fields from being silently accepted.
  // This helps avoid mistakes and keeps query behavior predictable.
  mongoose.set("strictQuery", true);

  // Centralized DB connection keeps startup flow explicit and testable.
  await mongoose.connect(env.MONGO_URI);
};
