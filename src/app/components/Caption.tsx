type CaptionPosition = "right" | "left" | "center";

export default function Caption({
  text,
  color = "#ffffff",
  position = "right",
}: {
  text: string;
  color?: string;
  position?: CaptionPosition;
}) {
  // Default: vertically centered, horizontally aligned to the right
  const base =
    "absolute top-1/2 -translate-y-1/2 text-right text-white drop-shadow-md";
  const positionClasses =
    position === "right"
      ? "right-4 md:right-6 text-right"
      : position === "left"
      ? "left-4 md:left-6 text-left"
      : "left-1/2 -translate-x-1/2 text-center";

  return (
    <div
      className={`${base} ${positionClasses}`}
      style={{ color }}
      aria-label="Caption"
    >
      <span className="text-xl md:text-3xl font-medium">{text}</span>
    </div>
  );
}