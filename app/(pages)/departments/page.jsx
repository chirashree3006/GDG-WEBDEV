"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { reviews } from "@/constants";
import { ArrowForward, CheckCircle } from "@material-symbols-svg/react/outlined";
import { Button } from "@/components/ui/button";

import { useSubmissions } from "@/components/SubmissionsProvider";

const departments = reviews;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const DepartmentsListPage = () => {
  const router = useRouter();
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const { submittedDepartments } = useSubmissions();

  const [selectedCount, setSelectedCount] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(2);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isContinueDisabled, setIsContinueDisabled] = useState(true);

  useEffect(() => {
    setSelectedCount(selectedDepartments.length);
  }, [selectedDepartments]);

  useEffect(() => {
    setRemainingSlots(2 - submittedDepartments.length);
  }, [submittedDepartments]);

  useEffect(() => {
    const ids = departments
      .filter((dept) => selectedDepartments.includes(dept.name))
      .map((dept) => dept.id);
    setSelectedIds(ids);
  }, [selectedDepartments]);

  useEffect(() => {
    setIsContinueDisabled(selectedIds.length === 0);
  }, [selectedIds]);

  const toggleDepartment = (departmentName) => {
    if (submittedDepartments.includes(departmentName)) {
      toast.error(`You have already submitted an application for ${departmentName}.`);
      return;
    }

    if (remainingSlots <= 0) {
      toast.error("You have already submitted the maximum allowed (2) applications.");
      return;
    }

    setSelectedDepartments((current) => {
      const isSelected = current.includes(departmentName);

      if (isSelected) {
        return current.filter((name) => name !== departmentName);
      }

      if (current.length >= remainingSlots) {
        toast.error(`You can select at most ${remainingSlots} department(s).`);
        return current;
      }

      return [...current, departmentName];
    });
  };

  const goToApplication = () => {
    if (!selectedIds.length) return;
    router.push(`/join/${selectedIds.join("/")}`);
  };

  const DepartmentCard = ({ department }) => {
    const isSelected = selectedDepartments.includes(department.name);
    const isSubmitted = submittedDepartments.includes(department.name);
    const Icon = department.icon;
    const tone = department.tone || "#3b82f6";

    return (
      <motion.button
        type="button"
        variants={cardVariant}
        whileHover={!isSubmitted ? { y: -4 } : undefined}
        onClick={() => toggleDepartment(department.name)}
        disabled={isSubmitted}
        aria-pressed={isSelected}
        className={`group relative flex h-full flex-col gap-4 rounded-2xl border p-6 text-left transition-colors ${
          isSubmitted
            ? "cursor-not-allowed border-border bg-card/40 opacity-60"
            : isSelected
            ? "border-primary bg-card glow-ring-sm"
            : "border-border bg-card hover:border-primary/50"
        }`}
      >
        <div className="flex items-start justify-between">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${tone}22`, color: tone }}
          >
            {Icon && <Icon width={22} height={22} />}
          </span>
          <AnimatePresence>
            {isSelected && !isSubmitted && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-primary"
              >
                <CheckCircle width={22} height={22} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold leading-snug">{department.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
            {department.description}
          </p>
        </div>

        {isSubmitted && (
          <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            Already submitted
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <main className="min-h-screen">
      <NavBar />

      <div className="container py-12">
        <header className="mb-10 flex flex-col gap-4">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            Step 01 &middot; Select
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pick your departments
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Select up to <strong className="text-foreground">two</strong> departments you&apos;d like to apply for.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <span className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium">
              {selectedCount} / 2 selected
            </span>
            <Button
              onClick={goToApplication}
              disabled={isContinueDisabled}
              className="group gap-2"
            >
              Continue to application
              <ArrowForward
                width={16}
                height={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Button>
          </div>
        </header>

        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {departments.map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))}
        </motion.section>
      </div>

      <Footer />
    </main>
  );
};

export default DepartmentsListPage;
