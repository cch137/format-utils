export type SleepOptions = { signal?: AbortSignal };

export default async function sleep(
  ms: number,
  options?: SleepOptions
): Promise<void>;
export default async function sleep(ms: number, { signal }: SleepOptions = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);

    if (signal) {
      signal.addEventListener(
        "abort",
        (e) => {
          clearTimeout(timeout);
          reject(signal.reason);
        },
        { once: true }
      );
    }
  });
}

export function asyncDelay<T extends (...args: any[]) => Promise<any>>(
  func: T,
  durationMs: number
): T {
  if (!durationMs) return func;
  return (async (...args: Parameters<T>) => {
    const timer = sleep(durationMs, {});
    try {
      const result = await func(...args);
      await timer;
      return result;
    } catch (e) {
      throw e;
    }
  }) as T;
}
