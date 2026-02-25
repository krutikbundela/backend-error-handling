import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

// ===== SERVER BOOTSTRAP FLOW =====
// Boot order matters:
// 1) Validate env (already done when env module is imported)
// 2) Connect database
// 3) Start HTTP server
const startServer = async (): Promise<void> => {
  // We connect to MongoDB before listening so requests do not hit
  // a half-initialized server that cannot access data.
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

// If startup fails (DB down, invalid config, etc.), fail fast and exit.
// In production this lets process managers (Docker/K8s/PM2) restart cleanly.
void startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});

// ===== PROCESS-LEVEL SAFETY NETS =====
// These handlers catch errors outside Express request flow.
// Example: a Promise rejection not awaited inside background logic.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  process.exit(1);
});

// Catches synchronous exceptions that escape normal try/catch boundaries.
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});
