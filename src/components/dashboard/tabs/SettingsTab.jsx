import React from "react";
import { Download, Upload, Plus, RotateCcw } from "lucide-react";
import { Card, SectionLabel, TinyInput, TinySelect, PrimaryBtn } from "../shared";
import { MUTED, LINE, CLAY, MOSS } from "../../../styles/dashboardTheme";

const COMMON_TIMEZONES = [
  "Asia/Kathmandu", "Asia/Kolkata", "Asia/Dhaka", "Asia/Karachi", "Asia/Dubai",
  "Asia/Singapore", "Asia/Tokyo", "Asia/Shanghai", "Europe/London", "Europe/Berlin",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Australia/Sydney", "UTC",
];

const TIMEZONE_OPTIONS =
  typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : COMMON_TIMEZONES;

export default function SettingsTab({ settings, updateSetting, onExport, onImportClick, loadDemoData, resetData }) {
  return (
    <div className="space-y-4 max-w-2xl">
      <Card className="p-4">
        <SectionLabel>Data Retention</SectionLabel>
        <p className="text-xs mb-3" style={{ color: MUTED }}>
          Tasks and time entries older than this many days are automatically removed to keep local storage light.
        </p>
        <div className="flex items-center gap-2">
          <TinyInput
            type="number"
            min={7}
            max={3650}
            value={settings.retentionDays}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n >= 7) updateSetting("retentionDays", n);
            }}
            className="w-24"
          />
          <span className="text-sm" style={{ color: MUTED }}>days</span>
        </div>
      </Card>

      <Card className="p-4">
        <SectionLabel>Timezone</SectionLabel>
        <p className="text-xs mb-3" style={{ color: MUTED }}>
          Used for the clock shown at the top of the dashboard.
        </p>
        <TinySelect value={settings.timezone} onChange={(e) => updateSetting("timezone", e.target.value)}>
          {TIMEZONE_OPTIONS.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </TinySelect>
      </Card>

      <Card className="p-4">
        <SectionLabel>Data Management</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <PrimaryBtn onClick={onExport} style={{ background: MOSS }}>
            <Download size={14} /> Export your data as a JSON file
          </PrimaryBtn>
          <PrimaryBtn onClick={onImportClick} style={{ background: "#4C6B72" }}>
            <Upload size={14} /> Import a JSON file
          </PrimaryBtn>
        </div>
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-2" style={{ borderColor: LINE }}>
          <button
            onClick={loadDemoData}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border hover:bg-black/5"
            style={{ borderColor: LINE, color: MUTED }}
          >
            <Plus size={13} /> Load demo data
          </button>
          <button
            onClick={resetData}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border hover:bg-black/5"
            style={{ borderColor: LINE, color: CLAY }}
          >
            <RotateCcw size={13} /> Clear all data
          </button>
        </div>
      </Card>
    </div>
  );
}
