import { useEffect, useState } from "react";

/** The value once it has stopped changing for `delayMs`, e.g. a search sent while typing. */
export const useDebouncedValue = <Value>(value: Value, delayMs: number): Value => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
};
