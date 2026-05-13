"use client";

import { useEffect } from "react";

const reloadKey = "kookwleigh:chunk-reload";

function isChunkError(value: unknown) {
  if (!value) {
    return false;
  }

  const message =
    value instanceof Error
      ? value.message
      : typeof value === "string"
        ? value
        : JSON.stringify(value);

  return /ChunkLoadError|Loading chunk .* failed|webpack.*chunk/i.test(message);
}

export function ChunkErrorReloader() {
  useEffect(() => {
    function recover(error: unknown) {
      if (!isChunkError(error)) {
        return;
      }

      if (sessionStorage.getItem(reloadKey) === "1") {
        return;
      }

      sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
    }

    function handleError(event: ErrorEvent) {
      recover(event.error ?? event.message);
    }

    function handleRejection(event: PromiseRejectionEvent) {
      recover(event.reason);
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
