import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Exo_2, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "D20 — Edition Crimson",
  description: "A scroll-driven twenty-sided die.",
};

// `viewport-fit: cover` permette al canvas di estendersi fino ai bordi
// (notch / safe area) invece di lasciare cornici. `themeColor` colora la
// chrome del browser/sistema in tinta col fondo Onyx, così quando la barra
// del telefono entra/esce non c'è il flash bianco di stacco visivo.
export const viewport: Viewport = {
  themeColor: "#111318",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${exo2.variable} ${ibmPlexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#111318] text-[#E6E8EE]">
        {children}
      </body>
    </html>
  );
}
