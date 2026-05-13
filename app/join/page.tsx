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
      <section className="flex flex-col justify-between gap-10">
        <BrandMark href="/" />
        <PageTransition>
          <div>
            <p className="eyebrow">Get on the list</p>
            <h1 className="mt-4 font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
              Save your<br />seat at the table.
            </h1>
            <p className="subtitle mt-6">
              Tell us a bit about yourself and what you love to eat.
              We will reach out personally when a dinner window opens.
            </p>
          </div>
        </PageTransition>
        <div className="flex flex-col gap-2 text-sm text-foreground/50">
          <Link className="hover:text-foreground transition-colors" href="/login">
            Already on the list? Log in with your email.
          </Link>
          <Link className="hover:text-foreground transition-colors" href="/">
            ← Back to home
          </Link>
        </div>
      </section>
      <PageTransition delay={0.08}>
        <section className="section-frame self-start">
          <JoinForm />
        </section>
      </PageTransition>
    </main>
  );
}
