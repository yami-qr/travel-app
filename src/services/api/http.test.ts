import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, buildUrl, clearApiCache, fetchJson, isAbortError } from "./http";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  clearApiCache();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("fetchJson", () => {
  it("returns the parsed JSON body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: 1 }));
    await expect(fetchJson("https://api.test/a")).resolves.toEqual({ ok: 1 });
  });

  it("serves a repeat request from the cache", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ n: 1 }));

    await fetchJson("https://api.test/a");
    await fetchJson("https://api.test/a");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fetches again after the cache entry expires", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async () => jsonResponse({ n: 1 }));

    await fetchJson("https://api.test/a", { ttl: 1000 });
    vi.advanceTimersByTime(1001);
    await fetchJson("https://api.test/a", { ttl: 1000 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache when the ttl is 0", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ n: 1 }));

    await fetchJson("https://api.test/a", { ttl: 0 });
    await fetchJson("https://api.test/a", { ttl: 0 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shares one request between callers asking at the same time", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ n: 1 }));

    const [a, b] = await Promise.all([
      fetchJson("https://api.test/a"),
      fetchJson("https://api.test/a"),
    ]);

    expect(a).toEqual(b);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("turns a 404 into a friendly ApiError with the status", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 404));

    const error = await fetchJson("https://api.test/missing").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).message).toBe("We couldn't find that.");
  });

  it("explains rate limiting and server errors", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 429));
    await expect(fetchJson("https://api.test/a")).rejects.toThrow(/Too many requests/);

    fetchMock.mockResolvedValueOnce(jsonResponse({}, 503));
    await expect(fetchJson("https://api.test/b")).rejects.toThrow(/having problems/);
  });

  it("does not cache failed requests", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    await expect(fetchJson("https://api.test/a")).rejects.toThrow();
    await expect(fetchJson("https://api.test/a")).resolves.toEqual({ ok: true });
  });

  it("reports a network failure as an ApiError", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(fetchJson("https://api.test/a")).rejects.toThrow(/offline/);
  });

  it("reports a body that is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<html>", { status: 200 }));
    await expect(fetchJson("https://api.test/a")).rejects.toThrow(/couldn't read/);
  });

  it("rejects with an AbortError when the caller cancels", async () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    const controller = new AbortController();

    const pending = fetchJson("https://api.test/slow", { signal: controller.signal });
    controller.abort();

    const error = await pending.catch((e: unknown) => e);
    expect(isAbortError(error)).toBe(true);
  });

  it("gives up after the timeout", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("x", "AbortError")));
        }),
    );

    const pending = fetchJson("https://api.test/slow", { timeout: 500 }).catch((e: unknown) => e);
    vi.advanceTimersByTime(501);

    expect(((await pending) as Error).message).toMatch(/took too long/);
  });
});

describe("buildUrl", () => {
  it("adds parameters and skips undefined ones", () => {
    expect(buildUrl("https://api.test/search", { q: "rome city", count: 5, skip: undefined })).toBe(
      "https://api.test/search?q=rome+city&count=5",
    );
  });
});
