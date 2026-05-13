"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { FormStatus } from "@/components/form-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = { password: String(formData.get("password") ?? "") };

    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not log in.");
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="password">Admin password</Label>
        <div className="relative">
          <Input
            autoComplete="current-password"
            id="password"
            name="password"
            placeholder="Enter host password"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35 transition-colors hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            type="button"
          >
            {showPassword
              ? <EyeOff className="h-4 w-4" />
              : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <FormStatus error={error} />
      <Button className="w-full" disabled={isPending} type="submit">
        <Lock className="h-4 w-4" />
        {isPending ? "Opening..." : "Open admin"}
      </Button>
    </form>
  );
}
