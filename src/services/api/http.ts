/**
 * Small JSON client shared by every API service. It adds three things fetch
 * does not do on its own:
 *
 * - Caching: responses are kept in memory for a while, so going back to a
 *   destination or retyping a search does not hit the network again.
 * - De-duplication: two components asking for the same URL at the same time
 *   share one request.
 * - Errors: network failures, timeouts and bad HTTP statuses all become an
 *   ApiError with a message that is safe to show to people.
 */

export class ApiError extends Error {
  /** HTTP status, or null when the request never got a response. */
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

export interface FetchJsonOptions {
  /** How long a successful response stays cached, in milliseconds. 0 turns caching off. */
  ttl?: number;
  /** Cancels the request, e.g. when a component unmounts or the search changes. */
  signal?: AbortSignal;
  /** Gives up after this many milliseconds. */
  timeout?: number;
}

const DEFAULT_TTL = 10 * 60 * 1000;
const DEFAULT_TIMEOUT = 12_000;
const MAX_CACHE_ENTRIES = 200;

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

/** Empties the cache. Used by tests, and could back a "refresh" button. */
export function clearApiCache(): void {
  cache.clear();
  inFlight.clear();
}

function readCache<T>(url: string): T | undefined {
  const entry = cache.get(url);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(url);
    return undefined;
  }
  return entry.value as T;
}

function writeCache(url: string, value: unknown, ttl: number): void {
  if (ttl <= 0) return;
  // Map keeps insertion order, so the first key is the oldest entry.
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(url, { value, expiresAt: Date.now() + ttl });
}

function messageForStatus(status: number): string {
  if (status === 404) return "We couldn't find that.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "The service is having problems. Please try again later.";
  return `The request failed (error ${status}).`;
}

async function request<T>(url: string, timeout: number): Promise<T> {
  // The request gets its own controller, so one caller cancelling does not
  // cancel the shared request other callers are waiting on.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiError(
      controller.signal.aborted
        ? "The request took too long. Please try again."
        : "You appear to be offline, or the service could not be reached.",
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new ApiError(messageForStatus(response.status), response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("The service sent a response we couldn't read.", response.status);
  }
}

/** Rejects as soon as the signal aborts, without cancelling the shared request. */
function withAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const { ttl = DEFAULT_TTL, signal, timeout = DEFAULT_TIMEOUT } = options;

  const cached = readCache<T>(url);
  if (cached !== undefined) return cached;

  let pending = inFlight.get(url) as Promise<T> | undefined;
  if (!pending) {
    pending = request<T>(url, timeout)
      .then((value) => {
        writeCache(url, value, ttl);
        return value;
      })
      .finally(() => inFlight.delete(url));
    inFlight.set(url, pending);
  }

  return withAbort(pending, signal);
}

/** True for the error thrown when a caller cancels, which should usually be ignored. */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** Builds a URL with query parameters, skipping undefined values. */
export function buildUrl(base: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}
