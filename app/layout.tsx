import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Braco OmniPulse — Regional Campaign Intelligence",
  description:
    "AI-assisted regional campaign intelligence platform. Adapt campaigns across Indian languages with brand safeguards, evidence-first verification, and human approval.",
  keywords: ["regional marketing", "Indian brands", "campaign intelligence", "Telugu", "Tamil", "Hindi", "AI marketing"],
  openGraph: {
    title: "Braco OmniPulse",
    description: "AI-Assisted Regional Campaign Intelligence",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen" style={{ backgroundColor: "#6B6B6B", color: "#FFFFFF" }}>
        {children}
      </body>
    </html>
  );
}
