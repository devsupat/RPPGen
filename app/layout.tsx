import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GuruPintar AI - Generator RPPM Deep Learning",
  description: "Aplikasi generator Rencana Pembelajaran Mendalam (RPPM) berbasis Kurikulum Merdeka (CP 2025) untuk guru SD, SMP, SMA.",
  keywords: ["RPPM", "RPP", "Kurikulum Merdeka", "Deep Learning", "Guru", "Pendidikan"],
  authors: [{ name: "GuruPintar AI" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
