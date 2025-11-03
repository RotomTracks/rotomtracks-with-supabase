export async function withBackoff<T>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelayMs?: number; maxDelayMs?: number } = {}
): Promise<T> {
  const retries = options.retries ?? 5;
  const base = options.baseDelayMs ?? 750;
  const max = options.maxDelayMs ?? 8000;
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt === retries) break;
      const jitter = Math.random() * 0.3 + 0.85; // 0.85x - 1.15x
      const delay = Math.min(max, Math.round(base * Math.pow(2, attempt) * jitter));
      await new Promise((res) => setTimeout(res, delay));
      attempt += 1;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Operation failed');
}



