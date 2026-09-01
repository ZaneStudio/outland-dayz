import { RadioTower } from "lucide-react";
import { siteConfig } from "@/lib/config";

export function ServerStatus() {
  return (
    <div className="panel cut flex items-center justify-between gap-8 bg-[#11170f]/85 px-5 py-3 backdrop-blur-sm w-fit">
      <div>
        <p className="eyebrow text-[10px] text-stone-400">Статус сервера</p>
        <p className="mt-0.5 flex items-center gap-2 font-bold text-[#b7d576] text-sm">
          <i className="pulse-dot h-2 w-2 rounded-full bg-[#a9e65c] shadow-[0_0_10px_#a9e65c]" /> ONLINE
        </p>
      </div>
      <div className="flex items-center gap-3 border-l border-white/10 pl-5">
        <RadioTower className="float text-[#aab979]" size={20} />
        <div className="text-xs text-stone-300">
          <p className="font-medium">{siteConfig.ip}</p>
          <p className="text-stone-400">PORT: {siteConfig.port}</p>
        </div>
      </div>
    </div>
  );
}