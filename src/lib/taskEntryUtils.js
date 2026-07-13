export function addTaskTimeEntry(task, duration, timestamp = new Date().toISOString(), buildId = null) {
  const minutes = Number(duration);
  if (!Number.isFinite(minutes) || minutes <= 0) return task;

  const nextEntries = [...(task.entries || [])];
  const nextStatus = task.status === "Pending" ? "In Progress" : task.status;

  nextEntries.push({
    id: buildId ? buildId("e") : `e_${Date.now()}`,
    duration: minutes,
    timestamp,
  });

  return {
    ...task,
    entries: nextEntries,
    status: nextStatus,
  };
}

export const TIMER_STALE_HOURS = 6;

export function computeElapsedMinutes(startedAt, nowMs = Date.now()) {
  const elapsedMs = nowMs - new Date(startedAt).getTime();
  return Math.max(0, elapsedMs / 60000);
}

export function isTimerStale(startedAt, nowMs = Date.now(), maxHours = TIMER_STALE_HOURS) {
  return computeElapsedMinutes(startedAt, nowMs) > maxHours * 60;
}
