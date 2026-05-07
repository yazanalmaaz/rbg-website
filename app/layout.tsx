import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RBG Engineering Services",
  description: "Precision in Engineering, Excellence in Execution"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
