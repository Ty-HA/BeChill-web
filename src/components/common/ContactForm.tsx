"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { motion } from "framer-motion";

const parentVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const btnPop = {
  hidden: { opacity: 0, scale: 0.93 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export default function ContactForm() {
  const addContact = useMutation(api.contact.addContact);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await addContact({ email });
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <section
      id="ContactForm"
      className="container max-w-full mx-auto px-4 py-14 min-h-10 items-center justify-center flex flex-col"
    >
      {/* Titre pleine largeur */}
      <motion.p
        className="text-2xl mb-8 md:text-3xl md:mb-8 text-lavender-400 font-sans font-light text-center w-full max-w-full mx-auto"
        initial="hidden"
        whileInView="show"
        variants={fadeInUp}
        viewport={{ once: true, amount: 0.6 }}
      >
        Enter your email to be notified when our mobile app launches!
      </motion.p>

      {/* Bloc cascade pour le form et le feedback */}
      <motion.div
        className="w-full max-w-sm mx-auto"
        variants={parentVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full"
        >
          <motion.input
            id="email"
            type="email"
            required
            className="rounded-3xl py-2 px-6 focus:outline-none font-sans bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            variants={fadeInUp}
          />
          <motion.button
            type="submit"
            className="text-xs md:text-sm text-white py-3 font-monument font-bold rounded-3xl uppercase cursor-pointer shadow-xs transition tracking-wider"
            style={{ backgroundColor: "#540CCC", color: "#FFFF4F" }}
            disabled={status === "loading"}
            variants={btnPop}
            whileHover={{
              scale: 1.06,
              boxShadow: "0 0 0.8rem #FFFF4F",
              transition: { type: "spring", stiffness: 250, damping: 14 },
            }}
            whileTap={{ scale: 0.97 }}
          >
            {status === "loading" ? "Sending..." : "Notify me"}
          </motion.button>
        </form>

        {status === "success" && (
          <motion.p
            className="text-lavender-400 text-center font-sans mt-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Thank you! We'll notify you when BeChill mobile launches
          </motion.p>
        )}
        {status === "error" && (
          <motion.p
            className="text-red-600 text-center font-sans mt-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Error. Please try again later.
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
