import Image from "next/image";
import vaporwave from "../assets/vaporwave.png";
import { Inter, Poppins } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  return (
    <main className="pt-12">
      <div className="text-center">
        <h1 className={`pb-8 ${inter.className}`}>Curtis Alexander Huang</h1>
        <div className="w-full flex justify-center pb-12">
          <Image src={vaporwave} width={500} height={500} alt="vaporwave.png" />
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
