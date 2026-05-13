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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "kookwleigh Waitlist",
    template: "%s | kookwleigh Waitlist",
  },
  description:
    "An editorial dinner guest waitlist for Josh and Leigh's cooking table.",
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
