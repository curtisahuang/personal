import Image from "next/image";
import { Inter } from "next/font/google";

import vaporwave from "../../assets/vaporwave.png";

const inter = Inter({ subsets: ["latin"] });

const Header = () => {
  return (
    <div>
      <h1 className={`pb-12 tracking-tighter ${inter.className}`}>
        curtis alexander huang
      </h1>
      <div className="w-full flex justify-center pb-20 select-none">
        <Image
          src={vaporwave}
          width={500}
          height={500}
          alt="vaporwave.png"
          priority
        />
      </div>
    </div>
  );
};

export default Header;
