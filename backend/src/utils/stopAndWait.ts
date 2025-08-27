export async function stopAndWait<T>(
  fn: () => Promise<T>,
  shouldRetry: (e: unknown) => boolean,
  intervalMs: number,
  maxAttempts = Infinity,
  backoff = false
): Promise<T> {
  let attempt = 0;
  let delay = intervalMs;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt++;
    try {
      return await fn();
    } catch (e) {
      if (!shouldRetry(e) || attempt >= maxAttempts) throw e;
      await new Promise(res => setTimeout(res, delay));
      if (backoff) delay = Math.min(delay * 2, 60000); // Exponential Backoff [Optional]
    }
  }
}
