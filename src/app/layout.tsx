import type { Metadata } from "next";
import "./globals.css";

import CustomSessionProvider from "./auth/components/SessionProvider";
import SessionManager from "./auth/components/SessionManager";
import PixelStyles from "@/components/PixelStyles";

export const metadata: Metadata = {
  title: "Git-RPG",
  description: "GitHub の活動で成長する RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <PixelStyles />
        <CustomSessionProvider>
          <SessionManager />
          {children}
        </CustomSessionProvider>
      </body>
    </html>
  );
}
