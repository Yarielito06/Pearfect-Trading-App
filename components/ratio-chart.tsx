"use client"

import { useEffect, useRef, useState } from "react"
import { useAppStore } from "@/lib/store"

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

// Generate mock candle data for demo
function generateMockCandles(base: string, quote: string): Candle[] {
  const candles: Candle[] = []
  const now = Date.now()
  let price = 1.5 + Math.random() * 0.5

  for (let i = 199; i >= 0; i--) {
    const time = now - i * 15 * 60 * 1000
    const change = (Math.random() - 0.5) * 0.02
    const open = price
    const close = price * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (1 - Math.random() * 0.01)

    candles.push({ time, open, high, low, close })
    price = close
  }

  return candles
}

export function RatioChart() {
  const { selectedPair } = useAppStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [candles, setCandles] = useState<Candle[]>([])
  const [currentRatio, setCurrentRatio] = useState(0)

  useEffect(() => {
    const mockCandles = generateMockCandles(selectedPair.base, selectedPair.quote)
    setCandles(mockCandles)
    setCurrentRatio(mockCandles[mockCandles.length - 1]?.close || 0)
  }, [selectedPair])

  // Simple canvas chart rendering
  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return

    const container = containerRef.current
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(dpr, dpr)

    // Clear previous canvas
    container.innerHTML = ""
    container.appendChild(canvas)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 60, bottom: 30, left: 10 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Calculate min/max
    const prices = candles.flatMap((c) => [c.high, c.low])
    const minPrice = Math.min(...prices) * 0.995
    const maxPrice = Math.max(...prices) * 1.005
    const priceRange = maxPrice - minPrice

    // Background
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--card").trim() || "#121826"
    ctx.fillRect(0, 0, width, height)

    // Grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--border").trim() || "#24314A"
    ctx.lineWidth = 0.5

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      // Price labels
      const price = maxPrice - (priceRange / 4) * i
      ctx.fillStyle = "#7E8AA6"
      ctx.font = "10px Geist, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(price.toFixed(4), width - padding.right + 5, y + 3)
    }

    // Draw candles
    const candleWidth = chartWidth / candles.length
    const candleBodyWidth = Math.max(1, candleWidth * 0.6)

    candles.forEach((candle, i) => {
      const x = padding.left + i * candleWidth + candleWidth / 2
      const openY = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight
      const closeY = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight
      const highY = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight
      const lowY = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight

      const isUp = candle.close >= candle.open
      const color = isUp ? "#2BD576" : "#FF4D6D"

      // Wick
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // Body
      ctx.fillStyle = color
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.abs(closeY - openY) || 1
      ctx.fillRect(x - candleBodyWidth / 2, bodyTop, candleBodyWidth, bodyHeight)
    })

    // Current price line
    const lastCandle = candles[candles.length - 1]
    if (lastCandle) {
      const currentY = padding.top + ((maxPrice - lastCandle.close) / priceRange) * chartHeight
      ctx.strokeStyle = "#22FF88"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(padding.left, currentY)
      ctx.lineTo(width - padding.right, currentY)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [candles])

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">
            {selectedPair.base}/{selectedPair.quote}
          </h3>
          <span className="text-sm text-muted-foreground">Ratio Chart</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">{currentRatio.toFixed(4)}</span>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 min-h-[300px]" />
    </div>
  )
}
