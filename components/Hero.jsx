"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Particles from "@/components/magicui/particles";
import CountdownTimer from "@/components/common/CountdownTimer";
import { Button } from "@/components/ui/button";
import { reviews } from "@/constants";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-bg absolute inset-0" />
      <Particles
        className="absolute inset-0"
        quantity={90}
        ease={70}
        color="#3b82f6"
        staticity={40}
      />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-8 py-24 text-center"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Applications open now &middot; {reviews.length} departments
        </motion.span>

        <motion.h1
          variants={item}
          className="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          Recruitment <span className="text-gradient">2026</span>
        </motion.h1>

        <motion.p variants={item} className="max-w-xl text-lg text-muted-foreground sm:text-xl">
          Ready to make your mark? Join our departments and work on real-world
          projects. Your journey starts here.
        </motion.p>

        <motion.div variants={item}>
          <Button asChild size="lg" className="group glow-ring-sm gap-2">
            <Link href="/departments">
              Join us
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-4 rounded-2xl border border-border bg-card/60 px-6 py-4"
        >
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
            Applications close in
          </p>
          <CountdownTimer />
        </motion.div>
      </motion.div>
    </section>
  );
}
