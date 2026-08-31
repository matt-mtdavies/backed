"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "backed_admin_token";

function subscribe() {
  return () => {};
}
function getSnapshot() {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function getServerSnapshot() {
  return undefined;
}

// Alpha-appropriate gate, not real per-admin identity — see ADR-0013.
// Kept in sessionStorage only (never localStorage): cleared when the tab closes.
// useSyncExternalStore reads sessionStorage without a hydration mismatch:
// the server snapshot is `undefined` (loading), and React reconciles to the
// real client snapshot right after mount, with no synchronous setState-in-effect.
export function useAdminToken() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // `null` here means "explicitly overridden" (saved or cleared this render),
  // taking precedence over `stored`; `undefined` means "no override yet."
  const [override, setOverride] = useState<string | null | undefined>(undefined);

  const save = (value: string) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore — the token still works for this render via state
    }
    setOverride(value);
  };

  // A wrong token has no visible symptom until an admin action 401s — at
  // that point the only way back for someone who can't easily clear site
  // data (a phone, mainly) is for the app to clear it and re-prompt itself.
  const clear = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setOverride(null);
  };

  return { token: override === undefined ? stored : override, save, clear };
}

export function AdminTokenGate({ onSubmit, message }: { onSubmit: (token: string) => void; message?: string }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <main className="adminTokenGate">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim()) onSubmit(value.trim());
        }}
      >
        <p className="eyebrow">INTERNAL ALPHA</p>
        <h1>ADMIN ACCESS<span>.</span></h1>
        {message && <p className="formError" role="alert">{message}</p>}
        <label>
          ADMIN TOKEN
          <input ref={inputRef} type="password" value={value} onChange={(event) => setValue(event.target.value)} />
        </label>
        <button className="button primary" type="submit" disabled={!value.trim()}>CONTINUE</button>
      </form>
    </main>
  );
}
