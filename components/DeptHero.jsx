"use client";

import React, { useEffect } from "react";
import { Switch } from "@/components/ui/switch";

const DeptHero = ({ dept, setPhotoQs, photoQs, isLoading, setIsLoading }) => {
  useEffect(() => {
    if (typeof setIsLoading === "function") {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  return (
    <section className="container py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {!photoQs ? dept.name : "Video Editing"}
      </h1>
      {dept.body && <p className="mt-3 text-muted-foreground">{dept.body}</p>}
      {dept.name === "Photography" && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Switch checked={photoQs} onCheckedChange={() => setPhotoQs(!photoQs)} />
          <span className="text-sm text-muted-foreground">Switch to Video Editing?</span>
        </div>
      )}
    </section>
  );
};

export default DeptHero;
