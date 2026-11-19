import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mike Zhao | Portfolio",
    template: "%s | Mike Zhao Portfolio",
  },
  description:
    "Portfolio built with Next.js — about me, dynamically routed projects, and a server-side contact form.",
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about-me", label: "About Me" },
  { href: "/projects", label: "Projects" },
  { href: "/blogs", label: "Blogs" },
  { href: "/qa", label: "Q&A" },
  { href: "/contact-me", label: "Contact" },
  { href: "/contact-me-server-form", label: "Contact (Server)" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="site-header">
          <nav className="container nav">
            <Link href="/" className="brand">
              {"Mike Zhao"}
            </Link>
            <ul className="nav-links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        {children}
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
        <footer className="site-footer">
          <div className="container">
            <p>
              Built with Next.js · Santa Clara University · ISBA 2438 — 2026
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
