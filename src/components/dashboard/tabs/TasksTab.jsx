import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight, X, Check, Clock, Play, Square, AlertTriangle, Copy, CopyPlus } from "lucide-react";
import { Card, SectionLabel, TinyInput, TinySelect, MultiSelect, PrimaryBtn, IconBtn } from "../shared";
import { addDays, fmtHrs, fmtShort, TODAY } from "../../../lib/dateUtils";
import { AMBER, CLAY, LINE, MOSS, MUTED, INK, TINT, TINT_SOFT } from "../../../styles/dashboardTheme";

function CopyDropdown({ renderTrigger, onCopyNextDay, onCopySpecificDay, nextDayLabel = "Copy for next day", specificDayLabel = "Copy for specific day…" }) {
  const [open, setOpen] = useState(false);
  const [pickingDate, setPickingDate] = useState(false);
  const [dateValue, setDateValue] = useState(TODAY);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setPickingDate(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const close = () => {
    setOpen(false);
    setPickingDate(false);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      {renderTrigger(() => setOpen((o) => !o))}
      {open && (
        <div className="absolute right-0 z-10 mt-1 min-w-[210px] rounded-lg border bg-white shadow-lg py-1" style={{ borderColor: LINE }}>
          {!pickingDate ? (
            <>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-black/[0.03]"
                onClick={() => { onCopyNextDay(); close(); }}
              >
                {nextDayLabel}
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-black/[0.03]"
                onClick={() => setPickingDate(true)}
              >
                {specificDayLabel}
              </button>
            </>
          ) : (
            <div className="px-2.5 py-2 flex items-center gap-1.5">
              <TinyInput type="date" autoFocus value={dateValue} onChange={(e) => setDateValue(e.target.value)} className="text-xs py-1 flex-1 min-w-0" />
              <IconBtn title="Confirm" onClick={() => { onCopySpecificDay(dateValue); close(); }}><Check size={14} /></IconBtn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TasksTab({
  categories, flatTasks, taskForm, setTaskForm, upsertTask, deleteTask, duplicateTask, duplicateTaskToDate, duplicateAllTasksForTomorrow, duplicateAllTasksToDate, setTaskStatus,
  logEntryFor, setLogEntryFor, logHours, setLogHours, logDuration, setLogDuration, addTimeEntry, deleteEntry,
  taskFilterCat, setTaskFilterCat, taskFilterStatus, setTaskFilterStatus, expanded, toggleExpand,
  taskDateFilter, setTaskDateFilter, taskStartDate, setTaskStartDate, taskEndDate, setTaskEndDate,
  activeTimerTaskId, startTimer, stopTimer,
}) {
  const allSubs = (catId) => categories.find((c) => c.id === catId)?.subcategories || [];
  const [expandedDesc, setExpandedDesc] = useState({});

  const getDateBounds = () => {
    if (taskDateFilter === "all") return { start: "0000-01-01", end: "9999-12-31" };
    if (taskDateFilter === "today") return { start: TODAY, end: TODAY };
    if (taskDateFilter === "yesterday") return { start: addDays(TODAY, -1), end: addDays(TODAY, -1) };
    if (taskDateFilter === "tomorrow") return { start: addDays(TODAY, 1), end: addDays(TODAY, 1) };
    if (taskDateFilter === "7d") return { start: new Date(new Date(TODAY).setDate(new Date(TODAY).getDate() - 6)).toISOString().split('T')[0], end: TODAY };
    if (taskDateFilter === "30d") return { start: new Date(new Date(TODAY).setDate(new Date(TODAY).getDate() - 29)).toISOString().split('T')[0], end: TODAY };
    if (taskDateFilter === "custom") return { start: taskStartDate || TODAY, end: taskEndDate || TODAY };
    return { start: "0000-01-01", end: "9999-12-31" };
  };
  
  const { start: dateStart, end: dateEnd } = getDateBounds();
  const visibleTasks = flatTasks
    .filter((t) => taskFilterCat.length === 0 || taskFilterCat.includes(t.catId))
    .filter((t) => taskFilterStatus.length === 0 || taskFilterStatus.includes(t.status))
    .filter((t) => t.date >= dateStart && t.date <= dateEnd)
    .sort((a, b) => b.date.localeCompare(a.date));

  const startNewTask = () => {
    const firstCat = categories[0];
    const firstSub = firstCat?.subcategories[0];
    if (!firstCat || !firstSub) {
      alert("Add a category and sub-category first.");
      return;
    }
    setTaskForm({ catId: firstCat.id, subId: firstSub.id, name: "", est: "", date: TODAY, description: "", editingTaskId: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelect
          placeholder="All categories"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          selected={taskFilterCat}
          onChange={setTaskFilterCat}
        />
        <MultiSelect
          placeholder="All statuses"
          options={[
            { value: "Pending", label: "Pending" },
            { value: "In Progress", label: "In Progress" },
            { value: "Completed", label: "Completed" },
          ]}
          selected={taskFilterStatus}
          onChange={setTaskFilterStatus}
        />
        <TinySelect value={taskDateFilter} onChange={(e) => setTaskDateFilter(e.target.value)}>
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="custom">Custom range</option>
        </TinySelect>
        {taskDateFilter === "custom" && (
          <>
            <TinyInput type="date" value={taskStartDate} onChange={(e) => setTaskStartDate(e.target.value)} className="w-40" />
            <span style={{ color: MUTED }} className="text-xs">to</span>
            <TinyInput type="date" value={taskEndDate} onChange={(e) => setTaskEndDate(e.target.value)} className="w-40" />
          </>
        )}
        <div className="flex-1" />
        <CopyDropdown
          renderTrigger={(toggle) => (
            <PrimaryBtn onClick={toggle} style={{ background: MOSS }}><CopyPlus size={14} /> Duplicate today's tasks</PrimaryBtn>
          )}
          onCopyNextDay={duplicateAllTasksForTomorrow}
          onCopySpecificDay={duplicateAllTasksToDate}
          nextDayLabel="Duplicate for next day"
          specificDayLabel="Duplicate for specific day…"
        />
        <PrimaryBtn onClick={startNewTask} style={{ background: "#D98E3D" }}><Plus size={14} /> New task</PrimaryBtn>
      </div>

      {taskForm && (
        <Card className="p-4">
          <SectionLabel>{taskForm.editingTaskId ? "Edit task" : "New task"}</SectionLabel>
          <div className="flex flex-wrap gap-2 items-center">
            <TinySelect
              value={taskForm.catId}
              onChange={(e) => setTaskForm({ ...taskForm, catId: e.target.value, subId: allSubs(e.target.value)[0]?.id || "" })}
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </TinySelect>
            <TinySelect value={taskForm.subId} onChange={(e) => setTaskForm({ ...taskForm, subId: e.target.value })}>
              {allSubs(taskForm.catId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </TinySelect>
            <TinyInput placeholder="Task name" value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })} className="flex-1 min-w-[160px]" />
            <TinyInput type="number" placeholder="Est. minutes" value={taskForm.est} onChange={(e) => setTaskForm({ ...taskForm, est: e.target.value })} className="w-32" />
            <TinyInput type="date" value={taskForm.date} onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })} className="w-40" />
            <TinyInput placeholder="Description (optional)" value={taskForm.description || ""} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full" />
            <PrimaryBtn onClick={() => taskForm.name.trim() && upsertTask({ ...taskForm, name: taskForm.name.trim() })}><Check size={14} /> Save</PrimaryBtn>
            <IconBtn onClick={() => setTaskForm(null)}><X size={16} /></IconBtn>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: LINE, color: MUTED }}>
                <th className="p-3 font-medium">Task</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Est.</th>
                <th className="p-3 font-medium">Actual</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center" style={{ color: MUTED }}>No tasks match these filters.</td></tr>
              )}
              {visibleTasks.map((t) => {
                const actual = t.entries.reduce((s, e) => s + e.duration, 0);
                const isOverdue = t.date < TODAY && t.status !== "Completed";
                const isOpen = expanded[`task_${t.id}`];
                const isTiming = activeTimerTaskId === t.id;
                return (
                  <React.Fragment key={t.id}>
                    <tr className="border-b hover:bg-black/[0.02]" style={{ borderColor: LINE, background: isTiming ? `${AMBER}22` : undefined }}>
                      <td className="p-3">
                        <button onClick={() => toggleExpand(`task_${t.id}`)} className="flex items-center gap-1.5 text-left">
                          {isOpen ? <ChevronDown size={13} style={{ color: MUTED }} /> : <ChevronRight size={13} style={{ color: MUTED }} />}
                          <span className="font-medium">{t.name}</span>
                          {isOverdue && <AlertTriangle size={13} style={{ color: CLAY }} />}
                        </button>
                      </td>
                      <td className="p-3 text-xs">
                        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: t.catColor }} />{t.catName} / {t.subName}</span>
                      </td>
                      <td className="p-3 text-xs" style={{ color: isOverdue ? CLAY : INK }}>{fmtShort(t.date)}</td>
                      <td className="p-3 text-xs">{fmtHrs(t.estMinutes)}</td>
                      <td className="p-3 text-xs">{fmtHrs(actual)}</td>
                      <td className="p-3">
                        <TinySelect value={t.status} onChange={(e) => setTaskStatus(t.catId, t.subId, t.id, e.target.value)} className="text-xs py-1">
                          <option>Pending</option><option>In Progress</option><option>Completed</option>
                        </TinySelect>
                      </td>
                      <td
                        className={`p-3 text-xs whitespace-normal break-words ${t.description ? "cursor-pointer" : ""} ${expandedDesc[t.id] ? "max-w-[280px]" : "line-clamp-2 max-w-[220px]"}`}
                        onClick={() => t.description && setExpandedDesc((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
                        title={!expandedDesc[t.id] ? (t.description || "") : ""}
                        style={{ color: t.description ? INK : MUTED }}
                      >
                        {t.description || "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-0.5">
                          {isTiming ? (
                            <IconBtn title="Stop timer" danger onClick={stopTimer}><Square size={14} fill="currentColor" /></IconBtn>
                          ) : (
                            <IconBtn title="Start timer" onClick={() => startTimer(t.catId, t.subId, t.id)}><Play size={14} style={{ color: MOSS }} /></IconBtn>
                          )}
                          <IconBtn title="Log time" onClick={() => setLogEntryFor(logEntryFor === t.id ? null : t.id)}><Clock size={14} /></IconBtn>
                          <CopyDropdown
                            renderTrigger={(toggle) => (
                              <IconBtn title="Duplicate" onClick={toggle}><Copy size={14} /></IconBtn>
                            )}
                            onCopyNextDay={() => duplicateTask(t.catId, t.subId, t.id)}
                            onCopySpecificDay={(date) => duplicateTaskToDate(t.catId, t.subId, t.id, date)}
                          />
                          <IconBtn title="Edit" onClick={() => setTaskForm({ catId: t.catId, subId: t.subId, name: t.name, est: t.estMinutes, date: t.date, description: t.description || "", editingTaskId: t.id })}><Pencil size={14} /></IconBtn>
                          <IconBtn title="Delete" danger onClick={() => deleteTask(t.catId, t.subId, t.id)}><Trash2 size={14} /></IconBtn>
                        </div>
                      </td>
                    </tr>
                    {logEntryFor === t.id && (
                      <tr className="border-b" style={{ borderColor: LINE, background: TINT_SOFT }}>
                        <td colSpan={8} className="p-3">
                          <div className="flex items-center gap-2">
                            <Play size={13} style={{ color: MOSS }} />
                            <span className="text-xs" style={{ color: MUTED }}>Log time spent:</span>
                            <TinyInput type="number" min="0" autoFocus value={logHours} onChange={(e) => setLogHours(e.target.value)} placeholder="hh" className="w-16" />
                            <span className="text-xs" style={{ color: MUTED }}>hr</span>
                            <TinyInput type="number" min="0" value={logDuration} onChange={(e) => setLogDuration(e.target.value)} placeholder="mm" className="w-16" />
                            <span className="text-xs" style={{ color: MUTED }}>min</span>
                            <PrimaryBtn
                              onClick={() => addTimeEntry(t.catId, t.subId, t.id, (Number(logHours) || 0) * 60 + (Number(logDuration) || 0))}
                              style={{ background: MOSS, padding: "5px 10px" }}
                            >
                              Add
                            </PrimaryBtn>
                          </div>
                        </td>
                      </tr>
                    )}
                    {isOpen && (
                      <tr className="border-b" style={{ borderColor: LINE, background: TINT_SOFT }}>
                        <td colSpan={8} className="p-3">
                          {t.entries.length === 0 ? (
                            <span className="text-xs" style={{ color: MUTED }}>No time entries logged for this task yet.</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {t.entries.map((e) => (
                                <div key={e.id} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full" style={{ background: TINT }}>
                                  <span>{fmtHrs(e.duration)}</span>
                                  <span style={{ color: MUTED }}>· {new Date(e.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                                  <button onClick={() => deleteEntry(t.catId, t.subId, t.id, e.id)}><X size={12} style={{ color: MUTED }} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
