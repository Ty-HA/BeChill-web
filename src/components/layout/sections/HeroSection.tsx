import React, { useState } from "react";
import EmojiLogo from "@/components/common/EmojiLogo";
import { motion } from "framer-motion";
import WalletStatus from "@/components/common/WalletStatus";
import ConnectWalletButton from "@/components/common/ConnectWalletButton";
import JoinTheWaitingListButton from "@/components/common/JoinTheWaitingListButton";
import { J } from "vitest/dist/chunks/reporters.d.DG9VKi4m.js";

type HeroSectionProps = {
  userWallet: string | null;
  onLogin: () => void;
  onLogout: () => void;
  walletReviewed: boolean;
};


export default function HeroSection({
  userWallet,
  onLogin,
  onLogout,
}: HeroSectionProps) {
  const [showComingSoon, setShowComingSoon] = useState(false);
  return (
    <section className="container mx-auto px-4 py-16 min-h-10 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center w-full max-w-3xl">
        <div className="flex justify-center mb-6 items-center">
          <div className="relative mr-3">
            <EmojiLogo size="lg" trackMouse={true} />
          </div>
        </div>

        <h1 className="md:text-6xl text-4xl mb-8 text-lavender-400 font-serif font-normal">
          <span className="block">Talk to your wallet</span>
          <span>not a spreadsheet</span>
        </h1>
        <motion.p
          className="text-2xl mb-8 md:text-3xl md:mb-12 text-lavender-400 font-sans font-light"
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Real insights. Smart moves. Chill vibes only.
        </motion.p>



        <JoinTheWaitingListButton/>
      </div>
    </section>
  );
}
