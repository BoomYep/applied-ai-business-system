import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Applied AI Business System",
  description: "Turn customer requests into structured business actions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-8 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
