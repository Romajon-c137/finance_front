import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  weight: ["400", "500", "700"], // Regular, Medium, Bold
});

export const metadata: Metadata = {
  title: "Finance App",
  description: "Finance tracker application",
};

import MiniProfile from "@/components/MiniProfile/MiniProfile";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={montserrat.className}>
        <ErrorBoundary>
          <ToastProvider>
            <MiniProfile />
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
