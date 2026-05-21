import type { Metadata } from "next";
import { Rokkitt, Montserrat } from "next/font/google";
import "./globals.css";

// const rokkitt = Rokkitt({
//   subsets: ["latin"],
//   variable: "--font-display",
//   display: "swap",
// });

// const montserrat = Montserrat({
//   subsets: ["latin"],
//   variable: "--font-body",
//   display: "swap",
// });

const displayFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const bodyFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shiro Studio",
  description: "Admin dashboard para Shiro Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
