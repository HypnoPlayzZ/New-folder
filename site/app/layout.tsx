import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";
import SmoothScroll from "@/components/SmoothScroll";

/* Quiet Heat: one voice — Geist carries display, body, and labels.
   Supper Club rollback: restore from git —
   import { Fraunces, Instrument_Sans } from "next/font/google";
   const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"],
     axes: ["opsz"], variable: "--font-fraunces", display: "swap" });
   const instrument = Instrument_Sans({ subsets: ["latin"],
     variable: "--font-instrument", display: "swap" });
   and put both .variable classNames back on <html>. */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Steamy Bites — Momos & Cold Coffee, Laxmi Nagar, Delhi",
  description:
    "The best momos in Laxmi Nagar. Steamed, fried and kurkure momos, chilli potato, chowmein and cold coffee — a late-night cafe near Laxmi Nagar Metro, Delhi.",
  keywords: [
    "best momos in Laxmi Nagar",
    "cafe near Laxmi Nagar Metro",
    "Chinese cafe Delhi",
    "cold coffee Delhi",
    "affordable cafe Delhi",
  ],
  openGraph: {
    title: "Steamy Bites — Momos & Cold Coffee, Laxmi Nagar",
    description:
      "Steam, gold light, and the best momos in Laxmi Nagar. Near Laxmi Nagar Metro, Delhi.",
    images: ["/media/poster-hero.jpg"],
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e4636",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Steamy Bites",
  servesCuisine: ["Momos", "Chinese", "Cafe"],
  priceRange: "₹₹",
  email: "hello@steamybites.in",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Laxmi Nagar",
    addressRegion: "Delhi",
    addressCountry: "IN",
  },
  image: "/media/poster-hero.jpg",
};

/* Applies the saved theme before first paint so Night/Day never flashes. */
// Dark-only: force the Quiet Heat night theme and ignore any stored light preference.
const themeInit = `try{document.documentElement.dataset.theme="light";localStorage.setItem("sb-theme","light")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body>
        {children}
        <div className="grain" aria-hidden="true" />
        <Cursor />
        <SmoothScroll />
      </body>
    </html>
  );
}
