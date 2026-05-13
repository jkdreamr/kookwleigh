"use client";

export function FormStatus({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) {
    return null;
  }

  return (
    <p
      className={
        error
          ? "rounded-lg border border-red-900/10 bg-red-50 px-4 py-3 text-sm text-red-900"
          : "rounded-lg border border-sage/30 bg-sage/15 px-4 py-3 text-sm text-foreground"
      }
    >
      {error ?? success}
    </p>
  );
}
