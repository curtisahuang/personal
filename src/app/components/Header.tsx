import Image from "next/image";
import Link from "next/link";

import vaporwave from "../../assets/vaporwave.png";

const Header = () => {
  return (
    <div>
      <div className="w-full flex justify-center pb-12">
        <Link href="/photoblog" aria-label="Open photoblog">
          <Image
            className="cursor-pointer"
            src={vaporwave}
            width={500}
            height={500}
            alt="vaporwave.png"
            priority
          />
        </Link>
      </div>
    </div>
  );
};

export default Header;
