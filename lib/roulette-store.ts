import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type RoulettePrize = { id: string; label: string; icon: string };
const file = path.join(process.cwd(), "data", "roulette.json");

export async function getRoulettePrizes(): Promise<RoulettePrize[]> { try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return []; } }
async function save(items: RoulettePrize[]) { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(items, null, 2)); }
export async function createRoulettePrize(input: Pick<RoulettePrize, "label" | "icon">) { const items = await getRoulettePrizes(); const item = { id: randomUUID(), ...input }; items.push(item); await save(items); return item; }
export async function updateRoulettePrize(id: string, input: Partial<Pick<RoulettePrize, "label" | "icon">>) { const items = await getRoulettePrizes(); const index = items.findIndex(item => item.id === id); if (index < 0) return null; items[index] = { ...items[index], ...input }; await save(items); return items[index]; }
export async function deleteRoulettePrize(id: string) { const items = await getRoulettePrizes(); const next = items.filter(item => item.id !== id); if (next.length === items.length) return false; await save(next); return true; }
