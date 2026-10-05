"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserNav } from "@/components/layout/UserNav";
import { KeyRound } from "lucide-react";

interface NavbarProps {
  onOpenByokModal?: () => void;
  remainingScans?: number;
  maxScans?: number;
}

export function Navbar({ onOpenByokModal, remainingScans = 3, maxScans = 3 }: NavbarProps) {
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleByokClick = () => {
    if (onOpenByokModal) {
      onOpenByokModal();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-byok-modal"));
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "RESUME CHECK", href: "/analyze" },
    { name: "INDIA JOBS", href: "/analyze#jobs" },
    { name: "PEERS", href: "/directory" },
  ];

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border-light dark:border-border-dark bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left Cluster: Brand & Navigation */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex flex-col">
              <span className="font-serif text-2xl tracking-tight text-text-primaryLight dark:text-text-primaryDark leading-none">
                Resume<span className="italic">OS</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-text-mutedLight dark:text-text-mutedDark mt-1">
                India Engine
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs tracking-[0.18em] uppercase font-bold transition-colors ${
                    isActive
                      ? "text-text-primaryLight dark:text-text-primaryDark"
                      : "text-text-mutedLight dark:text-text-mutedDark hover:text-text-primaryLight dark:hover:text-text-primaryDark"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Cluster (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={handleByokClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-mutedLight dark:text-text-mutedDark hover:bg-surface-elevatedLight dark:hover:bg-surface-elevatedDark transition-all group"
            title="Configure Custom Groq API Key (BYOK)"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>
              <span className="font-bold text-text-primaryLight dark:text-text-primaryDark">{remainingScans}</span>/{maxScans} Free
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-surface-elevatedLight dark:bg-surface-elevatedDark text-text-mutedLight dark:text-text-mutedDark">
              BYOK
            </span>
          </button>

          <ThemeToggle />
          <UserNav />
        </div>

        {/* Mobile Toggle & Theme (Mobile only) */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-text-primaryLight dark:text-text-primaryDark hover:bg-surface-elevatedLight dark:hover:bg-surface-elevatedDark focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark shadow-xl flex flex-col p-4 gap-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm tracking-[0.15em] uppercase font-bold transition-colors block py-2 border-b border-border-light dark:border-border-dark ${
                    isActive
                      ? "text-text-primaryLight dark:text-text-primaryDark"
                      : "text-text-mutedLight dark:text-text-mutedDark hover:text-text-primaryLight dark:hover:text-text-primaryDark"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleByokClick}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-xs font-mono font-medium border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primaryLight dark:text-text-primaryDark"
            >
              <KeyRound className="w-4 h-4 text-text-mutedLight dark:text-text-mutedDark" />
              <span>
                <span className="font-bold">{remainingScans}</span>/{maxScans} Free Scans
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-surface-elevatedLight dark:bg-surface-elevatedDark text-text-mutedLight dark:text-text-mutedDark">
                BYOK
              </span>
            </button>
            <div className="w-full flex justify-center">
              <UserNav />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
