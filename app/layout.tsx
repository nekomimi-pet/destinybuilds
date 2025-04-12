import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Metadata, Viewport } from "next"
import { preloadDestinyManifest } from "@/lib/destinyApi"
import { ModeToggle } from "@/components/mode-toggle"
import { LoginButton } from "@/components/auth-buttons"
import { AuthProvider } from "@/components/auth-provider"
import { getAuthCookie } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://preview.destinybuilds.app"),
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
    url: "https://preview.destinybuilds.app",
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Preload destiny manifest data
  await preloadDestinyManifest();
  
  // Get auth data from cookie
  const authData = await getAuthCookie();
  const user = authData?.model;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="min-h-screen bg-background text-foreground">
              <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">Destiny Builds</h1>
                  </div>
                  <nav>
                    <ul className="flex items-center space-x-6">
                      <li>
                        <a href="/" className="hover:text-primary transition-colors">
                          Home
                        </a>
                      </li>
                      <li>
                        <a href="/builds" className="hover:text-primary transition-colors">
                          All Builds
                        </a>
                      </li>
                      <li>
                        <a href="/exotic-class-items" className="hover:text-primary transition-colors">
                          Exotic Class Items
                        </a>
                      </li>
                      <li>
                        <a href="/season" className="hover:text-primary transition-colors">
                          Episode: Heresy Builds
                        </a>
                      </li>
                      {user && (
                        <li>
                          <a href="/admin/" className="text-primary hover:underline font-medium">
                            Create a Build
                          </a>
                        </li>
                      )}
                      <li>
                        {user ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Hello, {user.name}</span>
                            <a href="/api/auth/logout" className="text-sm text-primary hover:underline">Logout</a>
                          </div>
                        ) : (
                          <LoginButton />
                        )}
                      </li>
                      <li>
                        <ModeToggle />
                      </li>
                    </ul>
                  </nav>
                </div>
              </header>
              {children}
              <footer className="border-t mt-12">
                <div className="container mx-auto px-4 py-6">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                      Destiny Builds © {new Date().getFullYear()} - Not affiliated with Bungie, Inc.
                    </p>
                    <a href="/credits" className="text-muted-foreground hover:text-primary transition-colors">Credits</a>
                  </div>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

import './globals.css'
