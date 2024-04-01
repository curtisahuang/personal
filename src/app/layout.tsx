import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const poppins = Raleway({ subsets: ["latin"], weight: "500" });

export const metadata: Metadata = {
  title: "Curtis Alexander Huang",
  description: "Creating responsive, UX-driven experiences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
