export const DASHBOARD_STORAGE_KEY = "time-tracker:categories:v1";

export function readDashboardData() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeDashboardData(data) {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function exportDashboardData(data, filename = "time-tracking-data.json") {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importDashboardData(file) {
  const text = await file.text();
  return JSON.parse(text);
}
