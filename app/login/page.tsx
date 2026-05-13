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
      <section className="flex flex-col justify-between gap-10">
        <BrandMark href="/" />
        <PageTransition>
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1 className="mt-4 font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
              Check your<br />place in line.
            </h1>
            <p className="subtitle mt-6">
              Enter the email address you used to join.
              We will bring up your spot.
            </p>
          </div>
        </PageTransition>
        <div className="flex flex-col gap-2 text-sm text-foreground/50">
          <Link className="hover:text-foreground transition-colors" href="/join">
            Not on the list yet? Join the waitlist.
          </Link>
          <Link className="hover:text-foreground transition-colors" href="/">
            ← Back to home
          </Link>
        </div>
      </section>
      <PageTransition delay={0.08}>
        <section className="section-frame self-start">
          <LoginForm />
        </section>
      </PageTransition>
    </main>
  );
}
