import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, isAbortError } from "../services/api/http";

export type ApiState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export type ApiResult<T> = ApiState<T> & {
  /** Runs the request again, e.g. from a "Try again" button. */
  retry: () => void;
};

/**
 * Runs an async request and tracks its loading, success and error states.
 *
 * `key` identifies the request: when it changes, the old request is cancelled
 * and a new one starts. Pass null to wait, e.g. until a search term is long
 * enough. The fetcher receives an AbortSignal to pass on to fetchJson.
 */
export function useApi<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>,
): ApiResult<T> {
  const [state, setState] = useState<ApiState<T>>(
    key === null ? { status: "idle" } : { status: "loading" },
  );
  const [attempt, setAttempt] = useState(0);

  // Keep the latest fetcher without restarting the request when its identity changes.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (key === null) {
      setState({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading" });

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        const message =
          error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
        setState({ status: "error", error: message });
      });

    return () => controller.abort();
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}

/** Returns the value only after it has stopped changing for `delay` ms. Used to avoid a request per keystroke. */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
