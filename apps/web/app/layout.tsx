import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ParsePal",
  description: "Open source PDF chat project built for learning with RAG, releases, and UI iteration in public",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply .dark class before first paint to avoid flash and prevent
            Edge/Chrome from applying their own automatic dark mode override */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;var m=window.matchMedia('(prefers-color-scheme: dark)');if(m.matches)d.classList.add('dark');m.addEventListener('change',function(e){d.classList.toggle('dark',e.matches);});})()`,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
