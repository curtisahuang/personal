"use client";
import { Summary, Header, Footer, SideSlogan, Chicken } from "./components/";
import { useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  const [showChicken, setShowChicken] = useState(false);

  return (
    <main className="pt-16">
      <div className="text-center">
        <div className="min-h-screen">
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
        </div>
        <Footer />
      </div>
    </main>
  );
};

export default Home;
