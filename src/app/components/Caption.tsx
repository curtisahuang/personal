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

export default function Caption({
  text,
  color = "#ffffff",
  position = "right",
}: {
  text: string;
  color?: string;
  position?: CaptionPosition;
}) {
  // Base overlay: absolute over the image
  const base = "absolute text-white drop-shadow-md";

  const positionClasses =
    position === "right"
      ? "top-1/2 -translate-y-1/2 right-4 md:right-6 text-right"
      : position === "left"
      ? "top-1/2 -translate-y-1/2 left-4 md:left-6 text-left"
      : position === "center"
      ? "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-center"
      : position === "topRight"
      ? "top-4 md:top-6 right-4 md:right-6 text-right"
      : position === "topLeft"
      ? "top-4 md:top-6 left-4 md:left-6 text-left"
      : position === "top"
      ? "top-4 md:top-6 left-1/2 -translate-x-1/2 text-center"
      : position === "bottomRight"
      ? "bottom-4 md:bottom-6 right-4 md:right-6 text-right"
      : position === "bottomLeft"
      ? "bottom-4 md:bottom-6 left-4 md:left-6 text-left"
      : "bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 text-center"; // bottom

  return (
    <div className={`${base} ${positionClasses}`} style={{ color }} aria-label="Caption">
      <span className="text-xl md:text-3xl font-medium whitespace-pre-line">
        {text}
      </span>
    </div>
  );
}