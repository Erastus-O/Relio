function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing environment variable ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: req("JWT_SECRET", process.env.NODE_ENV === "production" ? undefined : "dev-only-secret"),
  uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:8081").split(","),
  disputeEvidenceDays: Number(process.env.DISPUTE_EVIDENCE_DAYS ?? 5),
  isProd: process.env.NODE_ENV === "production",
};
