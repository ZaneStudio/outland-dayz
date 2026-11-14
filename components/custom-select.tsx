"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  count?: number;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: React.ReactNode;
  className?: string;
  align?: "left" | "right";
};

export function CustomSelect({
  value,
  onChange,
  options,
  icon,
  className = "",
  align = "left",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption =
    options.find((opt) => opt.value.toLowerCase() === value.toLowerCase()) || options[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`h-11 w-full rounded-xl px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-3 transition cursor-pointer select-none border ${
          open
            ? "bg-[#161d10]/90 border-[#b6c980] text-white shadow-[0_0_20px_rgba(182,201,128,0.14)]"
            : "bg-black/40 border-white/10 text-stone-200 hover:border-[#b6c980]/45 hover:text-white"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {icon && <span className="text-[#b6c980] shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption?.label ?? value}</span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[#b6c980] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-[calc(100%+8px)] ${
            align === "right" ? "right-0" : "left-0"
          } z-50 min-w-full w-max max-w-[290px] rounded-2xl bg-[#0b0e09]/95 backdrop-blur-xl border border-[#b6c980]/30 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_25px_rgba(182,201,128,0.1)] menu-reveal`}
        >
          <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1">
            {options.map((opt) => {
              const isSelected = opt.value.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-[#243016] to-[#18200f] text-[#dce8b3] border border-[#b6c980]/35 shadow-inner"
                      : "text-stone-300 border border-transparent hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    {typeof opt.count === "number" && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                          isSelected
                            ? "bg-[#b6c980]/20 text-[#dce8b3]"
                            : "bg-white/5 text-stone-400"
                        }`}
                      >
                        {opt.count}
                      </span>
                    )}
                    {isSelected && <Check size={14} className="text-[#b6c980] shrink-0" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
