/**
 * Limits the execution of a function to once every specified delay.
 * Useful for rate-limiting events like scrolling or resizing.
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
  leading = true
): T {
  let lastTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = delay - (now - lastTime);

    // Store the latest arguments
    lastArgs = args;

    // If we're past the delay or this is the first call with leading=true
    if (remaining <= 0) {
      // Clear any pending timeout
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      // If leading or not the first call
      if (leading || lastTime !== 0) {
        func(...args);
        lastTime = now;
        lastArgs = null;
      } else {
        // For first call with leading=false, just set the time
        lastTime = now;
      }
    } else if (!timer && !leading) {
      // For trailing edge execution, schedule execution after delay
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  }) as T;
}

/**
 * Delays the execution of a function until after a specified time
 * has passed since the last invocation.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
  maxDelay = delay + 1
): T {
  let firstTriggedAt = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();

    // If this is the first call or we've reset after execution
    if (firstTriggedAt === 0) {
      firstTriggedAt = currentTime;
    }

    // Clear existing timer if there is one
    if (timer) {
      clearTimeout(timer);
    }

    // Check if we've exceeded the maxDelay since first trigger
    const timeElapsed = currentTime - firstTriggedAt;
    if (timeElapsed >= maxDelay) {
      // Execute immediately if we've exceeded maxDelay
      firstTriggedAt = 0;
      func(...args);
    } else {
      // Set normal debounce timer
      timer = setTimeout(() => {
        firstTriggedAt = 0;
        timer = null;
        func(...args);
      }, delay);
    }
  }) as T;
}
