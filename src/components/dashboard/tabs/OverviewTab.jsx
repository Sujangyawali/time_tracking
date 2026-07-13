import React from "react";
import { Play, Square } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, SectionLabel, StatBlock, ProgressRing, EmptyNote, IconBtn } from "../shared";
import { fmtHrs } from "../../../lib/dateUtils";
import { AMBER, CLAY, INK, LINE, MOSS, MUTED, SURFACE } from "../../../styles/dashboardTheme";

export default function OverviewTab({
  totalMinutes, completedCount, remainingCount, completionPct, avgPerTask, idleMinutes, todayMinutes,
  categoryBreakdown, topThree, drilldownCatId, setDrilldownCatId, subBreakdown, categories, categoryCompletion,
  topFiveTasks, topTwoPerCategory, activeTimerTaskId, startTimer, stopTimer,
}) {
  const TimerBtn = ({ task }) =>
    activeTimerTaskId === task.id ? (
      <IconBtn title="Stop timer" danger onClick={stopTimer}><Square size={13} fill="currentColor" /></IconBtn>
    ) : (
      <IconBtn title="Start timer" onClick={() => startTimer(task.catId, task.subId, task.id)}><Play size={13} style={{ color: MOSS }} /></IconBtn>
    );
  const drilldownCat = categories.find((c) => c.id === drilldownCatId);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <StatBlock label="Time logged" value={fmtHrs(totalMinutes)} sub="selected period" accent={AMBER} />
        <StatBlock label="Tasks completed" value={`${completedCount}`} sub={`${remainingCount} remaining`} accent={MOSS} />
        <StatBlock label="Avg. time / task" value={fmtHrs(Math.round(avgPerTask))} sub="selected period" />
        <StatBlock label="Idle today" value={fmtHrs(idleMinutes)} sub={`of 24h · ${fmtHrs(todayMinutes)} tracked`} accent={idleMinutes > 720 ? CLAY : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 flex flex-col items-center justify-center">
          <SectionLabel>Completion rate</SectionLabel>
          <ProgressRing percent={completionPct} />
          <div className="text-xs mt-2" style={{ color: MUTED }}>{completedCount} of {completedCount + remainingCount} tasks done</div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionLabel>Time by category — click a slice to drill down</SectionLabel>
          {categoryBreakdown.length === 0 ? (
            <EmptyNote text="No time logged in this period yet." />
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown} dataKey="minutes" nameKey="name"
                    innerRadius={50} outerRadius={80} paddingAngle={2}
                    onClick={(d) => setDrilldownCatId(d.id === drilldownCatId ? null : d.id)}
                    cursor="pointer"
                  >
                    {categoryBreakdown.map((c) => (
                      <Cell key={c.id} fill={c.color} stroke={c.id === drilldownCatId ? INK : SURFACE} strokeWidth={c.id === drilldownCatId ? 2 : 1} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmtHrs(v)} contentStyle={{ borderRadius: 8, borderColor: LINE, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <SectionLabel>{drilldownCat ? `Sub-categories within ${drilldownCat.name}` : "Select a category above to drill into sub-categories"}</SectionLabel>
          {drilldownCat && (
            subBreakdown.length === 0 ? <EmptyNote text="No time logged for this category in the selected period." /> : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subBreakdown} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={LINE} horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 60)}h`} tick={{ fontSize: 11, fill: MUTED }} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: INK }} />
                    <Tooltip formatter={(v) => fmtHrs(v)} contentStyle={{ borderRadius: 8, borderColor: LINE, fontSize: 12 }} />
                    <Bar dataKey="minutes" fill={drilldownCat.color} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          )}
        </Card>

        <Card className="p-5">
          <SectionLabel>Top time-consumers</SectionLabel>
          <div className="space-y-3">
            {topThree.length === 0 && <EmptyNote text="Nothing logged yet." />}
            {topThree.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: c.color + "22", color: c.color }}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="h-1.5 rounded-full mt-1" style={{ background: LINE }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${(c.minutes / topThree[0].minutes) * 100}%`, background: c.color }} />
                  </div>
                </div>
                <div className="text-xs shrink-0" style={{ color: MUTED }}>{fmtHrs(c.minutes)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionLabel>Top 5 tasks by time spent</SectionLabel>
          {topFiveTasks.length === 0 ? <EmptyNote text="No time logged yet." /> : (
            <div className="space-y-3">
              {topFiveTasks.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0" style={{ background: t.catColor + "22", color: t.catColor }}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.name}</div>
                    <div className="text-[11px] truncate" style={{ color: MUTED }}>{t.catName}</div>
                  </div>
                  <div className="text-xs shrink-0" style={{ color: MUTED }}>{fmtHrs(t.minutes)}</div>
                  <TimerBtn task={t} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionLabel>Top 2 tasks per category</SectionLabel>
          {topTwoPerCategory.length === 0 ? <EmptyNote text="No time logged yet." /> : (
            <div className="space-y-4">
              {topTwoPerCategory.map((g) => (
                <div key={g.catId}>
                  <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: g.catColor }} />{g.catName}
                  </div>
                  <div className="space-y-1.5 ml-3.5">
                    {g.tasks.map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-sm">
                        <span className="truncate mr-2" style={{ color: INK }}>{t.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs" style={{ color: MUTED }}>{fmtHrs(t.minutes)}</span>
                          <TimerBtn task={t} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <SectionLabel>Category-wise completion rate</SectionLabel>
        {categoryCompletion.length === 0 && <EmptyNote text="No tasks in this period." />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryCompletion.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: c.color }} />{c.name}</span>
                <span className="text-xs" style={{ color: MUTED }}>{c.pct}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: LINE }}>
                <div className="h-2 rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
              </div>
              <div className="text-[11px] mt-1" style={{ color: MUTED }}>{c.done} of {c.total} tasks</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
