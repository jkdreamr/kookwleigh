import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { JoinForm } from "@/components/join-form";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Join the waitlist",
};

export default function JoinPage() {
  return (
    <main className="page-grid min-h-screen">

      {/* ── Left editorial column ── */}
      <section className="relative flex flex-col justify-between gap-10 overflow-hidden">

        <BrandMark href="/" />

        <PageTransition>
          <div>
            {/* Thin terracotta accent rule */}
            <div className="mb-5 h-px w-10 bg-accent/45" />
            <p className="eyebrow">Get on the list</p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-7xl">
              Save your<br />seat at the table.
            </h1>
            <p className="subtitle mt-6">
              Tell us a bit about yourself and what you love to eat.
              We will reach out personally when a dinner window opens.
            </p>
          </div>
        </PageTransition>

        <nav className="flex flex-col gap-2 text-sm text-foreground/45">
          <Link className="transition-colors hover:text-foreground" href="/login">
            Already on the list? Log in →
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/">
            ← Back to home
          </Link>
        </nav>
      </section>

      {/* ── Right form column ── */}
      <PageTransition delay={0.08}>
        <section className="section-frame self-start">
          <p className="section-label mb-5">Your details</p>
          <JoinForm />
        </section>
      </PageTransition>

    </main>
  );
}
