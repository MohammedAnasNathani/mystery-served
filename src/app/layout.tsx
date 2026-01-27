import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Import Outfit for headings
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mystery Served | Control Center", // Updated title
  description: "Secure Admin Access",
  icons: {
    icon: "/logo.png",
  },
};

import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[var(--deep-space)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-white transition-colors duration-300">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} storageKey="mystery-served-theme">
          {/* Global background effects */}
          <div className="fixed inset-0 z-[-1] pointer-events-none">
            <div className="absolute inset-0 spy-grid opacity-20" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[120px] dark:bg-purple-900/10 bg-purple-500/5" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-teal-900/10 blur-[120px] dark:bg-teal-900/10 bg-teal-500/5" />
          </div>
          {children}
          <Toaster position="top-right" theme="system" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
