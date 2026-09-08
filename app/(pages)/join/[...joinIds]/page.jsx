"use client";
// React import
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
// Constant import
import { reviews } from "@/constants/index";

// Component imports
import NavBar from "@/components/NavBar";
import FormComp from "@/components/FormComp";
import Footer from "@/components/Footer";
import DWASFWLoader from "@/components/GDGLoader";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const JoinDepartmentPage = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Use Better Auth's useSession hook directly
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const isSignedIn = !!user;

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <main>
        <NavBar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <DWASFWLoader />
        </div>
        <Footer />
      </main>
    );
  }

  const departments = reviews.filter((dept) =>
    params.joinIds.includes(dept.id),
  );
  const ids = params.joinIds;

  const valid = ids.every(
    (id) => reviews.some((dept) => dept.id === id) || id.startsWith("clerk_"),
  );

  if (!valid) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <NavBar />
      <div>
        {isSignedIn ? (
          <FormComp
            dept1={departments[0]}
            dept2={departments[1]}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
              <p className="mb-2 text-2xl font-semibold">Authentication Required</p>
              <p className="mb-6 text-muted-foreground">
                Please sign in to access the application form.
              </p>
              <Button className="w-full" onClick={() => router.push("/auth/signin")}>
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default JoinDepartmentPage;
