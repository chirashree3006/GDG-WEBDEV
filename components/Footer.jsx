"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = [
  { name: "Home", path: "/" },
  { name: "Departments", path: "/departments" },
];

const Footer = () => {
  const currentYearString = new Date().getFullYear().toString();

  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          Organization &middot; Recruitment Portal
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {footerLinks.map((link) => (
            <Link key={link.path} href={link.path} className="transition-colors hover:text-foreground">
              {link.name}
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">&copy; {currentYearString}</p>
      </div>
    </footer>
  );
};

export default Footer;
