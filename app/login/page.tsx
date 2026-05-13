import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/login-form";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <main className="page-grid min-h-screen">

      {/* ── Left editorial column ── */}
      <section className="relative flex flex-col justify-between gap-10 overflow-hidden">

        <BrandMark href="/" />

        <PageTransition>
          <div>
            {/* Thin terracotta accent rule */}
            <div className="mb-5 h-px w-10 bg-accent/45" />
            <p className="eyebrow">Welcome back</p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-7xl">
              Check your<br />place in line.
            </h1>
            <p className="subtitle mt-6">
              Enter the email address you used to join.
              We will bring up your spot.
            </p>
          </div>
        </PageTransition>

        <nav className="flex flex-col gap-2 text-sm text-foreground/45">
          <Link className="transition-colors hover:text-foreground" href="/join">
            Not on the list yet? Join the waitlist →
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/">
            ← Back to home
          </Link>
        </nav>
      </section>

      {/* ── Right form column ── */}
      <PageTransition delay={0.08}>
        <section className="section-frame self-start">
          <p className="section-label mb-5">Your email</p>
          <LoginForm />
        </section>
      </PageTransition>

    </main>
  );
}
