import type { CSSProperties } from "react";

const leaves = [
  ["🍂", "3%", "0s", "15s", "1.05rem"],
  ["🍁", "10%", "-7s", "19s", "1.45rem"],
  ["🍂", "18%", "-12s", "17s", "1.15rem"],
  ["🍃", "27%", "-4s", "22s", "1rem"],
  ["🍁", "38%", "-15s", "20s", "1.25rem"],
  ["🍂", "48%", "-9s", "16s", "1.4rem"],
  ["🍁", "59%", "-18s", "24s", "1.1rem"],
  ["🍂", "68%", "-6s", "18s", "1.3rem"],
  ["🍃", "76%", "-14s", "23s", "1rem"],
  ["🍁", "85%", "-3s", "17s", "1.45rem"],
  ["🍂", "93%", "-11s", "21s", "1.15rem"],
  ["🍁", "97%", "-20s", "25s", ".95rem"],
] as const;

export function AutumnLeaves() {
  return (
    <div className="autumn-leaves" aria-hidden="true">
      {leaves.map(([leaf, left, delay, duration, size], index) => (
        <span
          className="autumn-leaf"
          key={`${leaf}-${index}`}
          style={{
            "--leaf-left": left,
            "--leaf-delay": delay,
            "--leaf-duration": duration,
            "--leaf-size": size,
          } as CSSProperties}
        >
          {leaf}
        </span>
      ))}
    </div>
  );
}
