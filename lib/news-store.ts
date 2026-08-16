import { promises as fs } from "fs"; import path from "path"; import { randomUUID } from "crypto";
export type ManagedNews={id:string;slug:string;title:string;text:string;date:string;createdAt:string};const file=path.join(process.cwd(),"data","news.json");
export async function getManagedNews():Promise<ManagedNews[]>{try{return JSON.parse(await fs.readFile(file,"utf8"));}catch{return [];}}
async function save(items:ManagedNews[]){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(items,null,2));}
const slugify=(value:string)=>value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||randomUUID();
export async function createManagedNews(input:Pick<ManagedNews,"title"|"text"|"date">){const items=await getManagedNews();const base=slugify(input.title);const item={...input,id:randomUUID(),slug:`${base}-${Date.now().toString().slice(-5)}`,createdAt:new Date().toISOString()};items.unshift(item);await save(items);return item;}
export async function updateManagedNews(id:string,input:Partial<Pick<ManagedNews,"title"|"text"|"date">>){const items=await getManagedNews();const index=items.findIndex(x=>x.id===id);if(index<0)return null;items[index]={...items[index],...input};await save(items);return items[index];}
export async function deleteManagedNews(id:string){const items=await getManagedNews();const next=items.filter(x=>x.id!==id);if(next.length===items.length)return false;await save(next);return true;}
