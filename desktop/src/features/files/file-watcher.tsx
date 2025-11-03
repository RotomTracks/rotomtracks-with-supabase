import React, { useEffect, useRef, useState } from 'react';
import { readTextFile } from '@tauri-apps/plugin-fs';

type Props = {
  path: string;
  intervalMs?: number;
  debounceMs?: number;
  onChange: (content: string) => void;
  onError?: (message: string) => void;
  enabled?: boolean;
};

export function FileWatcher({ path, intervalMs = 1500, debounceMs = 800, onChange, onError, enabled = true }: Props) {
  const lastHashRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [watching, setWatching] = useState(enabled);

  useEffect(() => {
    setWatching(enabled);
  }, [enabled]);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const content = await readTextFile(path);
        const hash = simpleHash(content);
        if (lastHashRef.current !== hash) {
          lastHashRef.current = hash;
          if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
          timeoutRef.current = window.setTimeout(() => {
            if (!cancelled) onChange(content);
          }, debounceMs);
        }
      } catch (e) {
        onError?.(e instanceof Error ? e.message : 'Error leyendo archivo');
      }
    }

    if (!watching) return;
    const id = window.setInterval(tick, intervalMs);
    // run immediately
    tick();
    return () => {
      cancelled = true;
      window.clearInterval(id);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [path, intervalMs, debounceMs, watching, onChange, onError]);

  return null;
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash.toString();
}


