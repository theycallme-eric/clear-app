/**
 * Race a promise against a timeout.
 * Rejects with a descriptive error if the timeout fires first.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/** Default timeouts by operation type */
export const TIMEOUTS = {
  /** Edge Function calls (AI generation) — generous for LLM latency */
  edgeFunction: 60_000,
  /** RPC calls (save, repeat) */
  rpc: 15_000,
  /** Simple DB reads/writes */
  query: 10_000,
} as const;
