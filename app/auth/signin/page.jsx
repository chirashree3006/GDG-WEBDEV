"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import DWASFWLoader from "@/components/GDGLoader";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage-grotesque",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <DWASFWLoader />;
  }

  if (session?.user) {
    return (
      <div className="min-h-screen bg-[#0d0d11] flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-sm text-zinc-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setIsRedirecting(true);
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      if (res?.error) {
        toast.error(res.error.message || "Could not sign in with Google.");
        setIsRedirecting(false);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsRedirecting(false);
    }
  };

  return (
    <main
      className={`${bricolageGrotesque.variable} ${spaceGrotesk.variable} min-h-screen bg-[#0d0d11] flex items-center justify-center px-4`}
    >
      <Card className="w-full max-w-md bg-[#141418] border-white/10 text-white">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="font-[family-name:var(--font-bricolage-grotesque)] text-3xl">
            Recruitment 2026
          </CardTitle>
          <CardDescription className="font-[family-name:var(--font-space-grotesk)] text-zinc-400">
            Sign in with your VIT email to start your application.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-3 bg-white text-black hover:bg-zinc-200 h-12"
            onClick={handleGoogleSignIn}
            disabled={isRedirecting}
          >
            <FcGoogle size={20} />
            {isRedirecting ? "Redirecting to Google..." : "Continue with Google"}
          </Button>
          <p className="text-xs text-zinc-500 text-center">
            Use your official VIT email address. Accounts are not created with any other method.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
