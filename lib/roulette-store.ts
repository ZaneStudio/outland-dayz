import { randomUUID } from "crypto"; import { db } from "@/lib/db";
export type RoulettePrize={id:string;label:string;icon:string;image?:string};
const map=(item:{id:string;label:string;icon:string;image:string|null}):RoulettePrize=>({...item,image:item.image||undefined});
export async function getRoulettePrizes(){return (await db.managedRoulettePrize.findMany({orderBy:{id:"asc"}})).map(map);}
export async function createRoulettePrize(input:Pick<RoulettePrize,"label"|"icon"|"image">){return map(await db.managedRoulettePrize.create({data:{id:randomUUID(),label:input.label,icon:input.icon,image:input.image||null}}));}
export async function updateRoulettePrize(id:string,input:Partial<Pick<RoulettePrize,"label"|"icon"|"image">>){try{return map(await db.managedRoulettePrize.update({where:{id},data:{...input,image:input.image===undefined?undefined:input.image||null}}));}catch{return null;}}
export async function deleteRoulettePrize(id:string){try{await db.managedRoulettePrize.delete({where:{id}});return true;}catch{return false;}}
