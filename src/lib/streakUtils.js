import { TODAY, addDays } from "./dateUtils";

const MAX_WINDOW_DAYS = 90;
const MIN_OCCURRENCES_TO_SHOW = 7;

export function buildStreakSeries(flatTasks, retentionDays, groupBy = "task") {
  const windowDays = Math.min(retentionDays || MAX_WINDOW_DAYS, MAX_WINDOW_DAYS);
  const windowStart = addDays(TODAY, -(windowDays - 1));

  // "task" groups by exact task name within a subcategory (current behavior);
  // "subcategory" groups by subcategory alone, so a day counts as filled if
  // ANY task in that subcategory was completed that day, regardless of which one.
  const groups = new Map();
  for (const t of flatTasks) {
    const key = groupBy === "subcategory" ? t.subId : `${t.subId}::${t.name}`;
    if (!groups.has(key)) {
      groups.set(key, {
        subId: t.subId,
        name: groupBy === "subcategory" ? t.subName : t.name,
        catId: t.catId,
        catName: t.catName,
        catColor: t.catColor,
        subName: t.subName,
        level: groupBy === "subcategory" ? "subcategory" : "task",
        occurrences: [],
      });
    }
    groups.get(key).occurrences.push({ date: t.date, status: t.status });
  }

  const series = [];
  for (const group of groups.values()) {
    const distinctDates = new Set(group.occurrences.map((o) => o.date));
    if (distinctDates.size < MIN_OCCURRENCES_TO_SHOW) continue;

    const earliestDate = [...distinctDates].sort()[0];
    const startDate = earliestDate > windowStart ? earliestDate : windowStart;

    const completedDates = new Set(
      group.occurrences.filter((o) => o.status === "Completed").map((o) => o.date)
    );

    // A day with no occurrence at all counts as empty too — same as an
    // incomplete one — so a forgotten "duplicate for tomorrow" breaks the chain.
    const timeline = [];
    for (let d = startDate; d <= TODAY; d = addDays(d, 1)) {
      timeline.push({ date: d, filled: completedDates.has(d) });
    }

    // currentStreak walks backward from today. If today has no completion yet,
    // anchor at yesterday instead of zeroing immediately — a user who completed
    // through yesterday shouldn't see their streak reset before they've even
    // had a chance to touch today's occurrence. A genuine 2-day gap still zeroes it.
    let anchorIndex = timeline.length - 1;
    if (!timeline[anchorIndex].filled) {
      anchorIndex -= 1;
      if (anchorIndex < 0 || !timeline[anchorIndex].filled) anchorIndex = -1;
    }
    let currentStreak = 0;
    for (let i = anchorIndex; i >= 0 && timeline[i].filled; i--) currentStreak++;

    // longestStreak is a plain historical max — no grace period.
    let longestStreak = 0;
    let run = 0;
    for (const day of timeline) {
      run = day.filled ? run + 1 : 0;
      if (run > longestStreak) longestStreak = run;
    }

    series.push({
      subId: group.subId,
      name: group.name,
      catId: group.catId,
      catName: group.catName,
      catColor: group.catColor,
      subName: group.subName,
      level: group.level,
      timeline,
      currentStreak,
      longestStreak,
      totalCompletions: completedDates.size,
    });
  }

  series.sort((a, b) => b.currentStreak - a.currentStreak || b.longestStreak - a.longestStreak);
  return series;
}
