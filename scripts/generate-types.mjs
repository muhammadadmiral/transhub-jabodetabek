import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import openapiTS, { astToString, COMMENT_HEADER } from "openapi-typescript";
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "VITE_");
const apiBaseUrl = env.VITE_TRANSIT_API_URL?.replace(/\/$/, "");

if (!apiBaseUrl) {
  throw new Error("VITE_TRANSIT_API_URL wajib diisi sebelum generate types");
}

const outputPath = resolve("src/lib/api/generated/schema.d.ts");
const schema = await openapiTS(new URL(`${apiBaseUrl}/openapi.json`));

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${COMMENT_HEADER}${astToString(schema)}`, "utf8");

console.log(`OpenAPI types generated: ${outputPath}`);
