"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Moon, Sun, Search, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { AvatarDropdown } from "@/components/avatar-dropdown"
import { WalletButton } from "@/components/wallet-button"

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme, setShowSearchModal } = useAppStore()

  const navLinks = [
    { href: "/learn", label: "Learn" },
    { href: "/demo/trade", label: "Trade" },
    { href: "/agent", label: "Agent" },
    { href: "https://discord.gg/pearfect", label: "Discord", external: true },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/pear-20logo.png"
            alt="Pearfect logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-foreground">Pearfect</span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
              {link.external && <ExternalLink className="h-3 w-3" />}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearchModal(true)}
            className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
          >
            <Search className="mr-2 h-4 w-4" />
            Search Pair
          </Button>

          <WalletButton />

          <AvatarDropdown />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </nav>
  )
}
