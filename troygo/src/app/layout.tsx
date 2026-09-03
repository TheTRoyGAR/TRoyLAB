import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "TRoyGO™ – TRoy Travel Agency™ | Book Flights, Hotels & More",
    template: "%s | TRoyGO™",
  },
  description:
    "Discover the world with TRoyGO™ by TRoy Travel Agency™. Book flights, hotels, car rentals, vacation packages, cruises, and custom trip experiences with premium service and unbeatable deals.",
  keywords: [
    "travel agency",
    "book flights",
    "hotels",
    "vacation packages",
    "cruises",
    "car rentals",
    "trip planner",
    "TRoyGO",
    "TRoy Travel Agency",
    "travel deals",
    "international travel",
    "holiday packages",
    "luxury travel",
    "adventure travel",
  ],
  authors: [{ name: "TRoy Travel Agency™" }],
  creator: "TRoy Travel Agency™",
  publisher: "TRoyGO™",
  metadataBase: new URL("https://troytravelagency.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://troytravelagency.com",
    siteName: "TRoyGO™",
    title: "TRoyGO™ – Your World, Your Journey",
    description:
      "Premium travel booking platform by TRoy Travel Agency™. Flights, hotels, packages, cruises, and AI-powered trip planning.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TRoyGO™ – TRoy Travel Agency™",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRoyGO™ – Your World, Your Journey",
    description:
      "Premium travel booking by TRoy Travel Agency™. Book flights, hotels, cruises & more.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0A1628",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-white text-navy flex flex-col">
        <div className="min-h-screen flex flex-col">{children}</div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0A1628",
              color: "#ffffff",
              border: "1px solid #00B4D8",
              borderRadius: "0.5rem",
              fontFamily: "var(--font-inter, Inter, sans-serif)",
              fontSize: "0.9rem",
              fontWeight: "500",
            },
            success: {
              iconTheme: {
                primary: "#00B4D8",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
