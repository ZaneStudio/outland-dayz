import type { CSSProperties } from "react";

const leaves = [
  ["3%", "0s", "15s", "1.55rem"],
  ["10%", "-7s", "19s", "2.05rem"],
  ["18%", "-12s", "17s", "1.7rem"],
  ["27%", "-4s", "22s", "1.45rem"],
  ["38%", "-15s", "20s", "1.85rem"],
  ["48%", "-9s", "16s", "2rem"],
  ["59%", "-18s", "24s", "1.6rem"],
  ["68%", "-6s", "18s", "1.9rem"],
  ["76%", "-14s", "23s", "1.5rem"],
  ["85%", "-3s", "17s", "2.05rem"],
  ["93%", "-11s", "21s", "1.7rem"],
  ["97%", "-20s", "25s", "1.4rem"],
] as const;

export function AutumnLeaves() {
  return (
    <div className="autumn-leaves" aria-hidden="true">
      {leaves.map(([left, delay, duration, size], index) => (
        <img
          src="/images/autumn-leaf.png"
          alt=""
          decoding="async"
          draggable={false}
          className="autumn-leaf"
          key={`leaf-${index}`}
          style={
            {
              "--leaf-left": left,
              "--leaf-delay": delay,
              "--leaf-duration": duration,
              "--leaf-size": size,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
