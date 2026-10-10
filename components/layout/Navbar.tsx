"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "Solutions", href: "#solutions" },
  { label: "How it works", href: "#how-it-works" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-ivory/95 backdrop-blur-sm border-b border-forest/8 shadow-editorial"
          : "bg-transparent"
      )}
    >
      <nav
        className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 rounded-sm"
          aria-label="Braco OmniPulse home"
        >
          <span className="w-7 h-7 rounded-md bg-forest flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <circle cx="10" cy="10" r="7" stroke="#B39A67" strokeWidth="1.2" />
              <ellipse cx="10" cy="10" rx="4" ry="7" stroke="#DCE5D9" strokeWidth="0.8" strokeOpacity="0.7" />
              <ellipse cx="10" cy="10" rx="7" ry="2.5" stroke="#DCE5D9" strokeWidth="0.8" strokeOpacity="0.5" />
              <circle cx="13" cy="8" r="1.2" fill="#B39A67" />
            </svg>
          </span>
          <span className="font-serif font-semibold text-forest text-lg leading-none tracking-tight">
            Braco <span className="text-brass">OmniPulse</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="px-4 py-2 text-sm font-medium text-graphite/70 hover:text-forest
                         rounded-md transition-colors duration-150 hover:bg-sage/60
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="primary" size="sm">Get started</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-graphite hover:bg-sage/60 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-ivory border-t border-forest/8 px-6 py-4 space-y-1 shadow-editorial-lg animate-fade-in">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="block px-3 py-2.5 text-sm font-medium text-graphite/80 hover:text-forest rounded-md hover:bg-sage/60 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2.5">
            <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="md" fullWidth>Sign in</Button>
            </Link>
            <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="md" fullWidth>Get started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
