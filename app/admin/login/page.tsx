import { ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { AdminLoginForm } from "@/components/admin-login-form";
import { PageTransition } from "@/components/page-transition";

export default function AdminLoginPage() {
  return (
    <main className="page-grid min-h-screen">
      <section className="flex flex-col justify-between gap-10">
        <BrandMark />
        <PageTransition>
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-4 font-serif text-6xl leading-none sm:text-7xl">
              Host console.
            </h1>
            <p className="subtitle mt-6">
              A private place to invite guests, open dinner slots, and keep the next meal tidy.
            </p>
            <div className="mt-8 grid max-w-md gap-3 text-sm text-foreground/70">
              <div className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-white/60 px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-sage" />
                Protected by the admin password in your environment.
              </div>
            </div>
          </div>
        </PageTransition>
      </section>
      <PageTransition delay={0.08}>
        <section className="section-frame self-start bg-card/90">
          <div className="mb-7">
            <p className="eyebrow">Host sign in</p>
            <h2 className="mt-2 font-serif text-3xl">Open the dinner board</h2>
          </div>
          <AdminLoginForm />
        </section>
      </PageTransition>
    </main>
  );
}
