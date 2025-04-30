import { Card, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";

export function CardCarouselSection() {
  const cards = [
    {
      id: 1,
      text: "You swapped $3,200 last month... and paid $3,271 in gas. Almost a break-even DAO life.",
      bgColor: "bg-white",
    },
    {
      id: 2,
      text: "You're 42% closer to your staking goal. Just a few more epochs to chill status.",
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
      text: "Your net worth increased by one JPEG this month. Still alive, still rare.",
      bgColor: "bg-blue-100",
    },
    {
      id: 6,
      text: "Weekdays you’re DeFi disciplined. Weekends? You’re full-on Degen.",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="py-10 overflow-hidden font-serif">
      <div className="container mx-auto px-4">
        {[0, 1].map((rowIndex) => (
          <div
            key={rowIndex}
            className={`flex flex-wrap md:flex-nowrap gap-4 justify-center ${rowIndex === 1 ? "mt-4" : ""}`}
          >
            {cards.slice(rowIndex * 3, rowIndex * 3 + 3).map((card, i) => (
              <motion.div
                key={card.id}
                className="w-full md:w-1/3 mb-4 md:mb-0"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 * (rowIndex * 3 + i), duration: 0.6, ease: "easeOut" }}
              >
                <Card className={`${card.bgColor} h-full shadow-md rounded-xl`}>
                  <CardContent className="p-6">
                    <p className="text-lg">{card.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <div className="text-center mt-16 mb-8">
        <motion.p
          className="text-lg font-semibold"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Finally — crypto vibes that don’t wreck your peace of mind.
        </motion.p>
        <div className="mt-2 flex justify-center">
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-bounce"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <path
              d="M12 5V19M12 19L5 12M12 19L19 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>
      </div>
    </div>
  );
}
