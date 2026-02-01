/**
 * Base URL for API routes. Used by server components to fetch from /api/*.
 * Set NEXT_PUBLIC_APP_URL in production (e.g. https://your-domain.com).
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 404) return null as T;
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
