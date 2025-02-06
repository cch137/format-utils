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
