/**
 * Retry utility for API calls with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt);
        onRetry?.(attempt + 1, lastError);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Wait for online connection
 */
export async function waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
  if (isOnline()) return true;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener("online", onOnline);
      resolve(false);
    }, timeoutMs);

    const onOnline = () => {
      clearTimeout(timeout);
      window.removeEventListener("online", onOnline);
      resolve(true);
    };

    window.addEventListener("online", onOnline);
  });
}
