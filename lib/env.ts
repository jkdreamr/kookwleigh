const DEFAULT_SESSION_PASSWORD = "replace-with-32+char-random-string-xxxxxxxx";

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

// Warn about insecure defaults in production. This is a console warning rather
// than a throw so that `next build` (which runs with NODE_ENV=production) can
// still succeed when a developer builds locally without production env vars.
if (env.nodeEnv === "production") {
  if (env.sessionPassword === DEFAULT_SESSION_PASSWORD) {
    console.error(
      "\n⚠️  [kookwleigh] CRITICAL: SESSION_PASSWORD is still the default placeholder.\n" +
        "   Sessions are not secure. Set a random 32+ character value in your deployment environment.\n",
    );
  }

  if (env.adminPassword === "joshandleigh") {
    console.warn(
      "\n⚠️  [kookwleigh] WARNING: ADMIN_PASSWORD is still the default value.\n" +
        "   Change it in your deployment environment before going live.\n",
    );
  }
}
