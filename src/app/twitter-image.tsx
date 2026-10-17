import { renderNameCard } from "./_brand/brandImage";

export const alt = "Curtis Alexander Huang";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return renderNameCard(size);
}
