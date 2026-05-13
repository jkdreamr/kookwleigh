import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function parseJsonBody<T>(
  request: Request,
  fallback?: T,
): Promise<T> {
  const text = await request.text();

  if (!text.trim()) {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error("Request body is required.");
  }

  return JSON.parse(text) as T;
}
