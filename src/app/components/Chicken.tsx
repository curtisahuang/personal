"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import chicken from "../../assets/chicken.png";

const Chicken = ({ showChicken }: { showChicken: boolean }) => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setShouldReduceMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return (
    <div
      className={`absolute top-20 ${shouldReduceMotion ? "" : "transition-all duration-300"} ${
        showChicken ? `left-[-16rem] rotate-45` : `left-[-30rem]`
      }`}
    >
      <Image src={chicken} alt="chicken.png" height={500} />
    </div>
  );
};

export default Chicken;
