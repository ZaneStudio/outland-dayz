<div className="flex items-center gap-2">
  <button onClick={() => (window as any).launcher?.minimize()} className="p-2 text-gray-400 hover:text-white">—</button>
  <button onClick={() => (window as any).launcher?.maximize()} className="p-2 text-gray-400 hover:text-white">□</button>
  <button onClick={() => (window as any).launcher?.close()} className="p-2 text-gray-400 hover:text-red-500">×</button>
</div>