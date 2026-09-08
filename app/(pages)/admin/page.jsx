import React from "react";
import NavBar from "@/components/NavBar";
import { connect, serializeFirestoreData } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AdminContent from "@/components/AdminContent";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = session?.user?.role === "admin";

  // Only ever query Firestore, and only ever ship applicant data to the
  // client, when the server has already verified an admin session. The
  // previous version fetched every applicant unconditionally and relied on
  // a client-side role check to hide the UI -- but by then the full PII
  // dataset was already sent to the browser in the page payload for any
  // visitor, admin or not.
  let applicants = [];
  if (isAdmin) {
    const db = await connect();
    const snapshot = await db.collection("formData").get();
    applicants = snapshot.docs.map((doc) => ({
      id: doc.id,
      _id: doc.id,
      ...serializeFirestoreData(doc.data()),
    }));
  }

  return (
    <main>
      <NavBar />
      <AdminContent applicants={applicants} />
    </main>
  );
}
