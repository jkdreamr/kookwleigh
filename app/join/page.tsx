import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { JoinForm } from "@/components/join-form";
import { PageTransition } from "@/components/page-transition";

export default function JoinPage() {
  return (
    <main className="page-grid min-h-screen">
      <section className="flex flex-col justify-between gap-10">
        <BrandMark />
        <PageTransition>
          <div>
            <p className="eyebrow">Join our table</p>
            <h1 className="mt-4 font-serif text-6xl leading-none sm:text-7xl">
              Save your seat in line.
            </h1>
            <p className="subtitle mt-6">
              Add the details Josh and Leigh should know before inviting you for dinner.
            </p>
          </div>
        </PageTransition>
        <Link className="text-sm text-foreground/60 hover:text-foreground" href="/login">
          Already joined? Log in with your email.
        </Link>
      </section>
      <PageTransition delay={0.08}>
        <section className="section-frame self-start">
          <JoinForm />
        </section>
      </PageTransition>
    </main>
  );
}
