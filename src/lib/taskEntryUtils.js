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
