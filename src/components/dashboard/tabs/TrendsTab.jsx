import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, LineChart, Line } from "recharts";
import { AlertTriangle } from "lucide-react";
import { Card, SectionLabel, EmptyNote } from "../shared";
import { fmtHrs, fmtShort } from "../../../lib/dateUtils";
import { AMBER, CLAY, INK, LINE, MOSS, MUTED } from "../../../styles/dashboardTheme";

export default function TrendsTab({
  trendData, trendRange, setTrendRange, completionTrend, weeklyComparison,
  thisWeekTotal, lastWeekTotal, weekDelta, busiestHour, peakHour, overdueTasks,
  estVsActualByCategory, estVsActualTasks,
}) {
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <SectionLabel>Estimated vs. actual time</SectionLabel>
        {estVsActualByCategory.length === 0 ? (
          <EmptyNote text="Add estimated minutes and log time on a few tasks to see this comparison." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <div className="text-xs mb-2" style={{ color: MUTED }}>By category, selected period</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={estVsActualByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke={LINE} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED }} />
                    <YAxis tick={{ fontSize: 11, fill: MUTED }} tickFormatter={(v) => `${v}h`} />
                    <Tooltip formatter={(v) => `${v}h`} contentStyle={{ borderRadius: 8, borderColor: LINE, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="estHrs" name="Estimated" fill={LINE} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actualHrs" name="Actual" fill={"#4C6B72"} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <div className="text-xs mb-2" style={{ color: MUTED }}>Biggest variance, individual tasks</div>
              {estVsActualTasks.length === 0 ? <EmptyNote text="No tasks with both an estimate and logged time yet." /> : (
                <div className="space-y-2">
                  {estVsActualTasks.map((t) => {
                    const over = t.variance > 0;
                    return (
                      <div key={t.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg" style={{ background: "#FBF9F5" }}>
                        <div className="min-w-0 mr-2">
                          <div className="font-medium truncate">{t.name}</div>
                          <div className="text-[11px]" style={{ color: MUTED }}>{fmtHrs(t.estMinutes)} est · {fmtHrs(t.actual)} actual</div>
                        </div>
                        <span className="text-xs font-semibold shrink-0" style={{ color: over ? CLAY : MOSS }}>
                          {over ? "+" : ""}{Math.round(t.variance)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <SectionLabel>Daily hours logged</SectionLabel>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "#EFEAE0" }}>
            {[7, 30, 90].map((n) => (
              <button key={n} onClick={() => setTrendRange(n)} className="px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ background: trendRange === n ? "#fff" : "transparent", color: trendRange === n ? INK : MUTED }}>
                {n}d
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={LINE} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: MUTED }} interval={trendRange === 90 ? 9 : trendRange === 30 ? 3 : 0} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} tickFormatter={(v) => `${v}h`} />
              <Tooltip formatter={(v) => `${v}h`} contentStyle={{ borderRadius: 8, borderColor: LINE, fontSize: 12 }} />
              <Bar dataKey="hours" fill={AMBER} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionLabel>Completion rate trend (14 days)</SectionLabel>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={LINE} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: MUTED }} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, borderColor: LINE, fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke={MOSS} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel>Busiest time of day</SectionLabel>
          <div className="text-xs mb-2" style={{ color: MUTED }}>
            Peak: <span className="font-semibold" style={{ color: INK }}>{peakHour.label}</span> ({fmtHrs(peakHour.minutes)} logged)
          </div>
          <div style={{ height: 170 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={busiestHour.filter((_, i) => i % 2 === 0)}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: MUTED }} interval={2} />
                <YAxis hide />
                <Tooltip formatter={(v) => fmtHrs(v)} contentStyle={{ borderRadius: 8, borderColor: LINE, fontSize: 12 }} />
                <Bar dataKey="minutes" fill={"#4C6B72"} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <SectionLabel>This week vs. last week</SectionLabel>
          <div className="text-xs" style={{ color: weekDelta === null ? MUTED : weekDelta >= 0 ? MOSS : CLAY }}>
            {weekDelta === null ? "—" : `${weekDelta >= 0 ? "+" : ""}${weekDelta.toFixed(0)}%`}
          </div>
        </div>
        <div className="text-xs mb-3" style={{ color: MUTED }}>
          {thisWeekTotal.toFixed(1)}h this week vs {lastWeekTotal.toFixed(1)}h last week
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke={LINE} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: MUTED }} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} tickFormatter={(v) => `${v}h`} />
              <Tooltip formatter={(v) => `${v}h`} contentStyle={{ borderRadius: 8, borderColor: LINE, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="lastWeek" name="Last week" fill={LINE} radius={[4, 4, 0, 0]} />
              <Bar dataKey="thisWeek" name="This week" fill={AMBER} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={15} style={{ color: CLAY }} />
          <SectionLabel>Overdue tasks — planned for a past date, still open</SectionLabel>
        </div>
        {overdueTasks.length === 0 ? (
          <EmptyNote text="Nothing overdue. Clean slate." />
        ) : (
          <div className="space-y-2">
            {overdueTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg" style={{ background: "#FBF1EF" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.catColor }} />
                  <span className="font-medium truncate">{t.name}</span>
                  <span className="text-xs shrink-0" style={{ color: MUTED }}>{t.catName} / {t.subName}</span>
                </div>
                <span className="text-xs shrink-0" style={{ color: CLAY }}>{fmtShort(t.date)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
