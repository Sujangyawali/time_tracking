const pad = (n) => String(n).padStart(2, "0");

export const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayDate = new Date();
export const TODAY = toDateStr(todayDate);

export const daysAgo = (n) => {
  const d = new Date(todayDate);
  d.setDate(d.getDate() - n);
  return d;
};

export const daysAgoStr = (n) => toDateStr(daysAgo(n));

export const fmtShort = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const fmtHrs = (mins) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const dowMonday = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};
