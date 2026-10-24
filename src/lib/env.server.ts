// Server-side environment helper: loads variables from .env or .dev.vars if process.env is empty (local dev).
import fs from "node:fs";
import path from "node:path";

let loaded = false;

export function ensureEnvLoaded() {
  if (loaded) return;
  loaded = true;

  for (const filename of [".env", ".dev.vars", ".env.local"]) {
    try {
      const fullPath = path.resolve(process.cwd(), filename);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eq = trimmed.indexOf("=");
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
            if (key && !process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    } catch {
      // In cloud worker environments (Cloudflare), fs is not available and process.env is pre-bound.
    }
  }
}

// Ensure execution on module load
ensureEnvLoaded();
