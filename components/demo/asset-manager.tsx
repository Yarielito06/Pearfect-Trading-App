"use client"

import { useState } from "react"
import { Plus, X, Equal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

interface Asset {
  symbol: string
  weight: number
}

const AVAILABLE_TOKENS = ["HYPE", "ETH", "BTC", "SOL", "ARB", "OP", "PEPE", "DOGE", "SHIB", "LINK"]

export function AssetManager() {
  const [longAssets, setLongAssets] = useState<Asset[]>([{ symbol: "HYPE", weight: 50 }])
  const [shortAssets, setShortAssets] = useState<Asset[]>([{ symbol: "ETH", weight: 50 }])
  const [addingTo, setAddingTo] = useState<"long" | "short" | null>(null)

  const normalizeWeights = (assets: Asset[]): Asset[] => {
    const total = assets.reduce((sum, a) => sum + a.weight, 0)
    if (total === 0) return assets
    return assets.map((a) => ({
      ...a,
      weight: Math.round((a.weight / total) * 100),
    }))
  }

  const equalizeWeights = (assets: Asset[]): Asset[] => {
    const weight = Math.round(100 / assets.length)
    return assets.map((a, i) => ({
      ...a,
      weight: i === assets.length - 1 ? 100 - weight * (assets.length - 1) : weight,
    }))
  }

  const addAsset = (side: "long" | "short", symbol: string) => {
    const setter = side === "long" ? setLongAssets : setShortAssets
    const current = side === "long" ? longAssets : shortAssets

    if (current.some((a) => a.symbol === symbol)) return

    setter([...current, { symbol, weight: 0 }])
    setAddingTo(null)
  }

  const removeAsset = (side: "long" | "short", symbol: string) => {
    const setter = side === "long" ? setLongAssets : setShortAssets
    const current = side === "long" ? longAssets : shortAssets
    setter(current.filter((a) => a.symbol !== symbol))
  }

  const updateWeight = (side: "long" | "short", symbol: string, weight: number) => {
    const setter = side === "long" ? setLongAssets : setShortAssets
    const current = side === "long" ? longAssets : shortAssets
    setter(current.map((a) => (a.symbol === symbol ? { ...a, weight } : a)))
  }

  const longTotal = longAssets.reduce((sum, a) => sum + a.weight, 0)
  const shortTotal = shortAssets.reduce((sum, a) => sum + a.weight, 0)

  const renderAssetList = (assets: Asset[], side: "long" | "short", accentColor: string) => (
    <Card className={`border-2 ${side === "long" ? "border-primary/30" : "border-secondary/30"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Badge
              variant="outline"
              className={side === "long" ? "border-primary text-primary" : "border-secondary text-secondary"}
            >
              {side.toUpperCase()}
            </Badge>
            Basket
          </CardTitle>
          <span
            className={`text-xs font-medium ${
              (side === "long" ? longTotal : shortTotal) !== 100 ? "text-warning" : "text-success"
            }`}
          >
            {side === "long" ? longTotal : shortTotal}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assets.map((asset) => (
          <div key={asset.symbol} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{asset.symbol}</span>
                <button
                  onClick={() => removeAsset(side, asset.symbol)}
                  className="text-muted-foreground hover:text-danger"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <Input
                type="number"
                value={asset.weight}
                onChange={(e) => updateWeight(side, asset.symbol, Number(e.target.value))}
                className="h-7 w-16 text-right text-sm"
                min={0}
                max={100}
              />
            </div>
            <Slider
              value={[asset.weight]}
              onValueChange={([v]) => updateWeight(side, asset.symbol, v)}
              max={100}
              step={1}
              className="h-1"
            />
          </div>
        ))}

        {addingTo === side ? (
          <div className="flex flex-wrap gap-1">
            {AVAILABLE_TOKENS.filter((t) => !assets.some((a) => a.symbol === t)).map((token) => (
              <button
                key={token}
                onClick={() => addAsset(side, token)}
                className="rounded bg-muted px-2 py-1 text-xs text-foreground hover:bg-muted/80"
              >
                {token}
              </button>
            ))}
            <button
              onClick={() => setAddingTo(null)}
              className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setAddingTo(side)} className="w-full text-muted-foreground">
            <Plus className="mr-1 h-3 w-3" />
            Add Token
          </Button>
        )}

        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              side === "long"
                ? setLongAssets(normalizeWeights(longAssets))
                : setShortAssets(normalizeWeights(shortAssets))
            }
            className="flex-1 text-xs"
          >
            Normalize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              side === "long"
                ? setLongAssets(equalizeWeights(longAssets))
                : setShortAssets(equalizeWeights(shortAssets))
            }
            className="flex-1 text-xs"
          >
            <Equal className="mr-1 h-3 w-3" />
            Equal
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Asset Manager</h2>
      <p className="text-xs text-muted-foreground">
        Build your LONG and SHORT baskets. Weights must total 100% per side.
      </p>

      {renderAssetList(longAssets, "long", "primary")}
      {renderAssetList(shortAssets, "short", "secondary")}
    </div>
  )
}
