export async function readJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON but received ${contentType || "unknown content"}: ${body.slice(0, 120)}`);
  }

  return JSON.parse(body) as T;
}
