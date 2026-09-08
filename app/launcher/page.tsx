"use client";

import React from "react";

export default function LauncherPage() {
  const handleMinimize = () => {
    if (typeof window !== "undefined" && (window as any).launcher) {
      (window as any).launcher.minimize();
    }
  };

  const handleMaximize = () => {
    if (typeof window !== "undefined" && (window as any).launcher) {
      (window as any).launcher.maximize();
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && (window as any).launcher) {
      (window as any).launcher.close();
    }
  };

  return (
    <div className="bg-[#080a09] text-[#f0f1ea] h-screen flex flex-col overflow-hidden font-sans select-none">
      {/* Шапка лаунчера з кнопками керування */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur">
        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
          OUTLAND DAYZ · LAUNCHER
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={handleMinimize} className="p-2 text-gray-400 hover:text-white transition w-9 h-9 flex items-center justify-center rounded">
            —
          </button>
          <button onClick={handleMaximize} className="p-2 text-gray-400 hover:text-white transition w-9 h-9 flex items-center justify-center rounded">
            □
          </button>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-red-500 transition w-9 h-9 flex items-center justify-center rounded">
            ✕
          </button>
        </div>
      </header>

      {/* Основний вміст сторінки */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-4xl font-black uppercase mb-4">Лаунчер Outland DayZ</h1>
        <p className="text-gray-400 mb-6">Сайт та десктопна оболонка успішно зв'язані через Electron API.</p>
        
        <button 
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).launcher) {
              (window as any).launcher.openExternal("https://outland-dayz.onrender.com");
            }
          }}
          className="bg-[#a6c85d] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#b8d96b] transition"
        >
          Відкрити у браузері
        </button>
      </main>
    </div>
  );
}