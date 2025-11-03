import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { DevToolsWrapper } from "@/components/dev/DevToolsWrapper";
import { SkipLinks } from "@/components/accessibility/SkipLinks";
import { AuthModalProvider } from "@/components/auth/context/AuthModalContext";
import { AuthModals } from "@/components/auth/modals/AuthModals";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "RotomTracks",
  description: "The best platform for tournament organizers and players",
  icons: {
    icon: [
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico?v=2', sizes: 'any' }
    ],
    shortcut: '/favicon.ico?v=2',
    apple: '/apple-touch-icon.png?v=2',
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png?v=2', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png?v=2', sizes: '512x512', type: 'image/png' }
    ]
  },
  openGraph: {
    title: "RotomTracks",
    description: "The best platform for tournament organizers and players",
    images: ['/images/rotom-tracks-logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "RotomTracks",
    description: "The best platform for tournament organizers and players",
    images: ['/images/rotom-tracks-logo.png'],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <SkipLinks />
        
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <AuthModalProvider>
              {children}
              <AuthModals />
              <DevToolsWrapper />
            </AuthModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
