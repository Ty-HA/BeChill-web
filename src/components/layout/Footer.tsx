import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-lavender-400 mt-24" style={{ backgroundColor: "#3C0891" }}>
      <div className="mx-auto px-4 py-16 text-center text-white text-sm space-y-4 font-sans">
        <p>© 2025 BeChill. All rights reserved. Powered by Solana.</p>
        <div className="text-white flex justify-center gap-4 text-xs">
          <Link href="/legal-notice" className="hover:underline">
            Legal Notice
          </Link>
          <span>|</span>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <span>|</span>
          <Link href="/terms" className="hover:underline">
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
  );
}

