import { promises as fs } from "fs";
import path from "path";
import { randomBytes, randomUUID } from "crypto";

export type PromoCode = { id:string; code:string; amount:number; maxActivations:number; activations:number; activatedSteamIds:string[]; expiresAt:string; createdAt:string };
const file=path.join(process.cwd(),"data","promocodes.json");
export async function getPromoCodes():Promise<PromoCode[]>{try{return JSON.parse(await fs.readFile(file,"utf8"));}catch{return [];}}
async function save(items:PromoCode[]){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(items,null,2));}
export async function createPromoCode(input:{amount:number;maxActivations:number;expiresAt:string}){const items=await getPromoCodes();const item:PromoCode={id:randomUUID(),code:`OUT-${randomBytes(4).toString("hex").toUpperCase()}`,amount:input.amount,maxActivations:input.maxActivations,activations:0,activatedSteamIds:[],expiresAt:input.expiresAt,createdAt:new Date().toISOString()};items.unshift(item);await save(items);return item;}
export async function activatePromoCode(code:string,steamId:string){const items=await getPromoCodes();const item=items.find(x=>x.code===code.toUpperCase().trim());if(!item)return {error:"Промокод не знайдено"};item.activatedSteamIds??=[];if(new Date(`${item.expiresAt}T23:59:59`).getTime()<Date.now())return {error:"Термін дії промокоду завершився"};if(item.activations>=item.maxActivations)return {error:"Ліміт активацій вичерпано"};if(item.activatedSteamIds.includes(steamId))return {error:"Ви вже використали цей промокод"};item.activations++;item.activatedSteamIds.push(steamId);await save(items);return {amount:item.amount,code:item.code};}
