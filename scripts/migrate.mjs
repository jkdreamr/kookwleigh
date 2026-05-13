/**
 * Runs `prisma migrate deploy` with a patched DATABASE_URL that includes
 * connect_timeout=30, preventing Neon (and other serverless Postgres providers)
 * from timing out on cold-start advisory lock acquisition.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(rootDirectory) {
  for (const fileName of [".env", ".env.example"]) {
    const filePath = resolve(rootDirectory, fileName);

    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^"(.*)"$/, "$1");

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

const root = process.cwd();
loadEnv(root);

let databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

// Append connect_timeout for Postgres so Neon cold-start advisory lock
// acquisition does not time out during `prisma migrate deploy`.
if (!databaseUrl.startsWith("file:") && !databaseUrl.includes("connect_timeout")) {
  const separator = databaseUrl.includes("?") ? "&" : "?";
  databaseUrl = `${databaseUrl}${separator}connect_timeout=30`;
}

const env = { ...process.env, DATABASE_URL: databaseUrl };

const result = spawnSync("prisma", ["migrate", "deploy"], {
  env,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
