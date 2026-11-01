import { useCallback, useState } from "react";

/**
 * A 1-based page that starts over at 1 whenever `key` changes, e.g. when the
 * filter it pages through does. Deriving it from the key, instead of resetting
 * it on change, keeps the page and its filter from ever disagreeing.
 */
export const usePageFor = (key: string): [number, (page: number) => void] => {
  const [paged, setPaged] = useState({ key, page: 1 });
  const page = paged.key === key ? paged.page : 1;
  const setPage = useCallback((next: number) => setPaged({ key, page: next }), [key]);
  return [page, setPage];
};
