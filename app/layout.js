import "./globals.css";

export const metadata = {
  title: "DSP Assignment Portal",
  description: "Digital Signal Processing lab assignments — questions, answers, and a voice-compression tool.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
