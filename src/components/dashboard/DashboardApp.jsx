import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight, Timer, Folder, X, Check, Play, Clock, AlertTriangle } from "lucide-react";
import OverviewTab from "./tabs/OverviewTab";
import TasksTab from "./tabs/TasksTab";
import EventsTab from "./tabs/EventsTab";
import TrendsTab from "./tabs/TrendsTab";
import SettingsTab from "./tabs/SettingsTab";
import StreaksTab from "./tabs/StreaksTab";
import TimerIndicator from "./TimerIndicator";
import ThemeToggle from "./ThemeToggle";
import { buildDemoDataFinal } from "../../data/demoData";
import { addDays, daysAgo, daysAgoStr, dowMonday, fmtHrs, fmtShort, TODAY, toDateStr } from "../../lib/dateUtils";
import { exportDashboardData, importDashboardData, readDashboardData, writeDashboardData, DASHBOARD_STORAGE_KEY, readEvents, writeEvents, readActiveTimer, writeActiveTimer } from "../../lib/storage";
import { AMBER, CLAY, INK, LINE, MUTED, PALETTE, PAPER, SURFACE, TINT } from "../../styles/dashboardTheme";
import { Card, IconBtn, PrimaryBtn, SectionLabel, TinyInput } from "./shared";
import { addTaskTimeEntry, computeElapsedMinutes, isTimerStale } from "../../lib/taskEntryUtils";
import { buildStreakSeries } from "../../lib/streakUtils";
import { useSettings } from "../../hooks/useSettings";

const SIDEBAR_WIDTH_KEY = "time-tracker:sidebar-width";
const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 480;

function normalizeCategoryColors(cats) {
  const used = new Set();
  return cats.map((cat, index) => {
    let color = cat.color;
    if (!color || used.has(color)) {
      color = PALETTE.find((candidate) => !used.has(candidate)) || PALETTE[index % PALETTE.length];
    }
    used.add(color);
    return { ...cat, color };
  });
}

function pruneOldData(cats, retentionDays) {
  const cutoff = daysAgoStr(retentionDays);
  return normalizeCategoryColors(cats).map((c) => ({
    ...c,
    subcategories: c.subcategories.map((s) => ({
      ...s,
      tasks: s.tasks
        .filter((t) => t.date >= cutoff)
        .map((t) => ({ ...t, entries: t.entries.filter((e) => e.timestamp.slice(0, 10) >= cutoff) })),
    })),
  }));
}

function buildId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function DashboardApp() {
  const [categories, setCategories] = useState(null);
  const [storageReady, setStorageReady] = useState(false);
  const { settings, updateSetting } = useSettings();
  const [activeTab, setActiveTab] = useState(() => settings.lastActiveTab);
  const [dateFilter, setDateFilter] = useState("today");
  const [customStartDate, setCustomStartDate] = useState(TODAY);
  const [customEndDate, setCustomEndDate] = useState(TODAY);
  const [drilldownCatId, setDrilldownCatId] = useState(null);
  const [trendRange, setTrendRange] = useState(30);
  const [expanded, setExpanded] = useState({});
  const [newCatName, setNewCatName] = useState("");
  const [addingSubFor, setAddingSubFor] = useState(null);
  const [newSubName, setNewSubName] = useState("");
  const [editing, setEditing] = useState(null);
  const [logEntryFor, setLogEntryFor] = useState(null);
  const [logHours, setLogHours] = useState("");
  const [logDuration, setLogDuration] = useState("");
  const [taskForm, setTaskForm] = useState(null);
  const [taskFilterCat, setTaskFilterCat] = useState([]);
  const [taskFilterStatus, setTaskFilterStatus] = useState([]);
  const [taskDateFilter, setTaskDateFilter] = useState("today");
  const [taskStartDate, setTaskStartDate] = useState(TODAY);
  const [taskEndDate, setTaskEndDate] = useState(TODAY);
  const [nepalTime, setNepalTime] = useState(new Date());
  const [events, setEvents] = useState(() => readEvents() || []);
  const [eventForm, setEventForm] = useState(null);
  const [activeTimer, setActiveTimer] = useState(() => readActiveTimer());
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = Number(window.localStorage?.getItem(SIDEBAR_WIDTH_KEY));
    return saved >= SIDEBAR_MIN_WIDTH && saved <= SIDEBAR_MAX_WIDTH ? saved : 300;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [toast, setToast] = useState(null);
  const saveTimer = useRef(null);
  const fileInputRef = useRef(null);
  const sidebarContainerRef = useRef(null);
  const toastTimer = useRef(null);

  const showToast = (message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: buildId("toast"), message });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    let cancelled = false;
    const stored = readDashboardData();
    if (stored) {
      if (!cancelled) setCategories(pruneOldData(stored, settings.retentionDays));
    } else {
      if (!cancelled) setCategories([]);
    }
    if (!cancelled) setStorageReady(true);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageReady || categories === null) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      writeDashboardData(pruneOldData(categories, settings.retentionDays));
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [categories, storageReady, settings.retentionDays]);

  useEffect(() => {
    writeEvents(events);
  }, [events]);

  useEffect(() => {
    writeActiveTimer(activeTimer);
  }, [activeTimer]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    if (!storageReady || !activeTimer) return;
    const task = findTask(activeTimer.catId, activeTimer.subId, activeTimer.taskId);
    if (!task) {
      setActiveTimer(null);
      showToast("Timer stopped — task no longer exists");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageReady]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNepalTime(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isResizingSidebar) return;
    const handleMouseMove = (e) => {
      const rect = sidebarContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const next = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, e.clientX - rect.left));
      setSidebarWidth(next);
    };
    const handleMouseUp = () => setIsResizingSidebar(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingSidebar]);

  useEffect(() => {
    window.localStorage?.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  const updateCategories = (fn) => setCategories((prev) => fn(JSON.parse(JSON.stringify(prev))));

  const findTask = (catId, subId, taskId) =>
    (categories || []).find((c) => c.id === catId)?.subcategories.find((s) => s.id === subId)?.tasks.find((t) => t.id === taskId);

  const upsertEvent = (form) => {
    if (!form.name.trim() || !form.date) return;
    setEvents((prev) => {
      if (form.editingEventId) {
        return prev.map((ev) => (ev.id === form.editingEventId ? { ...ev, name: form.name.trim(), description: form.description.trim(), date: form.date } : ev));
      }
      return [...prev, { id: buildId("ev"), name: form.name.trim(), description: form.description.trim(), date: form.date }];
    });
    setEventForm(null);
  };

  const deleteEvent = (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    updateCategories((cats) => {
      const usedColors = new Set(cats.map((cat) => cat.color));
      const nextColor = PALETTE.find((color) => !usedColors.has(color)) || PALETTE[cats.length % PALETTE.length];
      cats.push({ id: buildId("c"), name: newCatName.trim(), color: nextColor, subcategories: [] });
      return cats;
    });
    setNewCatName("");
  };

  const deleteCategory = (catId) => {
    updateCategories((cats) => cats.filter((c) => c.id !== catId));
    if (drilldownCatId === catId) setDrilldownCatId(null);
    if (activeTimer?.catId === catId) {
      setActiveTimer(null);
      showToast("Timer stopped — task was deleted");
    }
  };

  const renameCategory = (catId, name) => {
    updateCategories((cats) => {
      const c = cats.find((item) => item.id === catId);
      if (c) c.name = name;
      return cats;
    });
  };

  const addSubcategory = (catId) => {
    if (!newSubName.trim()) return;
    updateCategories((cats) => {
      const c = cats.find((item) => item.id === catId);
      if (c) c.subcategories.push({ id: buildId("s"), name: newSubName.trim(), tasks: [] });
      return cats;
    });
    setNewSubName("");
    setAddingSubFor(null);
  };

  const deleteSubcategory = (catId, subId) => {
    updateCategories((cats) => {
      const c = cats.find((item) => item.id === catId);
      if (c) c.subcategories = c.subcategories.filter((s) => s.id !== subId);
      return cats;
    });
    if (activeTimer?.catId === catId && activeTimer?.subId === subId) {
      setActiveTimer(null);
      showToast("Timer stopped — task was deleted");
    }
  };

  const renameSubcategory = (catId, subId, name) => {
    updateCategories((cats) => {
      const s = cats.find((item) => item.id === catId)?.subcategories.find((item) => item.id === subId);
      if (s) s.name = name;
      return cats;
    });
  };

  const upsertTask = (form) => {
    updateCategories((cats) => {
      const c = cats.find((item) => item.id === form.catId);
      const s = c?.subcategories.find((item) => item.id === form.subId);
      if (!s) return cats;
      if (form.editingTaskId) {
        const t = s.tasks.find((item) => item.id === form.editingTaskId);
        if (t) {
          t.name = form.name;
          t.estMinutes = Number(form.est) || 0;
          t.date = form.date;
          t.description = form.description || "";
        }
      } else {
        s.tasks.push({ id: buildId("t"), name: form.name, estMinutes: Number(form.est) || 0, status: "Pending", date: form.date, description: form.description || "", entries: [] });
      }
      return cats;
    });
    setTaskForm(null);
  };

  const deleteTask = (catId, subId, taskId) => {
    updateCategories((cats) => {
      const s = cats.find((item) => item.id === catId)?.subcategories.find((item) => item.id === subId);
      if (s) s.tasks = s.tasks.filter((t) => t.id !== taskId);
      return cats;
    });
    if (activeTimer?.taskId === taskId) {
      setActiveTimer(null);
      showToast("Timer stopped — task was deleted");
    }
  };

  const duplicateTask = (catId, subId, taskId) => {
    const sourceTask = categories.find((item) => item.id === catId)?.subcategories.find((item) => item.id === subId)?.tasks.find((item) => item.id === taskId);
    if (!sourceTask) return;
    updateCategories((cats) => {
      const s = cats.find((item) => item.id === catId)?.subcategories.find((item) => item.id === subId);
      const taskToCopy = s?.tasks.find((item) => item.id === taskId);
      if (!s || !taskToCopy) return cats;

      s.tasks.push({
        ...taskToCopy,
        id: buildId("t"),
        date: addDays(taskToCopy.date, 1),
        status: "Pending",
        entries: [],
      });
      return cats;
    });
    showToast(`"${sourceTask.name}" added for tomorrow`);
  };

  const duplicateAllTasksForTomorrow = () => {
    const todaysCount = flatTasks.filter((t) => t.date === TODAY).length;
    if (todaysCount === 0) {
      showToast("No tasks today to duplicate");
      return;
    }
    if (!window.confirm(`Duplicate all ${todaysCount} of today's tasks to tomorrow?`)) return;
    updateCategories((cats) => {
      for (const c of cats) {
        for (const s of c.subcategories) {
          const toCopy = s.tasks.filter((t) => t.date === TODAY);
          for (const t of toCopy) {
            s.tasks.push({ ...t, id: buildId("t"), date: addDays(t.date, 1), status: "Pending", entries: [] });
          }
        }
      }
      return cats;
    });
    showToast(`${todaysCount} task${todaysCount > 1 ? "s" : ""} duplicated for tomorrow`);
  };

  const setTaskStatus = (catId, subId, taskId, status) => {
    updateCategories((cats) => {
      const t = cats.find((item) => item.id === catId)?.subcategories.find((item) => item.id === subId)?.tasks.find((item) => item.id === taskId);
      if (t) t.status = status;
      return cats;
    });
  };

  const addTimeEntry = (catId, subId, taskId, duration) => {
    if (!duration || Number(duration) <= 0) return;
    updateCategories((cats) => {
      const t = cats.find((item) => item.id === catId)?.subcategories.find((item) => item.id === subId)?.tasks.find((item) => item.id === taskId);
      if (t) {
        const updatedTask = addTaskTimeEntry(t, Number(duration), new Date().toISOString(), buildId);
        Object.assign(t, updatedTask);
        if (t.status === "Pending") t.status = "In Progress";
      }
      return cats;
    });
    setLogHours("");
    setLogDuration("");
    setLogEntryFor(null);
  };

  const deleteEntry = (catId, subId, taskId, entryId) => {
    updateCategories((cats) => {
      const t = cats.find((item) => item.id === catId)?.subcategories.find((item) => item.id === subId)?.tasks.find((item) => item.id === taskId);
      if (t) t.entries = t.entries.filter((e) => e.id !== entryId);
      return cats;
    });
  };

  const finalizeTimer = (timer) => {
    if (!timer) return;
    const task = findTask(timer.catId, timer.subId, timer.taskId);
    if (!task) return;

    let minutes = Math.max(1, Math.round(computeElapsedMinutes(timer.startedAt)));

    if (isTimerStale(timer.startedAt)) {
      const input = window.prompt(
        `"${task.name}" has been timing for ${fmtHrs(minutes)}. Enter minutes to log (or Cancel to discard this timer):`,
        String(minutes)
      );
      if (input === null) return;
      const parsed = Number(input);
      if (!Number.isFinite(parsed) || parsed <= 0) return;
      minutes = parsed;
    }

    addTimeEntry(timer.catId, timer.subId, timer.taskId, minutes);
  };

  const startTimer = (catId, subId, taskId) => {
    if (activeTimer?.taskId === taskId) return;
    if (activeTimer) finalizeTimer(activeTimer);
    const task = findTask(catId, subId, taskId);
    if (!task) return;
    setActiveTimer({ catId, subId, taskId, taskName: task.name, startedAt: new Date().toISOString() });
  };

  const stopTimer = () => {
    finalizeTimer(activeTimer);
    setActiveTimer(null);
  };

  const loadDemoData = () => {
    if (!window.confirm("Load the sample demo dataset? This will replace your current data.")) return;
    const fresh = buildDemoDataFinal();
    setCategories(fresh);
    writeDashboardData(fresh);
    setDrilldownCatId(null);
    setTaskForm(null);
    changeTab("overview");
    setDateFilter("today");
  };

  const resetData = () => {
    if (!window.confirm("Clear all tracked data and start fresh from today? This cannot be undone.")) return;
    setCategories([]);
    writeDashboardData([]);
    setEvents([]);
    writeEvents([]);
    setDrilldownCatId(null);
    setTaskForm(null);
    changeTab("overview");
    setDateFilter("today");
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await importDashboardData(file);
      const importedCategories = pruneOldData(Array.isArray(data) ? data : data?.categories || [], settings.retentionDays);
      const importedEvents = Array.isArray(data) ? [] : data?.events || [];
      setCategories(importedCategories);
      writeDashboardData(importedCategories);
      setEvents(importedEvents);
      writeEvents(importedEvents);
    } catch {
      alert("Could not import the selected JSON file.");
    } finally {
      event.target.value = "";
    }
  };

  const flatTasks = useMemo(() => {
    const out = [];
    for (const c of categories || []) for (const s of c.subcategories) for (const t of s.tasks) {
      out.push({ ...t, catId: c.id, catName: c.name, catColor: c.color, subId: s.id, subName: s.name });
    }
    return out;
  }, [categories]);

  const flatEntries = useMemo(() => {
    const out = [];
    for (const t of flatTasks) for (const e of t.entries) {
      out.push({ ...e, catId: t.catId, catName: t.catName, catColor: t.catColor, subId: t.subId, subName: t.subName, taskId: t.id, taskName: t.name, taskStatus: t.status });
    }
    return out;
  }, [flatTasks]);

  const streakSeries = useMemo(
    () => buildStreakSeries(flatTasks, settings.retentionDays),
    [flatTasks, settings.retentionDays]
  );

  const filterBounds = (filter) => {
    if (filter === "today") return { start: TODAY, end: TODAY };
    if (filter === "7d") return { start: daysAgoStr(6), end: TODAY };
    if (filter === "30d") return { start: daysAgoStr(29), end: TODAY };
    if (filter === "custom") return { start: customStartDate || TODAY, end: customEndDate || TODAY };
    return { start: "0000-01-01", end: "9999-12-31" };
  };

  const inRange = (dateStr, start, end) => dateStr >= start && dateStr <= end;
  const { start: fStart, end: fEnd } = filterBounds(dateFilter);
  const filteredEntries = useMemo(() => flatEntries.filter((e) => inRange(e.timestamp.slice(0, 10), fStart, fEnd)), [flatEntries, fStart, fEnd]);
  const filteredTasks = useMemo(() => flatTasks.filter((t) => inRange(t.date, fStart, fEnd)), [flatTasks, fStart, fEnd]);

  const totalMinutes = filteredEntries.reduce((s, e) => s + e.duration, 0);
  const completedCount = filteredTasks.filter((t) => t.status === "Completed").length;
  const remainingCount = filteredTasks.length - completedCount;
  const completionPct = filteredTasks.length ? (completedCount / filteredTasks.length) * 100 : 0;
  const avgPerTask = filteredTasks.length ? (filteredTasks.reduce((s, t) => s + t.entries.reduce((a, e) => a + e.duration, 0), 0) / filteredTasks.length) : 0;
  const todayMinutes = flatEntries.filter((e) => e.timestamp.slice(0, 10) === TODAY).reduce((s, e) => s + e.duration, 0);
  const idleMinutes = Math.max(0, 1440 - todayMinutes);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    for (const e of filteredEntries) {
      map[e.catId] = map[e.catId] || { id: e.catId, name: e.catName, color: e.catColor, minutes: 0 };
      map[e.catId].minutes += e.duration;
    }
    return Object.values(map).sort((a, b) => b.minutes - a.minutes);
  }, [filteredEntries]);

  const topThree = categoryBreakdown.slice(0, 3);
  const taskBreakdown = useMemo(() => {
    const map = {};
    for (const e of filteredEntries) {
      map[e.taskId] = map[e.taskId] || { id: e.taskId, name: e.taskName, catId: e.catId, catName: e.catName, catColor: e.catColor, subId: e.subId, minutes: 0 };
      map[e.taskId].minutes += e.duration;
    }
    return Object.values(map).sort((a, b) => b.minutes - a.minutes);
  }, [filteredEntries]);

  const topFiveTasks = taskBreakdown.slice(0, 5);
  const topTwoPerCategory = useMemo(() => {
    const byCat = {};
    for (const t of taskBreakdown) {
      byCat[t.catId] = byCat[t.catId] || [];
      if (byCat[t.catId].length < 2) byCat[t.catId].push(t);
    }
    return (categories || [])
      .map((c) => ({ catId: c.id, catName: c.name, catColor: c.color, tasks: byCat[c.id] || [] }))
      .filter((g) => g.tasks.length > 0);
  }, [taskBreakdown, categories]);

  const estVsActualByCategory = useMemo(() => {
    const map = {};
    for (const t of filteredTasks) {
      map[t.catId] = map[t.catId] || { name: t.catName, color: t.catColor, est: 0, actual: 0 };
      map[t.catId].est += t.estMinutes;
      map[t.catId].actual += t.entries.reduce((s, e) => s + e.duration, 0);
    }
    return Object.values(map).map((c) => ({ ...c, estHrs: +(c.est / 60).toFixed(2), actualHrs: +(c.actual / 60).toFixed(2) }));
  }, [filteredTasks]);

  const estVsActualTasks = useMemo(() => filteredTasks
    .map((t) => {
      const actual = t.entries.reduce((s, e) => s + e.duration, 0);
      const variance = t.estMinutes > 0 ? ((actual - t.estMinutes) / t.estMinutes) * 100 : (actual > 0 ? 100 : 0);
      return { ...t, actual, variance };
    })
    .filter((t) => t.entries.length > 0 && t.estMinutes > 0)
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 8), [filteredTasks]);

  const subBreakdown = useMemo(() => {
    if (!drilldownCatId) return [];
    const map = {};
    for (const e of filteredEntries.filter((e) => e.catId === drilldownCatId)) {
      map[e.subId] = map[e.subId] || { name: e.subName, minutes: 0 };
      map[e.subId].minutes += e.duration;
    }
    return Object.values(map).sort((a, b) => b.minutes - a.minutes);
  }, [filteredEntries, drilldownCatId]);

  const trendData = useMemo(() => {
    const days = [];
    for (let i = trendRange - 1; i >= 0; i--) {
      const ds = daysAgoStr(i);
      const mins = flatEntries.filter((e) => e.timestamp.slice(0, 10) === ds).reduce((s, e) => s + e.duration, 0);
      days.push({ date: ds, label: fmtShort(ds), hours: +(mins / 60).toFixed(2) });
    }
    return days;
  }, [flatEntries, trendRange]);

  const completionTrend = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const ds = daysAgoStr(i);
      const dayTasks = flatTasks.filter((t) => t.date === ds);
      const rate = dayTasks.length ? (dayTasks.filter((t) => t.status === "Completed").length / dayTasks.length) * 100 : null;
      days.push({ label: fmtShort(ds), rate: rate === null ? 0 : Math.round(rate) });
    }
    return days;
  }, [flatTasks]);

  const categoryCompletion = useMemo(() => (categories || []).map((c) => {
    const tasks = filteredTasks.filter((t) => t.catId === c.id);
    const done = tasks.filter((t) => t.status === "Completed").length;
    return { name: c.name, color: c.color, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0, total: tasks.length, done };
  }).filter((c) => c.total > 0), [categories, filteredTasks]);

  const busiestHour = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, label: h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`, minutes: 0 }));
    for (const e of filteredEntries) {
      const h = new Date(e.timestamp).getHours();
      buckets[h].minutes += e.duration;
    }
    return buckets;
  }, [filteredEntries]);
  const peakHour = busiestHour.reduce((a, b) => (b.minutes > a.minutes ? b : a), busiestHour[0]);

  const overdueTasks = useMemo(() => flatTasks.filter((t) => t.date < TODAY && t.status !== "Completed").sort((a, b) => a.date.localeCompare(b.date)), [flatTasks]);

  const weeklyComparison = useMemo(() => {
    const thisWeekStart = dowMonday(TODAY);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return dayNames.map((label, i) => {
      const tDate = new Date(thisWeekStart);
      tDate.setDate(tDate.getDate() + i);
      const lDate = new Date(lastWeekStart);
      lDate.setDate(lDate.getDate() + i);
      const tStr = toDateStr(tDate);
      const lStr = toDateStr(lDate);
      const thisWeek = flatEntries.filter((e) => e.timestamp.slice(0, 10) === tStr).reduce((s, e) => s + e.duration, 0) / 60;
      const lastWeek = flatEntries.filter((e) => e.timestamp.slice(0, 10) === lStr).reduce((s, e) => s + e.duration, 0) / 60;
      return { label, thisWeek: +thisWeek.toFixed(2), lastWeek: +lastWeek.toFixed(2) };
    });
  }, [flatEntries]);

  const thisWeekTotal = weeklyComparison.reduce((s, d) => s + d.thisWeek, 0);
  const lastWeekTotal = weeklyComparison.reduce((s, d) => s + d.lastWeek, 0);
  const weekDelta = lastWeekTotal === 0 ? null : ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;

  const toggleExpand = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const changeTab = (tab) => {
    setActiveTab(tab);
    updateSetting("lastActiveTab", tab);
  };

  const toggleTheme = () => updateSetting("theme", settings.theme === "dark" ? "light" : "dark");

  const runningTask = activeTimer ? findTask(activeTimer.catId, activeTimer.subId, activeTimer.taskId) : null;

  const nepalTimeLabel = useMemo(() => {
    let formatter;
    try {
      formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: settings.timezone,
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    const parts = formatter.formatToParts(nepalTime);
    const hour = parts.find((p) => p.type === "hour")?.value || "";
    const minute = parts.find((p) => p.type === "minute")?.value || "";
    const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value || "";
    return `${parts.find((p) => p.type === "weekday")?.value || ""} ${parts.find((p) => p.type === "day")?.value || ""} ${parts.find((p) => p.type === "month")?.value || ""} ${hour}:${minute} ${dayPeriod.toUpperCase()}`;
  }, [nepalTime, settings.timezone]);

  if (categories === null) {
    return (
      <div style={{ background: PAPER, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
          <Timer size={16} style={{ color: AMBER }} className="animate-pulse" />
          Loading your ledger…
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: PAPER, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .mono-num { font-family: 'IBM Plex Mono', monospace; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${LINE}; border-radius: 4px; }
        @keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toast-out { from { opacity: 1; } to { opacity: 0; } }
      `}</style>

      <div ref={sidebarContainerRef} className="flex flex-col lg:flex-row max-w-[1400px] mx-auto">
        <aside className="lg:w-[300px] shrink-0 border-b lg:border-b-0 lg:border-r p-5" style={{ borderColor: LINE, "--sidebar-w": `${sidebarWidth}px` }}>
          <div className="flex items-baseline gap-2 mb-1">
            <Timer size={20} style={{ color: AMBER }} />
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 21 }}>Ledger</h1>
          </div>
          <p className="text-xs mb-5" style={{ color: MUTED }}>Daily time-tracking index</p>

          <SectionLabel>Categories</SectionLabel>
          <div className="space-y-1">
            {categories.map((cat) => (
              <div key={cat.id} className="mb-2">
                <div className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 cursor-pointer" style={{ background: drilldownCatId === cat.id ? TINT : "transparent" }} onClick={() => setDrilldownCatId(cat.id === drilldownCatId ? null : cat.id)}>
                  <button onClick={(e) => { e.stopPropagation(); toggleExpand(cat.id); }} className="p-0.5" style={{ color: MUTED }}>
                    {expanded[cat.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                  {editing?.type === "cat" && editing.id === cat.id ? (
                    <input autoFocus value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { renameCategory(cat.id, editing.value); setEditing(null); } if (e.key === "Escape") setEditing(null); }} onClick={(e) => e.stopPropagation()} className="text-sm flex-1 border-b outline-none bg-transparent" style={{ borderColor: AMBER }} />
                  ) : (
                    <span className="text-sm font-medium flex-1 truncate">{cat.name}</span>
                  )}
                  <span className="text-[11px] mono-num opacity-0 group-hover:opacity-100" style={{ color: MUTED }}>{fmtHrs(flatEntries.filter((e) => e.catId === cat.id).reduce((s, e) => s + e.duration, 0))}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex">
                    <IconBtn title="Rename" onClick={(e) => { e.stopPropagation(); setEditing({ type: "cat", id: cat.id, value: cat.name }); }}><Pencil size={13} /></IconBtn>
                    <IconBtn title="Delete" danger onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}><Trash2 size={13} /></IconBtn>
                  </div>
                </div>

                {expanded[cat.id] && (
                  <div className="ml-5 pl-3 border-l space-y-1 mt-1" style={{ borderColor: LINE }}>
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id} className="group flex items-center gap-1.5 rounded-lg px-2 py-1">
                        <Folder size={12} style={{ color: MUTED }} />
                        {editing?.type === "sub" && editing.id === sub.id ? (
                          <input autoFocus value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { renameSubcategory(cat.id, sub.id, editing.value); setEditing(null); } if (e.key === "Escape") setEditing(null); }} className="text-[13px] flex-1 border-b outline-none bg-transparent" style={{ borderColor: AMBER }} />
                        ) : (
                          <span className="text-[13px] flex-1 truncate" style={{ color: INK }}>{sub.name}</span>
                        )}
                        <span className="text-[10px] mono-num" style={{ color: MUTED }}>{sub.tasks.length}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex">
                          <IconBtn title="Rename" onClick={() => setEditing({ type: "sub", id: sub.id, value: sub.name })}><Pencil size={12} /></IconBtn>
                          <IconBtn title="Delete" danger onClick={() => deleteSubcategory(cat.id, sub.id)}><Trash2 size={12} /></IconBtn>
                        </div>
                      </div>
                    ))}

                    {addingSubFor === cat.id ? (
                      <div className="flex items-center gap-1 px-2 py-1">
                        <TinyInput autoFocus value={newSubName} placeholder="Sub-category name" onChange={(e) => setNewSubName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addSubcategory(cat.id); if (e.key === "Escape") setAddingSubFor(null); }} className="text-xs flex-1 py-1" />
                        <IconBtn onClick={() => addSubcategory(cat.id)}><Check size={13} /></IconBtn>
                        <IconBtn onClick={() => setAddingSubFor(null)}><X size={13} /></IconBtn>
                      </div>
                    ) : (
                      <button onClick={() => { setAddingSubFor(cat.id); setNewSubName(""); }} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-black/5" style={{ color: MUTED }}><Plus size={12} /> Sub-category</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 mt-3">
            <TinyInput value={newCatName} placeholder="New category" onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory()} className="text-sm flex-1" />
            <PrimaryBtn onClick={addCategory} style={{ background: AMBER, padding: "7px 10px" }}><Plus size={14} /></PrimaryBtn>
          </div>

          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
          <p className="text-[11px] mt-4 text-center" style={{ color: MUTED }}>Autosaved as JSON in local browser storage · see Settings for export/import</p>
        </aside>

        <div
          className={`resize-handle${isResizingSidebar ? " is-resizing" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizingSidebar(true);
          }}
          onDoubleClick={() => setSidebarWidth(300)}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          title="Drag to resize, double-click to reset"
        />

        <main className="flex-1 p-5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: TINT }}>
              {[['overview', 'Overview'], ['tasks', 'Tasks'], ['events', 'Events'], ['trends', 'Trends & Insights'], ['streaks', 'Streaks'], ['settings', 'Settings']].map(([k, label]) => (
                <button key={k} onClick={() => changeTab(k)} className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ background: activeTab === k ? SURFACE : "transparent", color: activeTab === k ? INK : MUTED }}>{label}</button>
              ))}
            </div>

              {activeTab === 'overview' && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex gap-1 p-1 rounded-xl" style={{ background: TINT }}>
                    {[['today', 'Today'], ['7d', '7 Days'], ['30d', '30 Days'], ['custom', 'Custom'], ['all', 'All']].map(([k, label]) => (
                      <button key={k} onClick={() => setDateFilter(k)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: dateFilter === k ? SURFACE : "transparent", color: dateFilter === k ? INK : MUTED }}>{label}</button>
                    ))}
                  </div>
                  {dateFilter === 'custom' && (
                    <div className="flex items-center gap-2">
                      <TinyInput type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="text-xs py-1" />
                      <span className="text-xs" style={{ color: MUTED }}>to</span>
                      <TinyInput type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="text-xs py-1" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeTimer && (
                <TimerIndicator
                  taskName={runningTask?.name || activeTimer.taskName}
                  startedAt={activeTimer.startedAt}
                  onStop={stopTimer}
                />
              )}
              <div className="text-sm font-medium" style={{ color: MUTED }}>
                <span style={{ color: INK }}>{nepalTimeLabel}</span>
              </div>
              <ThemeToggle theme={settings.theme} onToggle={toggleTheme} />
            </div>
          </div>

          {activeTab === "overview" && (
            <OverviewTab totalMinutes={totalMinutes} completedCount={completedCount} remainingCount={remainingCount} completionPct={completionPct} avgPerTask={avgPerTask} idleMinutes={idleMinutes} todayMinutes={todayMinutes} categoryBreakdown={categoryBreakdown} topThree={topThree} drilldownCatId={drilldownCatId} setDrilldownCatId={setDrilldownCatId} subBreakdown={subBreakdown} categories={categories} categoryCompletion={categoryCompletion} topFiveTasks={topFiveTasks} topTwoPerCategory={topTwoPerCategory} activeTimerTaskId={activeTimer?.taskId || null} startTimer={startTimer} stopTimer={stopTimer} />
          )}

          {activeTab === "tasks" && (
            <TasksTab categories={categories} flatTasks={flatTasks} taskForm={taskForm} setTaskForm={setTaskForm} upsertTask={upsertTask} deleteTask={deleteTask} duplicateTask={duplicateTask} duplicateAllTasksForTomorrow={duplicateAllTasksForTomorrow} setTaskStatus={setTaskStatus} logEntryFor={logEntryFor} setLogEntryFor={setLogEntryFor} logHours={logHours} setLogHours={setLogHours} logDuration={logDuration} setLogDuration={setLogDuration} addTimeEntry={addTimeEntry} deleteEntry={deleteEntry} taskFilterCat={taskFilterCat} setTaskFilterCat={setTaskFilterCat} taskFilterStatus={taskFilterStatus} setTaskFilterStatus={setTaskFilterStatus} taskDateFilter={taskDateFilter} setTaskDateFilter={setTaskDateFilter} taskStartDate={taskStartDate} setTaskStartDate={setTaskStartDate} taskEndDate={taskEndDate} setTaskEndDate={setTaskEndDate} expanded={expanded} toggleExpand={toggleExpand} activeTimerTaskId={activeTimer?.taskId || null} startTimer={startTimer} stopTimer={stopTimer} />
          )}

          {activeTab === "events" && (
            <EventsTab events={events} eventForm={eventForm} setEventForm={setEventForm} upsertEvent={upsertEvent} deleteEvent={deleteEvent} />
          )}

          {activeTab === "trends" && (
            <TrendsTab trendData={trendData} trendRange={trendRange} setTrendRange={setTrendRange} completionTrend={completionTrend} weeklyComparison={weeklyComparison} thisWeekTotal={thisWeekTotal} lastWeekTotal={lastWeekTotal} weekDelta={weekDelta} busiestHour={busiestHour} peakHour={peakHour} overdueTasks={overdueTasks} estVsActualByCategory={estVsActualByCategory} estVsActualTasks={estVsActualTasks} />
          )}

          {activeTab === "streaks" && (
            <StreaksTab streakSeries={streakSeries} />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              settings={settings}
              updateSetting={updateSetting}
              toggleTheme={toggleTheme}
              onExport={() => exportDashboardData({ categories, events })}
              onImportClick={() => fileInputRef.current?.click()}
              loadDemoData={loadDemoData}
              resetData={resetData}
            />
          )}
        </main>
      </div>

      {toast && (
        <div
          key={toast.id}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "#23241F",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            zIndex: 50,
            animation: "toast-in 0.2s ease, toast-out 0.2s ease 2.3s forwards",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
