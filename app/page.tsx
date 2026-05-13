import Link from "next/link";
import { ArrowRight, CalendarDays, Lock, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative flex min-h-[92vh] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=2200&q=85')",
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-[#16120e]/45" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 flex w-full flex-col justify-between px-5 py-6 sm:px-8 lg:px-12">
          <nav className="flex items-center justify-between text-white">
            <BrandMark href="/" />
            <div className="flex items-center gap-2">
              <Button asChild className="text-white hover:bg-white/10 hover:text-white" size="sm" variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="text-white hover:bg-white/10 hover:text-white" size="sm" variant="ghost">
                <Link href="/admin/login">
                  <Lock className="h-3.5 w-3.5" />
                  Host
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/join">Join</Link>
              </Button>
            </div>
          </nav>

          <PageTransition>
            <div className="mb-12 max-w-4xl text-white">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Join our table
              </div>
              <h1 className="font-serif text-7xl leading-none sm:text-8xl lg:text-9xl">
                kookwleigh
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
                A small dinner waitlist for people who want to eat something thoughtful,
                cozy, and probably a little experimental with Josh and Leigh.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/join">
                    Join the Waitlist
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">I am already in line</Link>
                </Button>
              </div>
            </div>
          </PageTransition>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-14 pt-6 sm:px-8 lg:grid-cols-3">
        {[
          ["01", "Tell us your food notes", "Allergies, cravings, and little preferences stay with your guest record."],
          ["02", "Wait for the invite", "Josh and Leigh invite guests from the queue when a dinner window opens."],
          ["03", "Choose a cozy slot", "Pick an open date or request another time from your dashboard."],
        ].map(([number, title, copy]) => (
          <div className="rounded-lg border border-foreground/10 bg-white/65 p-5 shadow-editorial" key={number}>
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-powder text-sm font-semibold">
              {number}
            </div>
            <h2 className="font-serif text-2xl">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/65">{copy}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid gap-4 rounded-lg border border-foreground/10 bg-card/80 p-5 shadow-editorial md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow">Current rhythm</p>
            <h2 className="mt-2 font-serif text-3xl">Small dinners, soft calendar.</h2>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white/65 px-4 py-3 text-sm">
            <CalendarDays className="h-4 w-4 text-accent" />
            One table at a time
          </div>
        </div>
      </section>
    </main>
  );
}
