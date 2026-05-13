"use client";

export function FormStatus({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <p className="rounded-lg border border-red-900/10 bg-red-50 px-4 py-3 text-sm text-red-900">
      {error}
    </p>
  );
}
