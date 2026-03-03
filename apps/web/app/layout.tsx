import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ParsePal",
  description: "Chat with your PDF documents",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
