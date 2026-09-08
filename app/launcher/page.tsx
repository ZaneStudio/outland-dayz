export default function WindowControls() {
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
    <div className="flex items-center gap-1">
      <button onClick={handleMinimize} className="p-2 text-gray-400 hover:text-white transition">
        —
      </button>
      <button onClick={handleMaximize} className="p-2 text-gray-400 hover:text-white transition">
        □
      </button>
      <button onClick={handleClose} className="p-2 text-gray-400 hover:text-red-500 transition">
        ✕
      </button>
    </div>
  );
}