"use client";

import Image from "next/image";

export default function MobileAppPromo() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-8 font-serif">
        📱 Coming soon
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="w-full max-w-xs">
          <Image
            src="/img/mobile1.png"
            alt="Chill app screen 1"
            width={300}
            height={600}
         
          />
        </div>
        <div className="w-full max-w-xs">
          <Image
            src="/img/mobile2.png"
            alt="Chill app screen 2"
            width={300}
            height={600}
            
          />
        </div>
        <div className="w-full max-w-xs">
          <Image
            src="/img/mobile3.png"
            alt="Chill app screen 3"
            width={300}
            height={600}
      
          />
        </div>
      </div>
    </section>
  );
}
