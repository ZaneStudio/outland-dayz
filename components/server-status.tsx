import {RadioTower} from "lucide-react"; 
import {siteConfig} from "@/lib/config"; 

export function ServerStatus(){
  return (
    <div className="panel cut grid gap-3 bg-[#11170f]/85 p-3.5 backdrop-blur-sm sm:grid-cols-2 items-center">
      <div>
        <p className="eyebrow text-[10px]">Статус сервера</p>
        <p className="mt-1 flex items-center gap-2 font-bold text-[#b7d576] text-sm">
          <i className="pulse-dot h-2 w-2 rounded-full bg-[#a9e65c] shadow-[0_0_12px_#a9e65c]"/> ONLINE
        </p>
      </div>
      <div className="flex items-center gap-3 sm:justify-self-end">
        <RadioTower className="float text-[#aab979]" size={20} />
        <div className="text-xs text-stone-300">
          <p>{siteConfig.ip}</p>
          <p>PORT: {siteConfig.port}</p>
        </div>
      </div>
    </div>
  );
}