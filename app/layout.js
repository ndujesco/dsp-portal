import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display", display: "swap" });

// NOTE: update this to your real deployed URL so OG/Twitter images resolve absolutely.
const SITE = "https://dsp-assignment.vercel.app";
const TITLE = "DSP Assignment Portal";
const DESC = "Question sheets, worked answers, and an in-browser voice-compression tool for Digital Signal Processing lab assignments. Runs entirely in your browser.";

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · DSP Portal" },
  description: DESC,
  applicationName: TITLE,
  keywords: ["DSP", "Digital Signal Processing", "MATLAB", "voice compression", "FIR filter",
    "FFT", "lab report", "spectral analysis", "assignment"],
  authors: [{ name: "DSP Portal" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website", url: "/", siteName: TITLE, title: TITLE, description: DESC,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DSP Assignment Portal" }],
  },
  twitter: {
    card: "summary_large_image", title: TITLE, description: DESC, images: ["/og-image.png"],
  },
  icons: { icon: "/icon.svg" },
};

export const viewport = { themeColor: "#1f3a52" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
