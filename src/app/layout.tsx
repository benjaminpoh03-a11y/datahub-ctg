import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

// Force dynamic rendering to prevent static caching
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DataHub by CTG | Business Intelligence Platform",
  description: "AI-powered business intelligence and data analytics platform for multi-brand ecommerce companies. Track revenue, marketing performance, and financial metrics in real-time.",
  keywords: ["DataHub", "Business Intelligence", "Analytics", "E-commerce", "Dashboard", "CTG", "Multi-brand"],
  authors: [{ name: "CTG Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "DataHub by CTG",
    description: "AI-powered business intelligence platform for multi-brand ecommerce",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
