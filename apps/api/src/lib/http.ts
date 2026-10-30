import type { NextFunction, Request, Response, RequestHandler } from "express";
import { ZodError, type ZodTypeAny, type z } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const notFound = (what = "That item") => new HttpError(404, `${what} wasn't found.`);
export const forbidden = (msg = "You don't have access to this.") => new HttpError(403, msg);

/** Wraps an async route so thrown errors reach the error handler. */
export const h =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

export function parse<T extends ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({ error: `${first.path.join(".") || "Request"}: ${first.message}`, issues: err.issues });
  }
  console.error(err);
  return res.status(500).json({ error: "Something went wrong on our side. Please try again." });
}
