"use client";

import { useState } from "react";

interface Visitor {
  id: string;
  steamId: string;
  username: string;
  avatar: string | null;
  lastSeen: Date;
}

export default function VisitorsClient({ initialVisitors }: { initialVisitors: Visitor[] }) {
  const [search, setSearch] = useState("");

  const filteredVisitors = initialVisitors.filter(
    (v) =>
      v.username.toLowerCase().includes(search.toLowerCase()) ||
      v.steamId.includes(search)
  );

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Гравці на сайті (Steam)</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Пошук за нікнеймом або Steam ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600"
        />
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 text-sm">
              <th className="p-4">ОСТАННІЙ ВІЗИТ</th>
              <th className="p-4">НІКНЕЙМ</th>
              <th className="p-4">STEAM ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.length > 0 ? (
              filteredVisitors.map((visitor) => (
                <tr key={visitor.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                  <td className="p-4 text-neutral-300 text-sm">
                    {new Date(visitor.lastSeen).toLocaleString()}
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    {visitor.avatar ? (
                      <img src={visitor.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-700" />
                    )}
                    <span className="font-medium">{visitor.username}</span>
                  </td>
                  <td className="p-4 text-neutral-400 font-mono text-sm">{visitor.steamId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-neutral-500">
                  Нікого не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}