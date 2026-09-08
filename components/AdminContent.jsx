"use client";
import React from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import DataTable from "./DataTable";

const StatusScreen = ({ title, description, action }) => (
  <div className="flex min-h-[60vh] items-center justify-center px-4">
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
      <p className="mb-2 text-2xl font-semibold">{title}</p>
      <p className="mb-6 text-muted-foreground">{description}</p>
      {action}
    </div>
  </div>
);

const AdminContent = ({ applicants }) => {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const isSignedIn = !!user;
  const isAdmin = user?.role === "admin";

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <StatusScreen
        title="Authentication Required"
        description="Please sign in to access the admin panel."
        action={
          <Button className="w-full" onClick={() => (window.location.href = "/auth/signin")}>
            Sign In
          </Button>
        }
      />
    );
  }

  if (!isAdmin) {
    return (
      <StatusScreen
        title="Access Denied"
        description="You are not authorized to view this page."
      />
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <span className="text-xs font-medium uppercase tracking-widest text-primary">
          Admin
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
        <p className="text-muted-foreground">
          {applicants.length} total application{applicants.length === 1 ? "" : "s"}
        </p>
      </div>
      <DataTable data={applicants} />
    </div>
  );
};

export default AdminContent;
