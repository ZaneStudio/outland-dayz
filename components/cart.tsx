"use client";
import { createContext,useContext,useState } from "react"; import type { Product } from "@/lib/data";
type Cart={items:Product[]; add:(p:Product)=>void; remove:(id:string)=>void; clear:()=>void}; const C=createContext<Cart|null>(null);
export function CartProvider({children}:{children:React.ReactNode}) { const [items,setItems]=useState<Product[]>([]); return <C.Provider value={{items,add:p=>{setItems(x=>[...x,p]);alert("Товар додано до кошика")},remove:id=>setItems(x=>x.filter((_,i)=>`${id}-${i}`!==id)),clear:()=>setItems([])}}>{children}</C.Provider> }; export const useCart=()=>useContext(C)!;
