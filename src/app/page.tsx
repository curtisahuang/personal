import Image from "next/image";
import { Inter } from "next/font/google";

import vaporwave from "../assets/vaporwave.png";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  return (
    <main className="pt-12">
      <div className="text-center">
        <h1 className={`pb-8 ${inter.className}`}>curtis alexander huang</h1>
        <div className="w-full flex justify-center pb-12 select-none">
          <Image
            src={vaporwave}
            width={500}
            height={500}
            alt="vaporwave.png"
            priority
          />
        </div>
        <h4>
          <em>creating robust, user-driven experiences</em>
        </h4>
        <h5>
          <a href="https://github.com/curtisahuang">github</a>
        </h5>
        <h5>
          <a href="https://instagram.com/curtisahuang">instagram</a>
        </h5>
        <h5>
          <a href="https://www.linkedin.com/in/curtisahuang/">linkedin</a>
        </h5>
      </div>
    </main>
  );
};

export default Home;
