import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

export default function FollowUsOnTwitter() {
  return (
    <section className="container mx-auto px-4 py-14 min-h-10 items-center justify-center flex flex-col">
      <motion.a
        href="https://twitter.com/bechillxyz"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-baseline transition hover:scale-105 tracking-wider group mb-6 md:mb-8"
        variants={fadeInUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        style={{ textDecoration: "none" }}
      >
        <span className="md:text-6xl text-4xl text-lavender-400 font-serif font-normal align-baseline">
          Follow us on
        </span>
        <img
          src="/img/icons/X.svg"
          alt="Twitter X"
          className="w-10 h-8 md:w-18 md:h-12 ml-3 align-baseline"
          style={{ display: "inline-block" }}
        />
      </motion.a>
      <motion.p
        className="text-2xl mb-8 md:text-3xl md:mb-8 text-lavender-400 font-sans font-light text-center"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.28, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.1 }}
      >
        Stay tuned for the latest updates!
      </motion.p>
    </section>
  );
}
