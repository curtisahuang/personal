"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode, useState } from "react";
import { flushSync } from "react-dom";

type Direction = "left" | "right";

type SwipeLinkProps = {
  children: ReactNode;
  className?: string;
  direction: Direction;
  href: string;
};

type ViewTransition = {
  finished: Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

export default function SwipeLink({ children, className, direction, href }: SwipeLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    if (isNavigating) {
      return;
    }

    const transitionDocument = document as ViewTransitionDocument;

    if (
      !transitionDocument.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      router.push(href);
      return;
    }

    setIsNavigating(true);
    document.documentElement.dataset.swipeDirection = direction;

    const transition = transitionDocument.startViewTransition(() => {
      flushSync(() => router.push(href));
    });

    transition.finished.finally(() => {
      delete document.documentElement.dataset.swipeDirection;
      setIsNavigating(false);
    });
  };

  return (
    <Link className={className} href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}
