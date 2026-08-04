/**
 * Lumora API client — the single way the browser talks to the API.
 *
 * Every call returns the unwrapped `{ data }` payload and throws a typed
 * `ApiError` on failure (401 → the caller typically redirects to /signin).
 *
 * How to add a client call: put it in the matching domain module under
 * `src/lib/api/<domain>.ts` (see docs/api.md).
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(
  path: string,
  init: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: unknown;
    query?: Record<string, string | number | undefined>;
    /** For multipart uploads — send a FormData directly. */
    form?: FormData;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  let url = path;
  if (init.query) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined) sp.set(k, String(v));
    }
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  if (init.form) {
    body = init.form;
  } else if (init.body !== undefined) {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(init.body);
  }

  const res = await fetch(url, {
    method: init.method ?? (init.body !== undefined || init.form ? 'POST' : 'GET'),
    headers,
    body,
    credentials: 'same-origin',
    signal: init.signal,
  });

  const json = (await res.json().catch(() => ({}))) as {
    data?: T;
    error?: { code?: string; message?: string };
  };

  if (!res.ok || json.error) {
    const code = json.error?.code ?? 'INTERNAL';
    const message = json.error?.message ?? `Request failed (${res.status}).`;
    throw new ApiError(res.status, code, message);
  }

  return json.data as T;
}
