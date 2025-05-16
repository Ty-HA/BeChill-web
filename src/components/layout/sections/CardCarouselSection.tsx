"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";

export function CardCarouselSection() {
  const cards = [
    {
      id: 1,
      text: "Portfolio may dip, but your assets outperformance the market, it is still a win—own it!",
      bgColor: "bg-white",
    },
    {
      id: 2,
      text: "You're 42% closer to your staking goal. Just a few more epochs to your 80 chill score goal.",
      bgColor: "bg-pink-100",
    },
    {
      id: 3,
      text: "Your weekend on-chain cost you 0.4 SOL. But that meme NFT? Priceless.",
      bgColor: "bg-orange-100",
    },
    {
      id: 4,
      text: "It’s not the coffee. It’s the tokens you ape into while waiting for coffee.",
      bgColor: "bg-green-100",
    },
    {
      id: 5,
      text: "Congrats on your gains! Lock in some now and take profits in tiers—nobody nails the top.",
      bgColor: "bg-blue-100",
    },
    {
      id: 6,
      text: "Weekdays you’re DeFi disciplined. Weekends? You’re full-on Degen.",
      bgColor: "bg-purple-100",
    },
  ];

  const duplicatedCards = [...cards, ...cards];
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScrollTop.current;
      if (Math.abs(delta) > 5) {
        setScrollDirection(delta > 0 ? "down" : "up");
        lastScrollTop.current = currentScroll;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const controls1 = useAnimation();
  const controls2 = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    if (!inView) return;
    if (scrollDirection === "down") {
      controls1.start({
        x: ["0%", "-50%"],
        transition: { repeat: Infinity, duration: 100, ease: "linear" },
      });
      controls2.start({
        x: ["-50%", "0%"],
        transition: { repeat: Infinity, duration: 100, ease: "linear" },
      });
    } else {
      controls1.start({
        x: ["-50%", "0%"],
        transition: { repeat: Infinity, duration: 100, ease: "linear" },
      });
      controls2.start({
        x: ["0%", "-50%"],
        transition: { repeat: Infinity, duration: 100, ease: "linear" },
      });
    }
  }, [inView, scrollDirection]);

  const renderRow = (items: typeof cards, controls: any, reverse?: boolean) => (
    <motion.div
      animate={controls}
      className="flex gap-4 w-max will-change-transform"
      style={{ flexDirection: reverse ? "row-reverse" : "row" }}
    >
      {items.map((card, i) => (
        <motion.div
          key={`${card.id}-${i}`}
          className="w-72 shrink-0 z-10 relative overflow-visible"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="overflow-visible">
            <Card
              className={`${card.bgColor} shadow-md rounded-xl overflow-visible h-48`}
            >
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="text-lg">{card.text}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div ref={ref} className="font-sans text-xl font-light overflow-x-hidden relative md:py-4 py-2 mt-8">
      <div className="space-y-4">
        {/* Ligne 1 */}
        <div className="overflow-visible">
          {renderRow(duplicatedCards, controls1)}
        </div>

        {/* Ligne 2 */}
        <div className="overflow-visible">
          {renderRow(duplicatedCards, controls2, true)}
        </div>
      </div>

      <div className="text-center mt-16 mb-2 mx-4">
        <motion.p
          className="text-2xl mb-8 md:text-3xl md:mb-4 text-lavender-400 font-sans font-light"
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Finally — crypto vibes that don’t wreck your peace of mind.
        </motion.p>
       
      </div>
    </div>
  );
}
