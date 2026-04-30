"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Shippori_Mincho } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import styles from "./photoblog.module.css";

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const images = [
  "/assets/001.jpg",
  "/assets/002.jpg",
  "/assets/003.jpg",
  "/assets/004.jpg",
  "/assets/20191118_151121.jpg",
  "/assets/20230314_143140.jpg",
  "/assets/20230821_183727.jpg",
  "/assets/20231229_162432.jpg",
  "/assets/20260406_103022.jpg",
];

const initialSceneImages = images.slice(0, 3);

const getRandomSceneImages = () => {
  const shuffled = [...images];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, 3);
};

type CopyAlign = "left" | "right" | "center";
type CaptionSide = "left" | "right";

type Scene = {
  copy: string;
  word: string;
  caption: string;
  position: {
    left: string;
    top: string;
    translate: string;
    align: CopyAlign;
  };
  captionPosition: {
    side: CaptionSide;
    top: string;
  };
};

type SceneStyle = CSSProperties & {
  "--copy-left": string;
  "--copy-top": string;
  "--copy-translate": string;
  "--caption-top": string;
};

const scenes: Scene[] = [
  {
    copy: "You are",
    word: "beautiful",
    caption: "雲のすきま、月が笑っている",
    position: {
      left: "54vw",
      top: "58vh",
      translate: "-6%, 0",
      align: "right",
    },
    captionPosition: {
      side: "left",
      top: "16vh",
    },
  },
  {
    copy: "Please be",
    word: "lovely",
    caption: "星の雨、静かな庭に降る",
    position: {
      left: "4vw",
      top: "49vh",
      translate: "0, 0",
      align: "left",
    },
    captionPosition: {
      side: "right",
      top: "23vh",
    },
  },
  {
    copy: "today am i",
    word: "dreaming",
    caption: "遠い窓辺、風だけが踊る",
    position: {
      left: "56vw",
      top: "14vh",
      translate: "0, 0",
      align: "right",
    },
    captionPosition: {
      side: "left",
      top: "47vh",
    },
  },
  {
    copy: "Your heart is",
    word: "special",
    caption: "夜明け前、影は金色になる",
    position: {
      left: "33vw",
      top: "33vh",
      translate: "-28%, 0",
      align: "left",
    },
    captionPosition: {
      side: "right",
      top: "10vh",
    },
  },
  {
    copy: "Smile in the",
    word: "skytime",
    caption: "水色の夢、鳥はまだ眠らない",
    position: {
      left: "45vw",
      top: "67vh",
      translate: "-50%, 0",
      align: "center",
    },
    captionPosition: {
      side: "left",
      top: "30vh",
    },
  },
];

const PhotoblogPage = () => {
  const sceneRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const changeTimeoutRef = useRef<number | null>(null);
  const glitchTimeoutRef = useRef<number | null>(null);
  const initialShuffleRef = useRef<number | null>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [sceneImages, setSceneImages] = useState(initialSceneImages);
  const [copyAnimationKey, setCopyAnimationKey] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  const currentScene = scenes[activeScene];

  const keepCopyInView = useCallback(() => {
    const scene = sceneRef.current;
    const copyStack = copyRef.current;

    if (!scene || !copyStack) {
      return;
    }

    scene.style.setProperty("--copy-nudge-x", "0px");
    scene.style.setProperty("--copy-nudge-y", "0px");

    const margin = 16;
    const rect = copyStack.getBoundingClientRect();
    const nudgeX =
      Math.min(0, window.innerWidth - margin - rect.right) + Math.max(0, margin - rect.left);
    const nudgeY =
      Math.min(0, window.innerHeight - margin - rect.bottom) + Math.max(0, margin - rect.top);

    scene.style.setProperty("--copy-nudge-x", `${nudgeX}px`);
    scene.style.setProperty("--copy-nudge-y", `${nudgeY}px`);
  }, []);

  const clearTimers = useCallback(() => {
    if (changeTimeoutRef.current !== null) {
      window.clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }

    if (glitchTimeoutRef.current !== null) {
      window.clearTimeout(glitchTimeoutRef.current);
      glitchTimeoutRef.current = null;
    }

    if (initialShuffleRef.current !== null) {
      window.cancelAnimationFrame(initialShuffleRef.current);
      initialShuffleRef.current = null;
    }
  }, []);

  const nextScene = useCallback(() => {
    if (isChanging) {
      return;
    }

    setIsChanging(true);

    changeTimeoutRef.current = window.setTimeout(() => {
      setActiveScene((index) => (index + 1) % scenes.length);
      setSceneImages(getRandomSceneImages());
      setCopyAnimationKey((key) => key + 1);
      setIsChanging(false);
      setIsGlitching(true);

      glitchTimeoutRef.current = window.setTimeout(() => {
        setIsGlitching(false);
        window.requestAnimationFrame(keepCopyInView);
      }, 620);
    }, 180);
  }, [isChanging, keepCopyInView]);

  useEffect(() => {
    initialShuffleRef.current = window.requestAnimationFrame(() => {
      setSceneImages(getRandomSceneImages());
      initialShuffleRef.current = null;
    });

    window.addEventListener("resize", keepCopyInView);

    return () => {
      window.removeEventListener("resize", keepCopyInView);
      clearTimers();
    };
  }, [clearTimers, keepCopyInView]);

  useLayoutEffect(() => {
    window.requestAnimationFrame(keepCopyInView);
  }, [activeScene, keepCopyInView]);

  const sceneStyle: SceneStyle = {
    "--copy-left": currentScene.position.left,
    "--copy-top": currentScene.position.top,
    "--copy-translate": currentScene.position.translate,
    "--caption-top": currentScene.captionPosition.top,
  };

  return (
    <main
      ref={sceneRef}
      className={`${styles.scene} ${shipporiMincho.className} ${
        isChanging ? styles.isChanging : ""
      } ${isGlitching ? styles.isGlitching : ""}`}
      style={sceneStyle}
      data-align={currentScene.position.align}
      data-caption-side={currentScene.captionPosition.side}
      aria-label="Retro Japanese photo collage"
    >
      <section className={styles.collage} aria-hidden="true">
        {sceneImages.map((image, index) => (
          <figure className={styles.photo} key={`${image}-${index}`}>
            <Image
              src={image}
              alt=""
              fill
              unoptimized
              priority
              sizes={index === 0 ? "(max-width: 720px) 100vw, 54vw" : "(max-width: 720px) 100vw, 46vw"}
              className={styles.image}
            />
          </figure>
        ))}
      </section>

      <div
        ref={copyRef}
        className={styles.copyStack}
        aria-live="polite"
        key={copyAnimationKey}
      >
        <h1 className={styles.heading}>
          <span className={styles.headlineLine}>
            <span className={styles.copyPrefix}>{currentScene.copy}</span>
            <span className={styles.wordStack}>
              <span className={styles.wordEcho} aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    className={`${styles.duplicate} ${index > 0 ? styles[`duplicate${index + 1}`] : ""} ${
                      index === 4 ? styles.blue : ""
                    }`}
                    key={index}
                  >
                    {currentScene.word}
                  </span>
                ))}
              </span>
              <span className={styles.beautiful}>{currentScene.word}</span>
            </span>
          </span>
        </h1>
      </div>

      <p className={styles.caption} aria-live="polite">
        {currentScene.caption}
      </p>

      <button
        className={styles.screenButton}
        type="button"
        aria-label="Change collage and text"
        onClick={nextScene}
      />

      <Link
        href="/"
        className={styles.backButton}
        aria-label="Back to home page"
        onClick={(event) => event.stopPropagation()}
      >
        BACK
      </Link>
    </main>
  );
};

export default PhotoblogPage;
