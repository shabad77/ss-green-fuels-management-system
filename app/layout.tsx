import { Toaster } from "react-hot-toast";
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

export const metadata = {
  title: "SS Green Fuels ERP",
  description: "SS Green Fuels Management System",
  icons: {apple: "/apple-icon.png", },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

  <Toaster
    position="top-right"
    toastOptions={{
      duration: 2500,
      style: {
        borderRadius: "8px",
      },
    }}
  />

  {children}

</body>
    </html>
  );
}
