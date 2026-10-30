import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./lib/env";
import { errorHandler } from "./lib/http";
import { auth } from "./routes/auth";
import { customer } from "./routes/customer";
import { pro } from "./routes/pro";
import { business } from "./routes/business";
import { admin } from "./routes/admin";
import { files } from "./routes/files";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: false }));
  app.use(express.json({ limit: "1mb" }));
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use(auth, customer, pro, business, admin, files);
  app.use(errorHandler);
  return app;
}
