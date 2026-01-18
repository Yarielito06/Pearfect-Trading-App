import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navbar } from "@/components/layout/navbar"
import { CoinShower } from "@/components/coin-shower"
import { SearchPairModal } from "@/components/search-pair-modal"
import { ThemeInitializer } from "@/components/theme-initializer"
import { Providers } from "@/components/providers"
import { Suspense } from "react"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pearfect - Pair & Basket Trading",
  description: "Learn and trade crypto pairs with Demo and Pro modes. Thesis-driven trading made simple.",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#0B0F17",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <Providers>
          <ThemeInitializer />
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Suspense fallback={null}>
            <CoinShower />
            <SearchPairModal />
          </Suspense>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
