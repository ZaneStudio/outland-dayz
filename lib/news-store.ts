import { randomUUID } from "crypto"; import { db } from "@/lib/db";
export type ManagedNews={id:string;slug:string;title:string;text:string;date:string;createdAt:string};
const map=(item:{id:string;slug:string;title:string;text:string;date:string;createdAt:Date}):ManagedNews=>({...item,createdAt:item.createdAt.toISOString()});
const slugify=(value:string)=>value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||randomUUID();
export async function getManagedNews(){return (await db.managedNews.findMany({orderBy:{createdAt:"desc"}})).map(map);}
export async function createManagedNews(input:Pick<ManagedNews,"title"|"text"|"date">){const base=slugify(input.title);return map(await db.managedNews.create({data:{...input,id:randomUUID(),slug:`${base}-${Date.now().toString().slice(-5)}`}}));}
export async function updateManagedNews(id:string,input:Partial<Pick<ManagedNews,"title"|"text"|"date">>){try{return map(await db.managedNews.update({where:{id},data:input}));}catch{return null;}}
export async function deleteManagedNews(id:string){try{await db.managedNews.delete({where:{id}});return true;}catch{return false;}}
