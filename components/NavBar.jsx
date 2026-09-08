"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import UserButton from "./UserButton";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const NavBar = () => {
  const router = useRouter();

  // Use Better Auth's useSession hook directly
  const { data: session, isPending } = authClient.useSession();

  const [userSessionEmail, setUserSessionEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAdminPermissions, setHasAdminPermissions] = useState(false);
  const [navigationRouteList, setNavigationRouteList] = useState([]);
  const [scrollElevation, setScrollElevation] = useState(0);

  // Update header elevation based on scroll offset
  useEffect(() => {
    const handleWindowScroll = () => {
      setScrollElevation(window.scrollY);
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  // Sync user email from current session
  useEffect(() => {
    if (session?.user?.email) {
      setUserSessionEmail(session.user.email);
    } else {
      setUserSessionEmail("");
    }
  }, [session]);

  // Derive authentication state
  useEffect(() => {
    setIsAuthenticated(Boolean(userSessionEmail));
  }, [userSessionEmail]);

  // Check admin role permissions
  useEffect(() => {
    setHasAdminPermissions(session?.user?.role === "admin");
  }, [isAuthenticated, session]);

  // Build navigation items list
  useEffect(() => {
    const baseItems = [{ label: "Departments", href: "/departments" }];
    if (isAuthenticated && hasAdminPermissions) {
      baseItems.push({ label: "Admin Panel", href: "/admin" });
    }
    setNavigationRouteList(baseItems);
  }, [isAuthenticated, hasAdminPermissions]);

  // Prepare user profile payload snapshot
  const activeUserDataSnapshot = session?.user ? JSON.parse(JSON.stringify(session.user)) : null;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrollElevation > 24 ? "glass border-b border-border" : "border-b border-transparent"
      }`}
    >
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>
            Recruitment<span className="text-gradient">2026</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navigationRouteList.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isPending ? (
            <span className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : !isAuthenticated ? (
            <Button size="sm" onClick={() => router.push("/auth/signin")}>
              Sign In
            </Button>
          ) : (
            <UserButton user={activeUserDataSnapshot} />
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
