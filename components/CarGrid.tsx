"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import CarCard from "./CarCard";
import type { Vehicle } from "@/lib/types";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function CarGrid({ vehicles }: { vehicles: Vehicle[] }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.ul
      initial={shouldReduceMotion ? undefined : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-80px" }}
      variants={container}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {vehicles.map((vehicle) => (
        <motion.li key={vehicle.id} variants={item}>
          <CarCard vehicle={vehicle} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
