import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";
import SmoothScroll from "@/components/SmoothScroll";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
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
  themeColor: "#0c0a09",
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
const themeInit = `try{var t=localStorage.getItem("sb-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrument.variable}`}>
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
