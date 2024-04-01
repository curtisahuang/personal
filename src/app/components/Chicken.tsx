"use client";
import Image from "next/image";
import chicken from "../../assets/chicken.png";

const Chicken = ({ showChicken }: { showChicken: boolean }) => {
  return (
    <div
      className={`absolute top-20 transition-all duration-1000 ${
        showChicken ? `left-[-16rem] rotate-45` : `left-[-30rem]`
      }`}
    >
      <Image src={chicken} alt="chicken.png" height={500} />
    </div>
  );
};

export default Chicken;
