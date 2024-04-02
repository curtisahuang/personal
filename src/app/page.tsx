"use client";
import { useState } from "react";
import { Summary, Header, Footer, SideSlogan, Chicken } from "./components/";
import { Inter } from "next/font/google";
import downChevron from "../assets/down-chevron.svg";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  const [showChicken, setShowChicken] = useState(false);

  return (
    <main className="pt-16">
      <div className="text-center">
        <div className="min-h-screen justify-center items-center flex-col">
          <span className="hidden md:block">
            <SideSlogan />
          </span>
          <Chicken showChicken={showChicken} />
          <button onClick={() => setShowChicken(!showChicken)}>
            <h1 className={`pb-12 tracking-tighter ${inter.className}`}>
              curtis alexander huang
            </h1>
          </button>
          <Header />
          <Summary />
          <div className="w-full flex items-center flex-col pt-10 pb-4 sm:pb-8">
            <Image
              className="scale-110 hover:scale-125 transition-all duration-500"
              src={downChevron}
              height={35}
              alt="down-chevron"
            />
            <Image
              className="hover:scale-110 transition-all duration-500"
              src={downChevron}
              height={35}
              alt="down-chevron"
            />
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
};

export default Home;
