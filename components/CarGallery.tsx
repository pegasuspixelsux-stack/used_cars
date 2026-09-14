"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/format";

export default function CarGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-3xl border border-hairline bg-obsidian-900">
        <ImageOff size={28} className="text-ink-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-hairline bg-obsidian-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority={active === 0}
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <li key={image} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Foto ${index + 1}`}
                aria-current={active === index}
                className={cn(
                  "relative block h-16 w-24 overflow-hidden rounded-xl border transition-colors",
                  active === index ? "border-champagne-400" : "border-hairline hover:border-hairline-strong",
                )}
              >
                <Image src={image} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
