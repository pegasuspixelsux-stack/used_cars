"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Calculator, ArrowLeftRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import FinancingCalculator from "./FinancingCalculator";
import TradeInForm from "./TradeInForm";

type Tab = "financing" | "trade-in";

const TABS: Array<{ id: Tab; label: string; icon: typeof Calculator }> = [
  { id: "financing", label: "Calculadora de financiación", icon: Calculator },
  { id: "trade-in", label: "Cotizar mi usado", icon: ArrowLeftRight },
];

export default function InteractiveTools() {
  const [activeTab, setActiveTab] = useState<Tab>("financing");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="tools" className="border-b border-hairline py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <h2 className="text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
            Calcule antes de decidir
          </h2>
          <p className="mt-3 max-w-md text-ink-400">
            Simule su financiación o cotice su auto actual en segundos, sin
            compromiso.
          </p>
        </ScrollReveal>

        <div className="relative mt-10 inline-flex flex-wrap gap-1 rounded-full border border-hairline bg-obsidian-900 p-1.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                className="relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="tools-tab-highlight"
                    className="absolute inset-0 z-0 rounded-full bg-champagne-400"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: "spring", bounce: 0.15, duration: 0.5 }
                    }
                  />
                )}
                <span
                  className={
                    isActive
                      ? "relative z-10 flex items-center gap-2 text-black"
                      : "relative z-10 flex items-center gap-2 text-ink-300"
                  }
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === "financing" ? <FinancingCalculator /> : <TradeInForm />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
