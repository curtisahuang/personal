"use client";
import { useRef } from "react";
import styles from "./SideSlogan.module.css";

const SideSlogan = () => {
  const plane = useRef<HTMLDivElement>(null);

  const maxRotate = 45;

  const manageMouseMove = (e: React.MouseEvent) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    const perspective = window.innerWidth * 4;
    const rotateX = maxRotate * x - maxRotate / 2;
    const rotateY = (maxRotate * y - maxRotate / 2) * -1;
    if (plane.current) {
      plane.current.style.transform = `perspective(${perspective}px) rotateX(${rotateY}deg) rotateY(${rotateX}deg)`;
    }
  };

  return (
    <div
      onMouseMove={(e: React.MouseEvent) => {
        manageMouseMove(e);
      }}
    >
      <div ref={plane} className="absolute top-80 right-[10%] z-0">
        <Text3D primary="creating" secondary="delivering" />
        <Text3D primary="concepts" secondary="products" />
        <Text3D primary="from" secondary="with" />
        <Text3D primary="design" secondary="code" />
      </div>
    </div>
  );
};

const Text3D = ({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) => {
  return (
    <div className={styles.textContainer}>
      <p className={styles.primary}>{primary}</p>
      <p className={styles.secondary}>{secondary}</p>
    </div>
  );
};

export default SideSlogan;
