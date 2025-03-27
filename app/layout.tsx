import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Destiny Builds",
  description: "Discover and share optimized builds for Destiny 2",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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