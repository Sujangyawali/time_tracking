import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { INK, LINE, MUTED, CLAY, AMBER, MOSS } from "../../styles/dashboardTheme";

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

export function EmptyNote({ text }) {
  return <div className="text-sm py-8 text-center" style={{ color: MUTED }}>{text}</div>;
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

export function MultiSelect({ options, selected, onChange, placeholder = "All" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggle = (value) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label || placeholder
      : `${selected.length} selected`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-2.5 py-1.5 rounded-lg border text-sm outline-none bg-white flex items-center gap-1.5"
        style={{ borderColor: LINE, color: selected.length === 0 ? MUTED : INK }}
      >
        <span>{label}</span>
        <ChevronDown size={13} style={{ color: MUTED }} />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 min-w-[180px] max-h-64 overflow-y-auto rounded-lg border bg-white shadow-lg py-1" style={{ borderColor: LINE }}>
          {options.map((o) => (
            <label key={o.value} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-black/[0.03] cursor-pointer">
              <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function PrimaryBtn({ onClick, children, style }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity" style={{ background: INK, ...style }}>
      {children}
    </button>
  );
}
