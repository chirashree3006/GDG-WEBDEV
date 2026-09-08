"use client";
import React from "react";
import { authClient } from "@/lib/auth-client";
import DataTable from "./DataTable";

const AdminContent = ({ applicants }) => {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const isSignedIn = !!user;
  const isAdmin = user?.role === "admin";

  if (isPending) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <div>
        <h2>Authentication Required</h2>
        <p>Please sign in to access the admin panel.</p>
        <button type="button" onClick={() => (window.location.href = "/auth/signin")}>
          Sign In
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return <div>Access Denied! You are not authorized to view this webpage.</div>;
  }

  return (
    <div>
      <DataTable data={applicants} />
    </div>
  );
};

export default AdminContent;
