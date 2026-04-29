import type { Metadata } from "next";
import { Inter, Literata, Noto_Serif_Hebrew } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  weight: ["400", "500", "600", "700"],
});

const notoSerifHebrew = Noto_Serif_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-noto-hebrew",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Rambam Experience",
  description:
    "Daily Torah insights on the Rambam's Mishneh Torah — three chapters a day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${literata.variable} ${notoSerifHebrew.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
