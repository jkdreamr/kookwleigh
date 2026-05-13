import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin-login-form";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Host login",
};

export default function AdminLoginPage() {
  return (
    <div className="auth-grid">

      {/* ── Left — dark editorial panel ── */}
      <div className="panel-dark relative flex flex-col justify-between overflow-hidden px-10 py-10 lg:px-16 lg:py-14">

        {/* Warm radial orbs — decorative */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-20 h-[520px] w-[520px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #C4956A 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full opacity-[0.04]"
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
            <div className="mb-7 h-px w-12" style={{ background: "rgb(196 149 106 / 0.5)" }} />
            <p className="eyebrow-light mb-4">Host access</p>
            <h1 className="font-serif text-5xl leading-[0.93] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]">
              The host<br />console.
            </h1>
            <p className="subtitle-light mt-7">
              Invite guests, open dinner slots, and manage the waitlist — all in one private place.
            </p>
          </div>
        </PageTransition>

        {/* Bottom nav */}
        <nav className="flex flex-col gap-2 text-sm text-white/35">
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
              <p className="section-label mb-3">Hosts only</p>
              <h2 className="font-serif text-2xl leading-snug text-foreground">
                Sign in
              </h2>
            </div>
            <AdminLoginForm />
          </div>
        </PageTransition>
      </div>

    </div>
  );
}
