import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";
import "./landing.css";

export const metadata: Metadata = {
  title: "SiPosMA - Sistem Informasi Posyandu",
  description: "Aplikasi Manajemen Posyandu Terintegrasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{__html: `
          try {
            if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (_) {}
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
