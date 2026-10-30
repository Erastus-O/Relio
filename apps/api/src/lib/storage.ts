import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { env } from "./env";
import { HttpError } from "./http";

const MAX_BYTES = 15 * 1024 * 1024;

/** Accepts images (and PDFs for documents) in memory; files are written by saveUpload. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype) || file.mimetype === "application/pdf") cb(null, true);
    else cb(new HttpError(400, "Upload a JPG, PNG, HEIC or PDF file."));
  },
});

export interface Stored {
  key: string;
  checksum: string;
}

/**
 * Saves a file and returns its storage key. Development stores files on disk;
 * in production replace this with S3/GCS and strip EXIF location before saving
 * customer-visible copies.
 */
export async function saveUpload(file: Express.Multer.File, folder: string): Promise<Stored> {
  const checksum = "sha256:" + crypto.createHash("sha256").update(file.buffer).digest("hex");
  const ext = path.extname(file.originalname || "").toLowerCase() || (file.mimetype === "application/pdf" ? ".pdf" : ".jpg");
  const key = `${folder}/${crypto.randomUUID()}${ext}`;
  const full = path.join(env.uploadDir, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, file.buffer);
  return { key, checksum };
}

export function filePath(key: string) {
  const full = path.resolve(env.uploadDir, key);
  if (!full.startsWith(path.resolve(env.uploadDir))) throw new HttpError(400, "Invalid file.");
  return full;
}
