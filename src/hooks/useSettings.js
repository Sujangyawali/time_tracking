import { useEffect, useState } from "react";
import { readSettings, writeSettings } from "../lib/storage";

export function useSettings() {
  const [settings, setSettings] = useState(() => readSettings());

  useEffect(() => {
    writeSettings(settings);
  }, [settings]);

  const updateSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  return { settings, setSettings, updateSetting };
}
