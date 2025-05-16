function XIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 32 32"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="16" fill="#540CCC" />
      <path
        d="M19.643 9.143h2.571l-5.243 5.952 6.19 7.762h-4.866l-3.814-4.858-4.366 4.858h-2.577l5.58-6.202-6.002-7.512h4.864l3.627 4.737 4.236-4.737zm-1.024 11.426h1.424l-4.007-5.155-1.436 1.613 4.019 5.155z"
        fill="#fff"
      />
    </svg>
  );
}

export default function FollowUsOnTwitter() {
  return (
    <section className="max-w-md mx-auto mt-8 flex flex-col items-center gap-4">
    <span className="inline-flex items-center">
  <a
    href="https://twitter.com/bechillxyz"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2" // Flex horizontal, gap entre texte et icône
  >
    <span className="text-4xl font-semibold font-serif">Follow us on</span>
    <XIcon />
  </a>
</span>


      <p className="text-gray-600 text-xl text-center font-sans text-lavender-400">
        Stay tuned for the latest updates!
      </p>
    </section>
  );
}
