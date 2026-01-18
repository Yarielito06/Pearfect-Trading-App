"use client"

import { useState, useEffect } from "react"
import { Plus, X, Equal, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Asset {
  symbol: string
  weight: number
}

interface Thesis {
  a: string
  b: string
  horizon: string
  conviction: string
  type: string
}

const AVAILABLE_TOKENS = ["HYPE", "ETH", "BTC", "SOL", "ARB", "OP", "PEPE", "DOGE", "SHIB", "LINK", "AAVE", "UNI"]

const THEMATIC_BASKETS: Record<string, string[]> = {
  AI: ["HYPE", "TAO", "RNDR"],
  DeFi: ["AAVE", "UNI", "LINK"],
  L1s: ["ETH", "SOL", "AVAX"],
  L2s: ["ARB", "OP", "MATIC"],
  Memes: ["PEPE", "DOGE", "SHIB"],
}

export function WeightBuilder({ thesis }: { thesis: Thesis }) {
  const [longAssets, setLongAssets] = useState<Asset[]>([{ symbol: "HYPE", weight: 100 }])
  const [shortAssets, setShortAssets] = useState<Asset[]>([{ symbol: "ETH", weight: 100 }])
  const [trainingWheels, setTrainingWheels] = useState(true)
  const [addingTo, setAddingTo] = useState<"long" | "short" | null>(null)

  // Auto-translate thesis to baskets
  useEffect(() => {
    const aTokens = THEMATIC_BASKETS[thesis.a] || [thesis.a]
    const bTokens = THEMATIC_BASKETS[thesis.b] || [thesis.b]

    const longWeight = Math.round(100 / aTokens.length)
    const shortWeight = Math.round(100 / bTokens.length)

    setLongAssets(
      aTokens.map((t, i) => ({
        symbol: t,
        weight: i === aTokens.length - 1 ? 100 - longWeight * (aTokens.length - 1) : longWeight,
      })),
    )
    setShortAssets(
      bTokens.map((t, i) => ({
        symbol: t,
        weight: i === bTokens.length - 1 ? 100 - shortWeight * (bTokens.length - 1) : shortWeight,
      })),
    )
  }, [thesis.a, thesis.b])

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

    const newAssets = [...current, { symbol, weight: 0 }]
    setter(trainingWheels ? normalizeWeights(newAssets) : newAssets)
    setAddingTo(null)
  }

  const removeAsset = (side: "long" | "short", symbol: string) => {
    const setter = side === "long" ? setLongAssets : setShortAssets
    const current = side === "long" ? longAssets : shortAssets
    const newAssets = current.filter((a) => a.symbol !== symbol)
    setter(trainingWheels ? normalizeWeights(newAssets) : newAssets)
  }

  const updateWeight = (side: "long" | "short", symbol: string, weight: number) => {
    const setter = side === "long" ? setLongAssets : setShortAssets
    const current = side === "long" ? longAssets : shortAssets
    setter(current.map((a) => (a.symbol === symbol ? { ...a, weight } : a)))
  }

  const longTotal = longAssets.reduce((sum, a) => sum + a.weight, 0)
  const shortTotal = shortAssets.reduce((sum, a) => sum + a.weight, 0)

  // Sanity checks
  const warnings: string[] = []
  const maxLongWeight = Math.max(...longAssets.map((a) => a.weight))
  const maxShortWeight = Math.max(...shortAssets.map((a) => a.weight))

  if (maxLongWeight > 60) warnings.push("LONG concentration >60%")
  if (maxShortWeight > 60) warnings.push("SHORT concentration >60%")
  if (longAssets.length > 8) warnings.push("LONG basket >8 assets")
  if (shortAssets.length > 8) warnings.push("SHORT basket >8 assets")

  const renderAssetList = (assets: Asset[], side: "long" | "short") => (
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Weight Builder</h2>
      </div>

      {/* Training Wheels Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
        <div>
          <Label htmlFor="training-wheels" className="text-sm font-medium text-foreground">
            Training Wheels
          </Label>
          <p className="text-xs text-muted-foreground">Auto-normalize, max 3x leverage</p>
        </div>
        <Switch id="training-wheels" checked={trainingWheels} onCheckedChange={setTrainingWheels} />
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert className="border-warning/30 bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm text-warning">{warnings.join(" • ")}</AlertDescription>
        </Alert>
      )}

      {renderAssetList(longAssets, "long")}
      {renderAssetList(shortAssets, "short")}
    </div>
  )
}
