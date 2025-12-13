import { useEffect, useState } from "react";

const DEFAULTS = {
  crt: false,
  background: true,
  sound: true,
  debug: false,
  scanlines: 0.4,
};

export function useSystemSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("sys-settings");
    return saved ? JSON.parse(saved) : DEFAULTS;
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem("sys-settings", JSON.stringify(settings));
  }, [settings]);

  const toggle = (key) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  const setValue = (key, value) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const reset = () => {
    localStorage.removeItem("sys-settings");
    setSettings(DEFAULTS);
    sessionStorage.removeItem("booted");
    window.location.reload();
  };

  return { settings, toggle, setValue, reset };
}
