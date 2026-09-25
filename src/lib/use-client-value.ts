import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/**
 * Reads a browser-only value (time zone, local date text) without a hydration mismatch:
 * the server and the first client render use `serverValue`, then React swaps in `compute()`.
 * `compute` must return a primitive so repeated calls compare equal.
 */
export function useClientValue<T extends string | number | boolean | null>(
  compute: () => T,
  serverValue: T,
  subscribe: (onChange: () => void) => () => void = subscribeNever,
): T {
  return useSyncExternalStore(subscribe, compute, () => serverValue);
}
