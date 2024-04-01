import Image from "next/image";

import vaporwave from "../../assets/vaporwave.png";

const Header = () => {
  return (
    <div>
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
