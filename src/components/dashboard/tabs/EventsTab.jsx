import React, { useState } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { Card, SectionLabel, TinyInput, PrimaryBtn, IconBtn } from "../shared";
import { fmtShort, daysUntil, TODAY } from "../../../lib/dateUtils";
import { CLAY, LINE, MOSS, MUTED, INK } from "../../../styles/dashboardTheme";

function formatDaysUntil(n) {
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  if (n > 1) return `In ${n} days`;
  return `${Math.abs(n)} days ago`;
}

export default function EventsTab({ events, eventForm, setEventForm, upsertEvent, deleteEvent }) {
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const [expandedDesc, setExpandedDesc] = useState({});

  const startNewEvent = () => {
    setEventForm({ name: "", description: "", date: TODAY, editingEventId: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1" />
        <PrimaryBtn onClick={startNewEvent} style={{ background: "#D98E3D" }}><Plus size={14} /> New event</PrimaryBtn>
      </div>

      {eventForm && (
        <Card className="p-4">
          <SectionLabel>{eventForm.editingEventId ? "Edit event" : "New event"}</SectionLabel>
          <div className="flex flex-wrap gap-2 items-center">
            <TinyInput placeholder="Event name" value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} className="flex-1 min-w-[160px]" />
            <TinyInput type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className="w-40" />
            <TinyInput placeholder="Description (optional)" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="w-full" />
            <PrimaryBtn onClick={() => upsertEvent(eventForm)}><Check size={14} /> Save</PrimaryBtn>
            <IconBtn onClick={() => setEventForm(null)}><X size={16} /></IconBtn>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: LINE, color: MUTED }}>
                <th className="p-3 font-medium">Event</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">In Days</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center" style={{ color: MUTED }}>No upcoming events.</td></tr>
              )}
              {sortedEvents.map((ev) => {
                const diff = daysUntil(ev.date);
                return (
                  <tr key={ev.id} className="border-b hover:bg-black/[0.02]" style={{ borderColor: LINE }}>
                    <td className="p-3 font-medium">{ev.name}</td>
                    <td
                      className={`p-3 text-xs whitespace-normal break-words ${ev.description ? "cursor-pointer" : ""} ${expandedDesc[ev.id] ? "max-w-[280px]" : "line-clamp-2 max-w-[220px]"}`}
                      onClick={() => ev.description && setExpandedDesc((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }))}
                      title={!expandedDesc[ev.id] ? (ev.description || "") : ""}
                      style={{ color: ev.description ? INK : MUTED }}
                    >
                      {ev.description || "—"}
                    </td>
                    <td className="p-3 text-xs">{fmtShort(ev.date)}</td>
                    <td className="p-3 text-xs" style={{ color: diff < 0 ? CLAY : diff === 0 ? MOSS : INK }}>{formatDaysUntil(diff)}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-0.5">
                        <IconBtn title="Edit" onClick={() => setEventForm({ name: ev.name, description: ev.description || "", date: ev.date, editingEventId: ev.id })}><Pencil size={14} /></IconBtn>
                        <IconBtn title="Delete" danger onClick={() => deleteEvent(ev.id)}><Trash2 size={14} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
