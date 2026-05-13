import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "kookwleigh",
};

export default function Home() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative flex min-h-[92vh] overflow-hidden bg-[#1a150f]">
        {/* Background image — fallback to dark bg above if it fails to load */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=2200&q=80')",
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-[#16120e]/50" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 flex w-full flex-col justify-between px-5 py-6 sm:px-8 lg:px-12">

          {/* Nav */}
          <nav className="flex items-center justify-between text-white">
            <BrandMark href="/" light />
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                asChild
                className="text-white/80 hover:bg-white/10 hover:text-white"
                size="sm"
                variant="ghost"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="hidden text-white/70 hover:bg-white/10 hover:text-white sm:inline-flex"
                size="sm"
                variant="ghost"
              >
                <Link href="/admin/login">
                  <Lock className="h-3.5 w-3.5" />
                  Host
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/join">Join the list</Link>
              </Button>
            </div>
          </nav>

          {/* Hero copy */}
          <PageTransition>
            <div className="mb-12 max-w-4xl text-white">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-white/55">
                By invitation
              </p>
              <h1 className="font-serif text-7xl leading-[0.92] sm:text-8xl lg:text-[9rem]">
                kookwleigh
              </h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-white/75 sm:text-lg">
                A small dinner table for people we love. Josh and Leigh cook — you show up hungry.
                Get on the list and we will reach out when a seat opens.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/join">
                    Join the waitlist
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                  size="lg"
                  variant="outline"
                >
                  <Link href="/login">Already on the list</Link>
                </Button>
              </div>
            </div>
          </PageTransition>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto grid max-w-5xl gap-5 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-3">
        {[
          [
            "01",
            "Join and tell us about yourself",
            "Add your name, email, any allergies, and the flavours you love. It helps us cook for you.",
          ],
          [
            "02",
            "Wait for your invitation",
            "When a dinner window opens, we work through the list and send you a personal invite.",
          ],
          [
            "03",
            "Pick a date and come hungry",
            "Choose from available evenings or suggest your own. We will confirm and see you soon.",
          ],
        ].map(([number, title, copy]) => (
          <div
            className="rounded-xl border border-foreground/10 bg-white/65 p-6 shadow-editorial"
            key={number}
          >
            <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-powder text-xs font-semibold tracking-wide">
              {number}
            </div>
            <h2 className="font-serif text-xl leading-snug">{title}</h2>
            <p className="mt-3 text-sm leading-[1.75] text-foreground/60">{copy}</p>
          </div>
        ))}
      </section>

      {/* ── Bottom CTA strip ── */}
      <section className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-foreground/10 bg-card/80 px-7 py-7 shadow-editorial sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow mb-2">One table at a time</p>
            <h2 className="font-serif text-2xl sm:text-3xl">
              Intimate dinners, whenever the calendar allows.
            </h2>
          </div>
          <div className="shrink-0">
            <Button asChild size="lg">
              <Link href="/join">
                Get on the list
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-foreground/8 px-5 pb-10 pt-8 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="font-serif text-lg">kookwleigh</span>
            <p className="mt-1 text-xs text-foreground/40">
              A private dinner table by Josh and Leigh.
            </p>
          </div>
          <div className="flex items-center gap-5 text-sm text-foreground/45">
            <Link className="hover:text-foreground transition-colors" href="/login">
              Log in
            </Link>
            <Link className="hover:text-foreground transition-colors" href="/join">
              Join the list
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
