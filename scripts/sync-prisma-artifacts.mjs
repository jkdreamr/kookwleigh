import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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

const prismaDirectory = resolve(root, "prisma");
const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const target = databaseUrl.startsWith("file:") ? "sqlite" : "postgres";
const sourceSchemaPath = resolve(prismaDirectory, `schema.${target}.prisma`);
const targetSchemaPath = resolve(prismaDirectory, "schema.prisma");
const sourceMigrationsPath = resolve(prismaDirectory, `migrations.${target}`);
const targetMigrationsPath = resolve(prismaDirectory, "migrations");

if (!existsSync(sourceSchemaPath)) {
  throw new Error(`Missing Prisma schema source: ${sourceSchemaPath}`);
}

writeFileSync(targetSchemaPath, readFileSync(sourceSchemaPath, "utf8"));

rmSync(targetMigrationsPath, { force: true, recursive: true });
mkdirSync(targetMigrationsPath, { recursive: true });

if (existsSync(sourceMigrationsPath)) {
  cpSync(sourceMigrationsPath, targetMigrationsPath, { recursive: true });
}

console.log(`Synced Prisma artifacts for ${target}`);
