import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/login-form";
import { PageTransition } from "@/components/page-transition";

export default function LoginPage() {
  return (
    <main className="page-grid min-h-screen">
      <section className="flex flex-col justify-between gap-10">
        <BrandMark />
        <PageTransition>
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1 className="mt-4 font-serif text-6xl leading-none sm:text-7xl">
              Check your place at the table.
            </h1>
            <p className="subtitle mt-6">
              Enter the same email you used to join the waitlist. No magic link needed.
            </p>
          </div>
        </PageTransition>
        <Link className="text-sm text-foreground/60 hover:text-foreground" href="/join">
          New here? Join the waitlist.
        </Link>
      </section>
      <PageTransition delay={0.08}>
        <section className="section-frame self-start">
          <LoginForm />
        </section>
      </PageTransition>
    </main>
  );
}
