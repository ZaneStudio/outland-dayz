import SftpClient from "ssh2-sftp-client";

export interface DeliveryRewardItem {
  isVehicle?: number;
  Classname: string;
  QuantityPercent?: number;
  HealthPercent?: number;
  Attachments?: unknown[];
}

export interface ServerDeliveryResult {
  ok: boolean;
  method: "pterodactyl-write" | "pterodactyl-upload" | "sftp" | "none";
  path: string;
  serverId?: string;
  host?: string;
  error?: string;
}

const DEFAULT_PANEL_URL = "https://console.uahost.eu";
const DEFAULT_CODES_DIR = "/profiles/FT_Mods/Promocodes_Free/Codes";
const KNOWN_NEW_SERVER_ID = "f5b20b0d";
const KNOWN_NEW_SFTP_HOST = "node-pl-4.uahost.eu";
const DEFAULT_SFTP_PORT = 2022;

export function getCodesDirectory(): string {
  return (process.env.DAYZ_CODES_DIR || DEFAULT_CODES_DIR).replace(/\/+$/, "");
}

function getPanelBaseUrl(): string {
  return (process.env.PTERODACTYL_PANEL_URL || DEFAULT_PANEL_URL).replace(/\/+$/, "");
}

function buildPromoJson(rewards: DeliveryRewardItem[]): string {
  const normalizedRewards = rewards.map((r) => ({
    isVehicle: r.isVehicle ?? 0,
    Classname: r.Classname,
    QuantityPercent: r.QuantityPercent ?? -1,
    HealthPercent: r.HealthPercent ?? -1,
    Attachments: Array.isArray(r.Attachments) ? r.Attachments : [],
  }));

  return JSON.stringify(
    {
      maxUsages: 1,
      currentUsages: 0,
      blacklistedSteamIDS: [],
      rewards: normalizedRewards,
    },
    null,
    2
  );
}

async function ensurePterodactylDir(
  baseUrl: string,
  serverId: string,
  apiKey: string,
  directory: string
): Promise<void> {
  const clean = directory.replace(/^\/+|\/+$/g, "");
  const segments = clean.split("/").filter(Boolean);
  let root = "/";
  for (const name of segments) {
    try {
      await fetch(`${baseUrl}/api/client/servers/${serverId}/files/create-folder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ root, name }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // Folder may already exist or create-folder not needed
    }
    root = root === "/" ? `/${name}` : `${root}/${name}`;
  }
}

async function deliverViaPterodactylWrite(
  baseUrl: string,
  serverId: string,
  apiKey: string,
  filePath: string,
  fileContent: string
): Promise<{ ok: boolean; status?: number; detail?: string }> {
  try {
    const res = await fetch(
      `${baseUrl}/api/client/servers/${serverId}/files/write?file=${encodeURIComponent(filePath)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "text/plain; charset=utf-8",
          Accept: "application/json",
        },
        body: fileContent,
        signal: AbortSignal.timeout(8000),
      }
    );
    if (res.ok) return { ok: true, status: res.status };
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, detail: text.slice(0, 200) };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : "Network error" };
  }
}

async function deliverViaPterodactylUpload(
  baseUrl: string,
  serverId: string,
  apiKey: string,
  directory: string,
  fileName: string,
  fileContent: string
): Promise<{ ok: boolean; status?: number; detail?: string }> {
  try {
    const uploadUrlRes = await fetch(`${baseUrl}/api/client/servers/${serverId}/files/upload`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!uploadUrlRes.ok) {
      return { ok: false, status: uploadUrlRes.status, detail: "Failed to get signed upload URL" };
    }

    const uploadData = await uploadUrlRes.json();
    const signedUrl: string | undefined = uploadData?.attributes?.url;
    if (!signedUrl) {
      return { ok: false, detail: "Missing signed upload URL" };
    }

    const formData = new FormData();
    formData.append("files", new Blob([fileContent], { type: "application/json" }), fileName);

    const separator = signedUrl.includes("?") ? "&" : "?";
    const uploadRes = await fetch(
      `${signedUrl}${separator}directory=${encodeURIComponent(directory)}`,
      {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(8000),
      }
    );

    if (uploadRes.ok) return { ok: true, status: uploadRes.status };
    return { ok: false, status: uploadRes.status, detail: "Signed node upload failed" };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : "Upload error" };
  }
}

async function deliverViaSftp(
  directory: string,
  filePath: string,
  fileContent: string
): Promise<{ ok: boolean; host: string; error?: string }> {
  const host = (process.env.SFTP_HOST || KNOWN_NEW_SFTP_HOST).trim();
  const port = Number(process.env.SFTP_PORT || DEFAULT_SFTP_PORT);
  const username = process.env.SFTP_USER?.trim();
  const password = process.env.SFTP_PASSWORD;

  if (!username || !password) {
    return { ok: false, host, error: "SFTP credentials are not configured" };
  }

  const sftp = new SftpClient();
  try {
    await sftp.connect({
      host,
      port: Number.isFinite(port) && port > 0 ? port : DEFAULT_SFTP_PORT,
      username,
      password,
      readyTimeout: 8000,
    });
    await sftp.mkdir(directory, true);
    await sftp.put(Buffer.from(fileContent, "utf8"), filePath);
    return { ok: true, host };
  } catch (err) {
    return {
      ok: false,
      host,
      error: err instanceof Error ? err.message : "SFTP upload error",
    };
  } finally {
    await sftp.end().catch(() => {});
  }
}

/**
 * Uploads the DayZ Promocodes_Free JSON file to the game server.
 * Supports Pterodactyl API (files/write -> files/upload, trying configured ID and new host ID f5b20b0d)
 * as well as direct SFTP upload (e.g. node-pl-4.uahost.eu:2022).
 */
export async function deliverPromoCodeToServer(
  code: string,
  rewards: DeliveryRewardItem[]
): Promise<ServerDeliveryResult> {
  const directory = getCodesDirectory();
  const fileName = `${code}.json`;
  const filePath = `${directory}/${fileName}`;
  const fileContent = buildPromoJson(rewards);

  const apiKey = process.env.PTERODACTYL_API_KEY?.trim();
  const configuredServerId = process.env.PTERODACTYL_SERVER_ID?.trim();
  const sftpConfigured = Boolean(process.env.SFTP_USER?.trim() && process.env.SFTP_PASSWORD);
  const errors: string[] = [];

  // 1) Try SFTP first if explicitly preferred via DELIVERY_METHOD=sftp
  if (process.env.DELIVERY_METHOD?.toLowerCase() === "sftp" && sftpConfigured) {
    const sftpRes = await deliverViaSftp(directory, filePath, fileContent);
    if (sftpRes.ok) {
      return { ok: true, method: "sftp", path: filePath, host: sftpRes.host };
    }
    if (sftpRes.error) errors.push(`SFTP: ${sftpRes.error}`);
  }

  // 2) Try Pterodactyl Client API
  if (apiKey) {
    const baseUrl = getPanelBaseUrl();
    const candidateIds = Array.from(
      new Set([configuredServerId, KNOWN_NEW_SERVER_ID].filter((id): id is string => Boolean(id)))
    );

    for (const serverId of candidateIds) {
      await ensurePterodactylDir(baseUrl, serverId, apiKey, directory);

      const writeRes = await deliverViaPterodactylWrite(
        baseUrl,
        serverId,
        apiKey,
        filePath,
        fileContent
      );
      if (writeRes.ok) {
        return {
          ok: true,
          method: "pterodactyl-write",
          path: filePath,
          serverId,
          host: baseUrl,
        };
      }

      const uploadRes = await deliverViaPterodactylUpload(
        baseUrl,
        serverId,
        apiKey,
        directory,
        fileName,
        fileContent
      );
      if (uploadRes.ok) {
        return {
          ok: true,
          method: "pterodactyl-upload",
          path: filePath,
          serverId,
          host: baseUrl,
        };
      }

      errors.push(
        `Pterodactyl(${serverId}): write=${writeRes.status || writeRes.detail}, upload=${uploadRes.status || uploadRes.detail}`
      );
    }
  }

  // 3) Fallback to SFTP (node-pl-4.uahost.eu:2022) if configured
  if (sftpConfigured) {
    const sftpRes = await deliverViaSftp(directory, filePath, fileContent);
    if (sftpRes.ok) {
      return { ok: true, method: "sftp", path: filePath, host: sftpRes.host };
    }
    if (sftpRes.error) errors.push(`SFTP: ${sftpRes.error}`);
  }

  if (!apiKey && !sftpConfigured) {
    return {
      ok: false,
      method: "none",
      path: filePath,
      error: "Не налаштовано PTERODACTYL_API_KEY/PTERODACTYL_SERVER_ID або SFTP_USER/SFTP_PASSWORD",
    };
  }

  return {
    ok: false,
    method: "none",
    path: filePath,
    error: errors.join(" | ") || "Не вдалося доставити файл на сервер",
  };
}
