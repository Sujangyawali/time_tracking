import React from "react";

export const PALETTE = ["#D98E3D", "#5C7A5E", "#4C6B72", "#B85C4A", "#8C6E9C", "#C2A661"];
export const INK = "#23241F";
export const MUTED = "#74786F";
export const PAPER = "#F7F4EE";
export const LINE = "#E5DFD3";
export const AMBER = "#D98E3D";
export const MOSS = "#5C7A5E";
export const CLAY = "#B85C4A";

export const STATUS_STYLES = {
  Pending: { bg: "#F1EEE6", fg: MUTED },
  "In Progress": { bg: "#EFE3D0", fg: "#9C6B23" },
  Completed: { bg: "#E4EBE4", fg: MOSS },
};

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border ${className}`} style={{ borderColor: LINE }}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.14em] font-semibold mb-3" style={{ color: MUTED }}>
      {children}
    </div>
  );
}

export function StatBlock({ label, value, sub, accent }) {
  return (
    <Card className="p-4 flex-1 min-w-[150px]">
      <div className="text-xs font-medium mb-1" style={{ color: MUTED }}>{label}</div>
      <div className="text-3xl leading-none" style={{ fontFamily: "'Fraunces', serif", color: accent || INK, fontWeight: 600 }}>
        {value}
      </div>
      {sub && <div className="text-xs mt-1.5" style={{ color: MUTED }}>{sub}</div>}
    </Card>
  );
}

export function ProgressRing({ percent, size = 108, stroke = 10, color = AMBER }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={LINE} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, fill: INK }}
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

export function IconBtn({ onClick, title, children, danger }) {
  return (
    <button onClick={onClick} title={title} className="p-1.5 rounded-md hover:bg-black/5 transition-colors" style={{ color: danger ? CLAY : MUTED }}>
      {children}
    </button>
  );
}

export function TinyInput(props) {
  return (
    <input {...props} className={`px-2.5 py-1.5 rounded-lg border text-sm outline-none focus:ring-2 ${props.className || ""}`} style={{ borderColor: LINE, ...props.style }} />
  );
}

export function TinySelect(props) {
  return (
    <select {...props} className={`px-2.5 py-1.5 rounded-lg border text-sm outline-none bg-white ${props.className || ""}`} style={{ borderColor: LINE, ...props.style }}>
      {props.children}
    </select>
  );
}

export function PrimaryBtn({ onClick, children, style }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity" style={{ background: INK, ...style }}>
      {children}
    </button>
  );
}
