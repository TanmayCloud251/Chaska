import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { AuthProvider } from "../lib/auth";
import LoginSheet from "../components/LoginSheet";
import BottomNav from "../components/BottomNav";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-baloo",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Chaska — Rajnandgaon's Food Discovery Guide",
  description: "Discover the best chai tapris, samosa stalls, and cafés in Rajnandgaon through community-moderated reviews.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="font-body bg-background text-foreground min-h-screen antialiased">
        <AuthProvider>
          <main className="max-w-md mx-auto min-h-screen relative flex flex-col bg-background shadow-warm border-x border-border pb-20">
            {children}
            <BottomNav />
          </main>
          <LoginSheet />
        </AuthProvider>
      </body>
    </html>
  );
}
