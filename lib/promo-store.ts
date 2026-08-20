import { promises as fs } from "fs";
import path from "path";
import { randomBytes, randomUUID } from "crypto";

export type PromoCode = { id:string; code:string; amount:number; maxActivations:number; activations:number; expiresAt:string; createdAt:string };
const file=path.join(process.cwd(),"data","promocodes.json");
export async function getPromoCodes():Promise<PromoCode[]>{try{return JSON.parse(await fs.readFile(file,"utf8"));}catch{return [];}}
async function save(items:PromoCode[]){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(items,null,2));}
export async function createPromoCode(input:{amount:number;maxActivations:number;expiresAt:string}){const items=await getPromoCodes();const item:PromoCode={id:randomUUID(),code:`OUT-${randomBytes(4).toString("hex").toUpperCase()}`,amount:input.amount,maxActivations:input.maxActivations,activations:0,expiresAt:input.expiresAt,createdAt:new Date().toISOString()};items.unshift(item);await save(items);return item;}
