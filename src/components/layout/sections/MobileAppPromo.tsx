"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const parentVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export default function MobileAppPromo() {
  return (
    <section className="container mx-auto px-4 py-8 text-center">
      <motion.div
        variants={parentVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.h2
          className="md:text-6xl text-4xl mb-2 text-lavender-400 font-serif font-normal"
          variants={fadeInUp}
        >
          Coming soon
        </motion.h2>
        <motion.h2
          className="md:text-6xl text-4xl mb-12 text-lavender-400 font-serif font-normal"
          variants={fadeInUp}
        >
          BeChill mobile launch 🚀
        </motion.h2>

        {/* Responsive layout: vertical on mobile, overlapping horizontal on desktop */}
        <div className="flex flex-col md:flex-row items-center justify-center md:space-x-6 space-y-6 md:space-y-0">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-48 sm:w-56 md:w-60"
              variants={fadeInUp}
            >
              <Image
                src={`/img/mobile${i}.png`}
                alt={`Chill app screen ${i}`}
                width={250}
                height={500}
                className="w-full h-auto"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
