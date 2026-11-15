import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import path from "path";

export interface LauncherReleaseInfo {
  version: string;
  fileName: string;
  downloadUrl: string;
}

const FALLBACK_VERSION = "1.2.0-beta.22";
const FALLBACK_FILE = "OutLand-Launcher-Beta-Setup-1.2.0-beta.22-x64.exe";

/**
 * Resolves the latest available launcher installer from public/launcher-updates/latest.yml,
 * verifying the executable exists on disk and falling back to the newest .exe if needed.
 */
export function getLatestLauncherRelease(): LauncherReleaseInfo {
  const dir = path.join(process.cwd(), "public", "launcher-updates");
  const ymlPath = path.join(dir, "latest.yml");

  try {
    if (existsSync(ymlPath)) {
      const yml = readFileSync(ymlPath, "utf8");
      const versionMatch = yml.match(/^version:\s*(.+)$/m);
      const pathMatch = yml.match(/^path:\s*(.+)$/m) || yml.match(/^\s*-\s*url:\s*(.+)$/m);
      const version = versionMatch?.[1]?.trim().replace(/^['"]|['"]$/g, "");
      const fileName = pathMatch?.[1]?.trim().replace(/^['"]|['"]$/g, "");

      if (fileName && existsSync(path.join(dir, fileName))) {
        return {
          version: version || FALLBACK_VERSION,
          fileName,
          downloadUrl: `/launcher-updates/${fileName}`,
        };
      }
    }

    if (existsSync(dir)) {
      const exeFiles = readdirSync(dir)
        .filter((f) => /\.exe$/i.test(f))
        .map((f) => ({ name: f, mtime: statSync(path.join(dir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);

      if (exeFiles.length > 0) {
        const newest = exeFiles[0].name;
        const verMatch = newest.match(/Setup-(.+)-x64\.exe$/i);
        return {
          version: verMatch?.[1] || FALLBACK_VERSION,
          fileName: newest,
          downloadUrl: `/launcher-updates/${newest}`,
        };
      }
    }
  } catch (err) {
    console.warn("Failed to resolve latest launcher release:", err);
  }

  return {
    version: FALLBACK_VERSION,
    fileName: FALLBACK_FILE,
    downloadUrl: `/launcher-updates/${FALLBACK_FILE}`,
  };
}
