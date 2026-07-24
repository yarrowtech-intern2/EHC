const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

type RequestOptions = RequestInit & {
  body?: unknown;
};
type SafeRequestOptions = Omit<RequestOptions, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  { body, headers, ...init }: SafeRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || "Request failed";

    try {
      const parsed = JSON.parse(errorText) as { message?: unknown; error?: unknown };
      if (typeof parsed.message === "string") {
        message = parsed.message;
      } else if (Array.isArray(parsed.message)) {
        message = parsed.message.join(" ");
      } else if (typeof parsed.error === "string") {
        message = parsed.error;
      }
    } catch {
      // Non-JSON error bodies are already usable as-is.
    }

    throw new Error(message);
  }

  const responseText = await response.text();

  if (!responseText) {
    return null as T;
  }

  return JSON.parse(responseText) as T;
}
