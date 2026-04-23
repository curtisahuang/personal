"use client";
import { useRef, useState } from "react";
import { Summary, Header, Footer, SideSlogan, Chicken } from "./components/";
import { Inter } from "next/font/google";
import downChevron from "../assets/down-chevron.svg";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  const [showChicken, setShowChicken] = useState(false);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const scrollToElement = () => footerRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="pt-10 sm:pt-16">
      <div className="text-center px-4 sm:px-6">
        <div className="min-h-screen justify-center items-center flex-col relative overflow-x-hidden">
          <span className="hidden md:block pointer-events-none">
            <SideSlogan />
          </span>
          <Chicken showChicken={showChicken} />
          <button
            onClick={() => setShowChicken(!showChicken)}
            aria-pressed={showChicken}
            aria-label="Toggle decorative chicken"
            className="max-w-full"
          >
            <h1 className={`pb-8 sm:pb-12 tracking-tighter text-[clamp(3rem,10vw,6rem)] ${inter.className}`}>
              curtis alexander huang
            </h1>
          </button>
          <Header />
          <Summary />
          <div className="w-full flex items-center flex-col pt-8 sm:pt-10 pb-4 sm:pb-8">
            <button onClick={scrollToElement} aria-label="Scroll to footer">
              <Image
                className="scale-110 hover:scale-125 transition-transform duration-500"
                src={downChevron}
                height={35}
                alt="down-chevron"
              />
              <Image
                className="hover:scale-110 transition-transform duration-500"
                src={downChevron}
                height={35}
                alt="down-chevron"
              />
            </button>
          </div>
        </div>
        <div ref={footerRef}>
          <Footer />
        </div>
      </div>
    </main>
  );
};

export default Home;
