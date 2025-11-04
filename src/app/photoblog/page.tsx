"use client";

import { useEffect, useMemo, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import vaporwave from "@/assets/vaporwave.png";
import { Caption } from "../components/";
import { useRouter } from "next/navigation";

type CaptionPosition =
  | "right"
  | "left"
  | "center"
  | "topRight"
  | "topLeft"
  | "top"
  | "bottomRight"
  | "bottomLeft"
  | "bottom";

type Photo = {
  id: number;
  src: string | StaticImageData;
  alt: string;
  caption?: string;
  captionColor?: string;
  captionPosition?: CaptionPosition;
};

// Load photo config from JSON (edit src/app/photoblog/photos.json)
import photosConfig from "./photos.json";
type PhotoEntry = {
  src?: string;
  filename?: string;
  alt?: string;
  caption?: string;
  captionColor?: string;
  captionPosition?: CaptionPosition;
};

const PhotoblogPage = () => {
  // Build from JSON with graceful fallback to placeholder
  const dynamicPhotos: Photo[] = useMemo(() => {
    const entries = (photosConfig as PhotoEntry[]) ?? [];
    return entries.map((entry, i) => ({
      id: i,
      // Prefer explicit src; else assume files live under /assets in public
      src: entry.src ?? (entry.filename ? `/assets/${entry.filename}` : vaporwave),
      alt: entry.alt ?? `photoblog-${i + 1}`,
      caption: entry.caption ?? "why oh just why",
      captionColor: entry.captionColor ?? "#ffffff",
      captionPosition: entry.captionPosition ?? "right",
    }));
  }, []);

  const desiredCount = 24;
  const photos: Photo[] = useMemo(() => {
    if (dynamicPhotos.length >= desiredCount) {
      return dynamicPhotos.slice(0, desiredCount).map((p, i) => ({ ...p, id: i }));
    }
    // Fill remaining slots with placeholder
    return Array.from({ length: desiredCount }, (_, i) => {
      const existing = dynamicPhotos[i];
      return (
        existing ?? {
          id: i,
          src: vaporwave,
          alt: `photoblog-${i + 1}`,
          caption: "why oh just why",
          captionColor: "#ffffff",
          captionPosition: "right",
        }
      );
    });
  }, [dynamicPhotos]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;
  const fitted = useMemo(() => {
    if (!activePhoto) return null;
    const isStatic = typeof activePhoto.src === "object";
    const data = isStatic ? (activePhoto.src as StaticImageData) : null;
    const nw = data?.width ?? 1200;
    const nh = data?.height ?? 800;
    const maxW = viewport.w ? viewport.w * 0.95 : nw;
    const maxH = viewport.h ? viewport.h * 0.85 : nh;
    const scale = Math.min(maxW / nw, maxH / nh);
    return { width: Math.round(nw * scale), height: Math.round(nh * scale) };
  }, [activePhoto, viewport]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const open = (index: number) => setActiveIndex(index);
  const close = () => setActiveIndex(null);

  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <main className="m-0 p-0 min-h-svh w-screen bg-[#578b92]">
      <div className="scroll-area w-screen h-svh overflow-auto pb-20 md:pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full gap-0 m-0 p-0">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              aria-label={`Open image ${i + 1}`}
              className="overflow-hidden opacity-0 fade-in group cursor-pointer"
              style={{ animationDelay: `${i * 90}ms` }}
              onClick={() => open(i)}
            >
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

              <Caption
                text={photos[activeIndex].caption ?? "why oh just why"}
                color={photos[activeIndex].captionColor ?? "#ffffff"}
                position={photos[activeIndex].captionPosition ?? "right"}
              />

              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#578b92]">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={handleBack}
            className="text-white/90 hover:text-white text-sm md:text-base font-medium"
            aria-label="Back"
            title="Back"
          >
            ← Back
          </button>
        </div>
      </footer>

      </main>
  );
};

export default PhotoblogPage;