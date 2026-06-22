import type { Metadata } from "next";
import { Inter, Source_Serif_4, Noto_Serif_Hebrew } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["400", "500", "600", "700"],
});

const notoSerifHebrew = Noto_Serif_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-noto-hebrew",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rambamexperience.com"),
  title: {
    default: "The Rambam Experience",
    template: "%s | The Rambam Experience",
  },
  description:
    "Daily Torah insights on the Rambam's Mishneh Torah — three chapters a day.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Rambam Experience",
    description:
      "Daily Torah insights on the Rambam's Mishneh Torah — three chapters a day.",
    url: "https://rambamexperience.com",
    siteName: "The Rambam Experience",
    type: "website",
  },
  // Google Search Console verification — paste the code from the HTML-tag
  // verification method here, e.g. verification: { google: "abc123" },
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
        className={`${inter.variable} ${sourceSerif4.variable} ${notoSerifHebrew.variable} antialiased`}
      >
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
