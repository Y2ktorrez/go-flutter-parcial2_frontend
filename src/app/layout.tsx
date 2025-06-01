import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthModalWrapper, ParticleBackground } from "@/components/particle-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GO FLUTTER",
  description: "Flutter Interfaces Generator",
  themeColor: "#000000",
  openGraph: {
    title: "GO FLUTTER",
    description: "Flutter Interfaces Generator",
    images: [{ url: "/og-image.jpg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Mover toda la lógica de partículas a un componente separado
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ParticleBackground>
          {children}
          <AuthModalWrapper />
        </ParticleBackground>
      </body>
    </html>
  );
}

