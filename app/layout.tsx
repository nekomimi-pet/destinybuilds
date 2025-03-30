import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Metadata, Viewport } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Destiny 2 Builds - Find and Share Optimized Builds",
    template: "%s | Destiny 2 Builds"
  },
  description: "Discover and share optimized builds for Destiny 2. Find the best builds for PvE and PvP activities.",
  keywords: "Destiny 2, builds, build guide, PvE, PvP, Hunter, Titan, Warlock, Solar, Arc, Void, Strand, Stasis, Prismatic",
  authors: [{ name: "Destiny 2 Builds" }],
  creator: "Destiny 2 Builds",
  publisher: "Destiny 2 Builds",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://preview.nekomimi.pet",
    siteName: "Destiny 2 Builds",
    title: "Destiny 2 Builds - Find and Share Optimized Builds",
    description: "Discover and share optimized builds for Destiny 2. Find the best builds for PvE and PvP activities.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Destiny 2 Builds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Destiny 2 Builds - Find and Share Optimized Builds",
    description: "Discover and share optimized builds for Destiny 2. Find the best builds for PvE and PvP activities.",
    images: ["/og-image.jpg"],
    creator: "@destiny2builds",
  },
  verification: {
    google: "your-google-site-verification",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-background text-foreground">
            <header className="border-b">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold">Destiny Builds</h1>
                </div>
                <nav>
                  <ul className="flex space-x-6">
                    <li>
                      <a href="/" className="hover:text-primary transition-colors">
                        Home
                      </a>
                    </li>
                    <li>
                      <a href="/builds" className="hover:text-primary transition-colors">
                        Builds
                      </a>
                    </li>
                    <li>
                      <a href="/exotics" className="hover:text-primary transition-colors">
                        Exotics
                      </a>
                    </li>
                    <li>
                      <a href="/mods" className="hover:text-primary transition-colors">
                        Mods
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>
            {children}
            <footer className="border-t mt-12">
              <div className="container mx-auto px-4 py-6">
                <p className="text-center text-muted-foreground">
                  Destiny Builds © {new Date().getFullYear()} - Not affiliated with Bungie, Inc.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'