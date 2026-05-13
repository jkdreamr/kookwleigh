import type { Metadata } from "next";
import Link from "next/link";
import { JoinForm } from "@/components/join-form";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Join the waitlist",
};

export default function JoinPage() {
  return (
    <div className="auth-grid">

      {/* ── Left — dark editorial panel ── */}
      <div className="panel-dark relative flex flex-col justify-between overflow-hidden px-10 py-10 lg:px-16 lg:py-14">

        {/* Organic warm gradient orbs — purely decorative */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-20 h-[600px] w-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #C4956A 0%, transparent 68%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full opacity-[0.04]"
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
            <p className="eyebrow-light mb-4">Get on the list</p>
            <h1 className="font-serif text-5xl leading-[0.93] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]">
              Save your<br />seat at the<br />table.
            </h1>
            <p className="subtitle-light mt-7">
              Tell us a bit about yourself and what you love to eat. We will reach out personally when a dinner window opens.
            </p>

            {/* Three-step mini list */}
            <div className="mt-10 space-y-4 border-t border-white/8 pt-8">
              {[
                ["01", "Join and tell us about yourself"],
                ["02", "Wait for your personal invitation"],
                ["03", "Pick a date and come hungry"],
              ].map(([n, t]) => (
                <div className="flex items-start gap-4" key={n}>
                  <span className="mt-0.5 text-[10px] font-medium tabular-nums text-white/25">{n}</span>
                  <span className="text-sm leading-relaxed text-white/50">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </PageTransition>

        {/* Bottom navigation */}
        <nav className="flex flex-col gap-2 text-sm text-white/35">
          <Link className="transition-colors hover:text-white/70" href="/login">
            Already on the list? Log in →
          </Link>
          <Link className="transition-colors hover:text-white/70" href="/">
            ← Back to home
          </Link>
        </nav>
      </div>

      {/* ── Right — form column ── */}
      <div className="flex flex-col justify-center bg-card px-8 py-12 sm:px-12 lg:px-14 overflow-y-auto">
        <PageTransition delay={0.1}>
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <p className="section-label mb-3">Your details</p>
              <h2 className="font-serif text-2xl leading-snug text-foreground">
                Join the list
              </h2>
            </div>
            <JoinForm />
          </div>
        </PageTransition>
      </div>

    </div>
  );
}
