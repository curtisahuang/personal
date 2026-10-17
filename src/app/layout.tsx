import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Curtis Alexander Huang",
  description: "Full-stack Developer | Creating responsive, UX-driven experiences",
  metadataBase: new URL("https://curtisahuang.com"),
  openGraph: {
    type: "website",
    siteName: "Curtis Alexander Huang",
    title: "Curtis Alexander Huang",
    description: "Full-stack Developer | Creating responsive, UX-driven experiences",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={raleway.className}>
        <div className="">{children}</div>
      </body>
    </html>
  );
}
