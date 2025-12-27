export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export function safeJsonParse<T = unknown>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
