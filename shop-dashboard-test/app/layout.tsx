import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shop Dashboard",
  description: "A simple local shop dashboard test app"
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
