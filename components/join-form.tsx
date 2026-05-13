"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { FormStatus } from "@/components/form-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function JoinForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      allergies: String(formData.get("allergies") ?? ""),
      email: String(formData.get("email") ?? ""),
      favoriteCuisines: String(formData.get("favoriteCuisines") ?? ""),
      name: String(formData.get("name") ?? ""),
    };

    startTransition(async () => {
      const response = await fetch("/api/guest/signup", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not join the waitlist.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Josh Koo" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" placeholder="you@example.com" required type="email" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea id="allergies" name="allergies" placeholder="Anything we should avoid?" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="favoriteCuisines">Favorite cuisines or foods</Label>
        <Textarea
          id="favoriteCuisines"
          name="favoriteCuisines"
          placeholder="Noodles, handmade pasta, crispy rice..."
        />
      </div>
      <FormStatus error={error} />
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Joining..." : "Join the Waitlist"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
