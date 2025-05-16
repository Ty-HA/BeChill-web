"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { motion } from "framer-motion";

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
      className="flex-col container mx-auto px-6 py-16 min-h-10 flex items-center justify-center"
    >
      <motion.p
        className="text-2xl mb-8 md:text-3xl md:mb-8 text-lavender-400 font-sans font-light text-center"
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Enter your email to be notified when our mobile app launches!
      </motion.p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mx-auto">
        <input
          id="email"
          type="email"
          required
          className="rounded-3xl py-2 px-6 focus:outline-none font-sans bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
        <button
          type="submit"
          className="text-xs md:text-sm text-white py-3 font-monument font-bold rounded-3xl uppercase cursor-pointer shadow-xs transition hover:scale-105 tracking-wider"
          style={{ backgroundColor: "#540CCC", color: "#FFFF4F" }}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Notify me"}
        </button>
        {status === "success" && (
          <p className=" text-lavender-400 text-center font-sans">
            Thank you! We'll notify you when BeChill mobile launches
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-center font-sans">
            Error. Please try again later.
          </p>
        )}
      </form>
    </section>
  );
}
