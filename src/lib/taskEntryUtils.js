export function upsertTimeEntry(task, duration, timestamp = new Date().toISOString(), buildId = null) {
  const minutes = Number(duration);
  if (!Number.isFinite(minutes) || minutes <= 0) return task;

  const nextEntries = [...(task.entries || [])];
  const nextStatus = task.status === "Pending" ? "In Progress" : task.status;

  if (nextEntries.length === 0) {
    nextEntries.push({
      id: buildId ? buildId("e") : `e_${Date.now()}`,
      duration: minutes,
      timestamp,
    });
  } else {
    const lastIndex = nextEntries.length - 1;
    nextEntries[lastIndex] = {
      ...nextEntries[lastIndex],
      duration: minutes,
      timestamp,
    };
  }

  return {
    ...task,
    entries: nextEntries,
    status: nextStatus,
  };
}
