import React from "react";
import { Flame } from "lucide-react";
import { Card, SectionLabel, EmptyNote } from "../shared";
import { dowMonday } from "../../../lib/dateUtils";
import { AMBER, LINE, MUTED } from "../../../styles/dashboardTheme";

function chunkIntoWeeks(timeline) {
  if (timeline.length === 0) return [];
  const firstDate = timeline[0].date;
  const monday = dowMonday(firstDate);
  const firstDay = new Date(firstDate + "T00:00:00");
  const leadingBlanks = Math.round((firstDay - monday) / 86400000);
  const padded = [...Array(leadingBlanks).fill(null), ...timeline];
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  return weeks;
}

function StreakCard({ series }) {
  const { catColor, catName, subName, name, timeline, currentStreak, longestStreak } = series;
  const weeks = chunkIntoWeeks(timeline);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: catColor }} />
          <div className="min-w-0">
            <div className="font-medium truncate">{name}</div>
            <div className="text-[11px] truncate" style={{ color: MUTED }}>{catName} / {subName}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 justify-end" style={{ color: currentStreak > 0 ? AMBER : MUTED }}>
            <Flame size={15} fill={currentStreak > 0 ? AMBER : "none"} />
            <span className="leading-none" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18 }}>{currentStreak}</span>
          </div>
          <div className="text-[11px]" style={{ color: MUTED }}>best {longestStreak}</div>
        </div>
      </div>
      <div className="flex overflow-x-auto" style={{ gap: 3 }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap: 3 }}>
            {week.map((day, di) =>
              day ? (
                <div
                  key={di}
                  title={`${day.date} — ${day.filled ? "Completed" : "Not completed"}`}
                  style={{ width: 11, height: 11, borderRadius: 2, background: day.filled ? catColor : LINE }}
                />
              ) : (
                <div key={di} style={{ width: 11, height: 11 }} />
              )
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function StreaksTab({ streakSeries }) {
  if (streakSeries.length === 0) {
    return (
      <Card className="p-5">
        <SectionLabel>Streaks</SectionLabel>
        <EmptyNote text="No streaks yet — use “Duplicate today for tomorrow” (or the per-row copy icon) on a task for at least 7 days in a row, marking each day Completed, to start tracking a streak here." />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {streakSeries.map((s) => (
        <StreakCard key={`${s.subId}::${s.name}`} series={s} />
      ))}
    </div>
  );
}
