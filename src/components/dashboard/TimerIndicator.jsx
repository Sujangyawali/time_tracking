import React, { useEffect, useState } from "react";
import { Timer, AlertTriangle, Square } from "lucide-react";
import { AMBER, CLAY } from "../../styles/dashboardTheme";
import { fmtClock } from "../../lib/dateUtils";
import { isTimerStale } from "../../lib/taskEntryUtils";

export default function TimerIndicator({ taskName, startedAt, onStop }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsedMs = Math.max(0, now - new Date(startedAt).getTime());
  const stale = isTimerStale(startedAt, now);
  const color = stale ? CLAY : AMBER;

  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium"
      style={{ background: stale ? "#F7E9E4" : "#FCF3DE", color }}
    >
      {stale ? <AlertTriangle size={15} /> : <Timer size={15} className="animate-pulse" />}
      <span className="truncate max-w-[160px]" style={{ color: "inherit" }}>{taskName}</span>
      <span className="mono-num">{fmtClock(elapsedMs)}</span>
      <button
        onClick={onStop}
        title="Stop timer"
        className="p-1 rounded-md hover:bg-black/10 transition-colors"
        style={{ color: "inherit" }}
      >
        <Square size={13} fill="currentColor" />
      </button>
    </div>
  );
}
