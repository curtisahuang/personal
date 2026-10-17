import { ImageResponse } from "next/og";

// Mirrors --left-bg-color / --right-bg-color in globals.css
export const PURPLE = "#bb56ff";
export const PINK = "#ffabb9";

const NAME = "curtis alexander huang";

// Satori needs a raw TTF/OTF; Google Fonts serves TTF to non-browser user agents
async function loadInter(text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Inter:wght@600&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

const splitBackground = (left: string, right: string) =>
  `linear-gradient(90deg, ${left} 50%, ${right} 50%)`;

// Plain purple|pink split, for icons too small to fit the name
export const renderColorSquare = (size: number) =>
  new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: splitBackground(PURPLE, PINK),
      }}
    />,
    { width: size, height: size }
  );

// Recreates the homepage <h1>: split background with the inverse split clipped into the text
export const renderNameCard = async (size: { width: number; height: number }) => {
  const fontSize = Math.round(size.width * 0.07);
  const shadow = Math.max(2, Math.round(fontSize / 12));
  const inter = await loadInter(NAME);

  // Full-width so the gradient split lines up with the background split, like the <h1>
  const textLayer = {
    position: "absolute",
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    fontFamily: inter ? "Inter" : undefined,
    fontWeight: 600,
    fontSize,
    letterSpacing: "-0.05em",
  } as const;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        background: splitBackground(PURPLE, PINK),
      }}
    >
      {/* Satori paints text-shadow over clipped text, so the white shadow is its own layer */}
      <div
        style={{
          ...textLayer,
          color: "#ffffff",
          transform: `translate(${shadow}px, ${shadow}px)`,
        }}
      >
        {NAME}
      </div>
      <div
        style={{
          ...textLayer,
          backgroundImage: splitBackground(PINK, PURPLE),
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {NAME}
      </div>
    </div>,
    {
      ...size,
      fonts: inter ? [{ name: "Inter", data: inter, weight: 600, style: "normal" }] : undefined,
    }
  );
};
