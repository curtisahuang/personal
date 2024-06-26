"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import Contact from "./Contact";

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
    <div className="h-[800px] pb-10 bg-[var(--background-color)] overflow-hidden">
      <motion.div
        style={{ y }}
        className="h-full bg-[var(--background-color)] flex flex-col justify-center gap-10 items-center p-10"
      >
        <Contact />
        <div className="flex flex-col sm:flex-row gap-10 items-center">
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
      </motion.div>
    </div>
  );
};

export default Footer;
