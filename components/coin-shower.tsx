"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"

interface Coin {
  id: number
  left: number
  delay: number
  duration: number
  rotation: number
}

export function CoinShower() {
  const { showCoinShower } = useAppStore()
  const [coins, setCoins] = useState<Coin[]>([])

  useEffect(() => {
    if (showCoinShower) {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (prefersReducedMotion) {
        return
      }

      // Generate coins
      const newCoins: Coin[] = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 1,
        rotation: Math.random() * 720,
      }))
      setCoins(newCoins)

      // Clear coins after animation
      const timer = setTimeout(() => setCoins([]), 3000)
      return () => clearTimeout(timer)
    }
  }, [showCoinShower])

  if (!showCoinShower || coins.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="coin-shower absolute text-2xl"
          style={{
            left: `${coin.left}%`,
            top: "-50px",
            animationDelay: `${coin.delay}s`,
            animationDuration: `${coin.duration}s`,
          }}
        >
          🪙
        </div>
      ))}
    </div>
  )
}
