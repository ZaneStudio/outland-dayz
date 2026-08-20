import { promises as fs } from "fs";
import path from "path";

type BalanceData={accounts:Record<string,{balance:number;history:{id:string;amount:number;reason:string;createdAt:string}[]}>;processedTransfers:string[]};
const file=path.join(process.cwd(),"data","balances.json");
async function read():Promise<BalanceData>{try{return JSON.parse(await fs.readFile(file,"utf8"));}catch{return {accounts:{},processedTransfers:[]};}}
async function save(data:BalanceData){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(data,null,2));}
export async function getBalance(steamId:string){const data=await read();return data.accounts[steamId]||{balance:0,history:[]};}
export async function creditBalance(steamId:string,amount:number,reason:string,id:string){const data=await read();if(data.processedTransfers.includes(id))return null;const account=data.accounts[steamId]||{balance:0,history:[]};account.balance+=amount;account.history.unshift({id,amount,reason,createdAt:new Date().toISOString()});data.accounts[steamId]=account;data.processedTransfers.push(id);await save(data);return account;}
