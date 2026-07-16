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
    throw new Error(errorText || "Request failed");
  }

  return response.json() as Promise<T>;
}
