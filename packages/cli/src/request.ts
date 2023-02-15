export async function makeRequest(
  resource: string,
  options: { timeout?: number; body?: string; method?: string }
) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    headers: {
      "Content-type": options.body ? "application/json" : "",
    },
    signal: controller.signal,
  });

  clearTimeout(id);

  return response;
}
