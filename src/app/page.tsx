import Image from "next/image";
import { Inter } from "next/font/google";

import vaporwave from "../assets/vaporwave.png";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  return (
    <main className="pt-12 pb-20">
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
        <h4 className="pb-5">
          <em>
            creating robust, user-driven experiences with typescript (and fun)
          </em>
        </h4>
        <h5>
          <a
            className="hover-underline-animation"
            href="https://github.com/curtisahuang"
          >
            <strong>github</strong>
          </a>
        </h5>
        <h5>
          <a
            className="hover-underline-animation"
            href="https://instagram.com/curtisahuang"
          >
            <strong>instagram</strong>
          </a>
        </h5>
        <h5>
          <a
            className="hover-underline-animation"
            href="https://www.linkedin.com/in/curtisahuang/"
          >
            <strong>linkedin</strong>
          </a>
        </h5>
      </div>
    </main>
  );
};

export default Home;
