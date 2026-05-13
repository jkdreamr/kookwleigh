"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { FormStatus } from "@/components/form-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = { email: String(formData.get("email") ?? "") };

    startTransition(async () => {
      const response = await fetch("/api/guest/login", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not log in.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" placeholder="you@example.com" required type="email" />
      </div>
      <FormStatus error={error} />
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Checking..." : "Enter dashboard"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
