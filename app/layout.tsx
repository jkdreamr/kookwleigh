import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ChunkErrorReloader } from "@/components/chunk-error-reloader";
import { Toaster } from "@/components/toast";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "kookwleigh",
    template: "%s · kookwleigh",
  },
  description:
    "A dinner table waitlist for friends and family. Small, thoughtful, and cooked by Josh and Leigh.",
  openGraph: {
    type: "website",
    siteName: "kookwleigh",
    title: "kookwleigh — Josh and Leigh's dinner table",
    description:
      "A small dinner waitlist for people who want to eat something thoughtful and cozy with Josh and Leigh. Join the list.",
    url: appUrl,
  },
  twitter: {
    card: "summary",
    title: "kookwleigh — dinner table waitlist",
    description:
      "A small dinner waitlist for people who want to eat something thoughtful and cozy with Josh and Leigh.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} antialiased`}>
        <ChunkErrorReloader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
