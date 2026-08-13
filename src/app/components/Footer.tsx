"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import Link from "next/link";
import Contact from "./Contact";
import SwipeLink from "./SwipeLink";

const Footer = () => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end end"],
  });

  return (
    <div ref={container}>
      <SocialLinks scrollProgress={scrollYProgress} />
    </div>
  );
};

const SocialLinks = ({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}): React.JSX.Element => {
  const y = useTransform(scrollProgress, [0, 1], [-225, 0]);

  return (
    <div className="h-[100vh] pb-10 bg-(--background-color) overflow-hidden">
      <motion.div
        style={{ y }}
        className="h-full bg-(--background-color) flex flex-col justify-center gap-4 items-center p-4"
      >
        <Contact />
        <div className="flex flex-row gap-10 items-center">
          <h5>
            <a className="hover-underline-animation" href="https://github.com/curtisahuang">
              <strong>github</strong>
            </a>
          </h5>
          <h5>
            <a className="hover-underline-animation" href="https://instagram.com/curtisahuang">
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
        <div className="flex flex-row gap-10 items-center">
          <SwipeLink className="hover-underline-animation" direction="left" href="/teaching">
            <h5>
              <strong>teaching</strong>
            </h5>
          </SwipeLink>
          <h5>
            <a className="hover-underline-animation" href="https://dashboard.curtisahuang.com">
              <strong>dashboard</strong>
            </a>
          </h5>
        </div>
        <h5 className="text-center">
          <Link className="hover-underline-animation" href="/games-and-toys">
            <strong>lil&apos; games & toys</strong>
          </Link>
        </h5>
        <div className="flex flex-row gap-10 items-center">
          <h6>
            <strong>other stuff:</strong>
          </h6>
          <h6>
            <a className="hover-underline-animation" href="https://hollyhlchan.com">
              <strong>holly hl chan</strong>
            </a>
          </h6>
          <h6>
            <a className="hover-underline-animation" href="https://arcdepear.com">
              <strong>arc de pear</strong>
            </a>
          </h6>
        </div>
      </motion.div>
    </div>
  );
};

export default Footer;
