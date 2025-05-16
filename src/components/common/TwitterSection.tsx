import { motion } from "framer-motion";

export default function FollowUsOnTwitter() {
  return (
    <section className="container mx-auto px-4 py-14 min-h-10 items-center justify-center flex flex-col">
      <span className="inline-flex items-center shadow-xs transition hover:scale-105 tracking-wider">
  <a
    href="https://twitter.com/bechillxyz"
    target="_blank"
    rel="noopener noreferrer"
    className="flex gap-2 items-baseline" // <-- LA CLÉ !
  >
    <span className="md:text-6xl text-4xl mb-4 md:mb-6 text-lavender-400 font-serif font-normal ">
      Follow us on
    </span>
    <img
      src="/img/icons/X.svg"
      alt="Twitter X"
      className="w-10 h-8 md:w-18 md:h-12 align-baseline" // Ajoute align-baseline pour assurer l’alignement côté img
      style={{ display: "inline-block" }}
    />
  </a>
</span>
<motion.p
        className="text-2xl mb-8 md:text-3xl md:mb-8 text-lavender-400 font-sans font-light text-center"
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Stay tuned for the latest updates!
      </motion.p>

      
    </section>
  );
}
