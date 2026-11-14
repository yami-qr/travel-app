import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useApi, useDebouncedValue } from "./useApi";
import { ApiError } from "../services/api/http";

afterEach(() => {
  vi.useRealTimers();
});

describe("useApi", () => {
  it("is idle and does not fetch when the key is null", () => {
    const fetcher = vi.fn();
    const { result } = renderHook(() => useApi(null, fetcher));

    expect(result.current.status).toBe("idle");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("goes from loading to success", async () => {
    const { result } = renderHook(() => useApi("k", async () => 42));

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current).toMatchObject({ data: 42 });
  });

  it("shows the ApiError message on failure", async () => {
    const { result } = renderHook(() =>
      useApi("k", async () => {
        throw new ApiError("We couldn't find that.", 404);
      }),
    );

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current).toMatchObject({ error: "We couldn't find that." });
  });

  it("uses a generic message for unexpected errors", async () => {
    const { result } = renderHook(() =>
      useApi("k", async () => {
        throw new Error("boom");
      }),
    );

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current).toMatchObject({ error: "Something went wrong. Please try again." });
  });

  it("runs the request again on retry", async () => {
    const fetcher = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockRejectedValueOnce(new ApiError("Down"))
      .mockResolvedValueOnce("back");
    const { result } = renderHook(() => useApi("k", fetcher));

    await waitFor(() => expect(result.current.status).toBe("error"));
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("cancels the old request when the key changes, and ignores its result", async () => {
    let resolveFirst: (value: string) => void = () => {};
    const signals: AbortSignal[] = [];
    const fetcher = vi.fn((signal: AbortSignal) => {
      signals.push(signal);
      return signals.length === 1
        ? new Promise<string>((resolve) => {
            resolveFirst = resolve;
          })
        : Promise.resolve("second");
    });

    const { result, rerender } = renderHook(({ key }) => useApi(key, fetcher), {
      initialProps: { key: "a" },
    });
    rerender({ key: "b" });

    await waitFor(() => expect(result.current).toMatchObject({ data: "second" }));
    expect(signals[0].aborted).toBe(true);

    await act(async () => resolveFirst("first"));
    expect(result.current).toMatchObject({ data: "second" });
  });
});

describe("useDebouncedValue", () => {
  it("only updates after the value stops changing", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "r" },
    });

    rerender({ value: "ro" });
    rerender({ value: "rom" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("r");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("rom");
  });
});
