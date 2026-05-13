const DEFAULT_SESSION_PASSWORD =
  "replace-with-32+char-random-string-xxxxxxxx";

function readEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  adminPassword: readEnv("ADMIN_PASSWORD", "joshandleigh"),
  appUrl: readEnv("APP_URL", "http://localhost:3000").replace(/\/$/, ""),
  databaseUrl: readEnv("DATABASE_URL", "file:./dev.db"),
  nodeEnv: readEnv("NODE_ENV", "development"),
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  sessionPassword: readEnv("SESSION_PASSWORD", DEFAULT_SESSION_PASSWORD),
};

if (env.sessionPassword.length < 32) {
  throw new Error("SESSION_PASSWORD must be at least 32 characters long.");
}
