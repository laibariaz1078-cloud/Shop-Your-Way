import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ModalHost from "../components/ModalHost";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Shop Your Way",
  description: "Shop Your Way is a modern e-commerce platform that allows you to create and manage your online store with ease.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<ModalHost /></body>
    </html>
  );
}
