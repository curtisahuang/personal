"use client";

import { useEffect, useMemo, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import vaporwave from "@/assets/vaporwave.png";
import { Caption } from "../components/";

type CaptionPosition = "right" | "left" | "center";

type Photo = {
  id: number;
  src: StaticImageData;
  alt: string;
  caption?: string;
  captionColor?: string;
  captionPosition?: CaptionPosition;
};

const PhotoblogPage = () => {
  // 16 placeholder items using the same image for now
  const photos: Photo[] = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        src: vaporwave,
        alt: `photoblog-${i + 1}`,
        caption: "why oh just why",
        captionColor: "#ffffff",
        captionPosition: "right",
      })),
    []
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Track viewport for fitting the image size
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 0,
    h: typeof window !== "undefined" ? window.innerHeight : 0,
  }));
  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Compute fitted size for active image
  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;
  const fitted = useMemo(() => {
    if (!activePhoto) return null;
    const data = activePhoto.src as StaticImageData;
    const nw = data.width || 1200;
    const nh = data.height || 800;
    const maxW = viewport.w ? viewport.w * 0.95 : nw;
    const maxH = viewport.h ? viewport.h * 0.85 : nh;
    const scale = Math.min(maxW / nw, maxH / nh);
    return { width: Math.round(nw * scale), height: Math.round(nh * scale) };
  }, [activePhoto, viewport]);

  // Close on ESC only (keyboard navigation disabled)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const open = (index: number) => setActiveIndex(index);
  const close = () => setActiveIndex(null);

  return (
    <main className="m-0 p-0 min-h-[100svh] w-screen bg-[#578b92]">
      {/* Scrollable viewport containing a square thumbnail grid */}
      <div className="scroll-area w-screen h-[100svh] overflow-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full gap-0 m-0 p-0">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              aria-label={`Open image ${i + 1}`}
              className="overflow-hidden opacity-0 fade-in group cursor-pointer"
              style={{ animationDelay: `${i * 90}ms` }}
              onClick={() => open(i)}
            >
              {/* Shared element for zoom transition; square cell */}
              <motion.div
                layoutId={`photo-${photo.id}`}
                className="relative w-full aspect-square"
                transition={{ type: "tween", ease: "easeOut", duration: 0.22 }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width:1280px) 12.5vw, (min-width:1024px) 16.66vw, (min-width:768px) 25vw, (min-width:640px) 33.33vw, 50vw"
                  className="object-cover select-none"
                  priority={i < 12}
                />
              </motion.div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox overlay with fade; content uses shared element zoom */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8"
            onClick={close}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              layoutId={`photo-${photos[activeIndex].id}`}
              className="relative"
              style={{ width: fitted?.width, height: fitted?.height }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: "tween", ease: "easeOut", duration: 0.22 }}
            >
              <Image
                src={photos[activeIndex].src}
                alt={photos[activeIndex].alt}
                width={
                  fitted?.width ||
                  (activePhoto ? (activePhoto.src as StaticImageData).width : 800)
                }
                height={
                  fitted?.height ||
                  (activePhoto ? (activePhoto.src as StaticImageData).height : 600)
                }
                className="h-full w-full object-contain select-none"
                priority
              />

              {/* Caption on photo */}
              <Caption
                text={photos[activeIndex].caption ?? "why oh just why"}
                color={photos[activeIndex].captionColor ?? "#ffffff"}
                position={photos[activeIndex].captionPosition ?? "right"}
              />

              {/* Close */}
              <button
                className="absolute top-3 right-3 text-white/90 hover:text-white text-2xl leading-none"
                onClick={close}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </main>
  );
};

export default PhotoblogPage;