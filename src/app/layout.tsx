import type { Metadata } from "next";
import Link from "next/link";
import "@/app/globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AuthNavAction } from "@/components/AuthNavAction";

export const metadata: Metadata = {
  title: "Digital Business Card Deck",
  description: "Capture paper business cards and build a searchable digital deck."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        <nav>
          <Link href="/">Capture</Link>
          <Link href="/cards">Cards</Link>
          <Link href="/settings">Settings</Link>
          <AuthNavAction />
        </nav>
        <OfflineBanner />
        <main>{children}</main>
      </body>
    </html>
  );
}