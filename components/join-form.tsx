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
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="name">Your name</Label>
        <Input
          autoComplete="name"
          id="name"
          maxLength={120}
          name="name"
          placeholder="First and last name"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          autoComplete="email"
          id="email"
          inputMode="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="allergies">
          Allergies or dietary restrictions
          <span className="ml-1 text-foreground/40">(optional)</span>
        </Label>
        <Textarea
          id="allergies"
          maxLength={500}
          name="allergies"
          placeholder="Anything we should avoid?"
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="favoriteCuisines">
          Favourite foods or cuisines
          <span className="ml-1 text-foreground/40">(optional)</span>
        </Label>
        <Textarea
          id="favoriteCuisines"
          maxLength={500}
          name="favoriteCuisines"
          placeholder="Handmade pasta, crispy rice, anything with good butter..."
          rows={2}
        />
      </div>
      <FormStatus error={error} />
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Adding you to the list..." : "Join the waitlist"}
        {!isPending && <ArrowRight className="h-4 w-4" />}
      </Button>
      <p className="text-center text-xs text-foreground/35">
        Your email is only used to manage your place on the waitlist.
      </p>
    </form>
  );
}
