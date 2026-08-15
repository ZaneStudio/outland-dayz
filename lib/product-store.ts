import { promises as fs } from "fs"; import path from "path"; import { randomUUID } from "crypto";
export type ManagedProduct = { id:string; name:string; description:string; price:number; category:string; image:string; popular:number; createdAt:string };
const file = path.join(process.cwd(), "data", "products.json");
export async function getManagedProducts():Promise<ManagedProduct[]> { try { return JSON.parse(await fs.readFile(file,"utf8")); } catch { return []; } }
async function save(items:ManagedProduct[]){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(items,null,2));}
export async function createManagedProduct(input:Omit<ManagedProduct,"id"|"popular"|"createdAt">){const item={...input,id:randomUUID(),popular:0,createdAt:new Date().toISOString()};const items=await getManagedProducts();items.unshift(item);await save(items);return item;}
export async function updateManagedProduct(id:string,input:Partial<Omit<ManagedProduct,"id"|"createdAt">>){const items=await getManagedProducts();const i=items.findIndex(x=>x.id===id);if(i<0)return null;items[i]={...items[i],...input};await save(items);return items[i];}
export async function deleteManagedProduct(id:string){const items=await getManagedProducts();const next=items.filter(x=>x.id!==id);if(next.length===items.length)return false;await save(next);return true;}
