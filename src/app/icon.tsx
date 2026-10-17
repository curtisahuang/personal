import { renderColorSquare } from "./_brand/brandImage";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return renderColorSquare(size.width);
}
