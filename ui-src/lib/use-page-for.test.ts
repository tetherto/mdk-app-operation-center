// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePageFor } from "./use-page-for";

describe("usePageFor", () => {
  it("starts at page 1 and moves to the page set", () => {
    const { result } = renderHook(() => usePageFor("all"));
    expect(result.current[0]).toBe(1);

    act(() => result.current[1](3));

    expect(result.current[0]).toBe(3);
  });

  it("starts over at 1 when the key changes, and keeps pages per key from then on", () => {
    const { result, rerender } = renderHook(({ key }) => usePageFor(key), {
      initialProps: { key: "all" },
    });
    act(() => result.current[1](4));

    rerender({ key: "container-1" });
    expect(result.current[0]).toBe(1);

    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);

    rerender({ key: "all" });
    expect(result.current[0]).toBe(1);
  });

  it("keeps the setter stable while the key is the same", () => {
    const { result, rerender } = renderHook(({ key }) => usePageFor(key), {
      initialProps: { key: "a" },
    });
    const first = result.current[1];

    rerender({ key: "a" });
    expect(result.current[1]).toBe(first);

    rerender({ key: "b" });
    expect(result.current[1]).not.toBe(first);
  });
});
