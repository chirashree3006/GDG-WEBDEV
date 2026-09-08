import React from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import DeptHero from "@/components/DeptHero";
import { ArrowRight } from "lucide-react";

const features = [
    {
        name: "∑_ApZ3V_gh",
        description:
            "k*N$5c fu900Q 7k3 C20Z!g 1kL1d3er & nUKpZg %AU0₹g!ir3C.",
        href: "/join/7349e360-afdf-476d-9af8-20d680067f0b",
        cta: "Apply",
    },
    {
        name: "µ_Wb₹5D_lp",
        description:
            "bp05Lb(bTI, CZWSr₹#^Z *7J ^T( f391xQ 1kp #q₹X 3z!Kux 6j(IkL.",
        href: "/join/2bd84c7a-ee2a-48b7-9568-6a4b094d3618",
        cta: "Apply",
    },
];

const page = () => {
    return (
        <main className="min-h-screen">
            <NavBar />
            <DeptHero dept={{ name: "Development Departments" }} />

            <div className="container pb-16">
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {features.map((feature) => (
                        <li
                            key={feature.name}
                            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
                        >
                            <h2 className="text-lg font-semibold">{feature.name}</h2>
                            <p className="flex-1 text-sm text-muted-foreground">{feature.description}</p>
                            <Link
                                href={feature.href}
                                className="group inline-flex w-fit items-center gap-1 text-sm font-medium text-primary"
                            >
                                {feature.cta}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};

export default page;
