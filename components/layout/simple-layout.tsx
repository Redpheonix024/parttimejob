import type React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import SimpleFooter from "@/components/layout/simple-footer";

interface SimpleLayoutProps {
  children: React.ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
}

export default function SimpleLayout({
  children,
  backLink,
}: SimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Parttimejob
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        {backLink && <BackLink href={backLink.href} label={backLink.label} />}
        {children}
      </main>

      <SimpleFooter />
    </div>
  );
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2 h-4 w-4"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
      {label}
    </Link>
  );
}
