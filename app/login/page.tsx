import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="auth-grid">

      {/* ── Left — dark editorial panel ── */}
      <div className="panel-dark relative flex flex-col justify-between overflow-hidden px-10 py-10 lg:px-16 lg:py-14">

        {/* Organic warm gradient orb — purely decorative */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 h-[560px] w-[560px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #C4956A 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #C4604A 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <Link className="inline-block" href="/">
          <span className="eyebrow-light block mb-1">Dinner Waitlist</span>
          <span className="font-serif text-2xl leading-none text-white">kookwleigh</span>
        </Link>

        {/* Central editorial copy */}
        <PageTransition>
          <div className="max-w-sm">
            {/* Thin clay rule */}
            <div className="mb-7 h-px w-12" style={{ background: "rgb(196 149 106 / 0.5)" }} />
            <p className="eyebrow-light mb-4">Welcome back</p>
            <h1 className="font-serif text-5xl leading-[0.93] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]">
              Check your<br />place in line.
            </h1>
            <p className="subtitle-light mt-7">
              Enter the email address you used to join and we will bring up your spot.
            </p>
          </div>
        </PageTransition>

        {/* Bottom navigation */}
        <nav className="flex flex-col gap-2 text-sm text-white/35">
          <Link className="transition-colors hover:text-white/70" href="/join">
            Not on the list yet? Join the waitlist →
          </Link>
          <Link className="transition-colors hover:text-white/70" href="/">
            ← Back to home
          </Link>
        </nav>
      </div>

      {/* ── Right — form column ── */}
      <div className="flex flex-col justify-center bg-card px-8 py-12 sm:px-12 lg:px-14">
        <PageTransition delay={0.1}>
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-10">
              <p className="section-label mb-3">Access your table</p>
              <h2 className="font-serif text-2xl leading-snug text-foreground">
                Log in
              </h2>
            </div>
            <LoginForm />
          </div>
        </PageTransition>
      </div>

    </div>
  );
}
