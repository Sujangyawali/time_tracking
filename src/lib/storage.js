export const DASHBOARD_STORAGE_KEY = "time-tracker:categories:v1";
export const EVENTS_STORAGE_KEY = "time-tracker:events:v1";
export const TIMER_STORAGE_KEY = "time-tracker:active-timer:v1";
export const SETTINGS_STORAGE_KEY = "time-tracker:settings:v1";

export const DEFAULT_SETTINGS = {
  retentionDays: 90,
  timezone: "Asia/Kathmandu",
  lastActiveTab: "overview",
  theme: "light",
};

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

export function readEvents() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeEvents(events) {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch {
    return false;
  }
}

export function readActiveTimer() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeActiveTimer(timer) {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    if (timer) {
      window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
    } else {
      window.localStorage.removeItem(TIMER_STORAGE_KEY);
    }
    return true;
  } catch {
    return false;
  }
}

export function readSettings() {
  if (typeof window === "undefined" || !window.localStorage) return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return { ...DEFAULT_SETTINGS, ...(parsed || {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function writeSettings(settings) {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
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
