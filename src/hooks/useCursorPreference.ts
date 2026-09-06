import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "journex:custom-cursor";
const EVENT = "journex:custom-cursor-change";

export function getCursorPreference(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "off";
}

export function setCursorPreference(enabled: boolean) {
  window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  window.dispatchEvent(new CustomEvent(EVENT, { detail: enabled }));
}

/** User preference for the animated custom cursor (persisted, cross-component). */
export function useCursorPreference() {
  const [enabled, setEnabled] = useState<boolean>(() => getCursorPreference());

  useEffect(() => {
    const sync = () => setEnabled(getCursorPreference());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((value: boolean) => setCursorPreference(value), []);

  return { enabled, setEnabled: toggle };
}
