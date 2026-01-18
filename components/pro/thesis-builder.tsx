"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Thesis {
  a: string
  b: string
  horizon: string
  conviction: string
  type: string
}

const ASSETS = ["HYPE", "ETH", "BTC", "SOL", "ARB", "OP", "LINK"]
const BASKETS = ["AI", "DeFi", "L1s", "L2s", "Memes"]
const HORIZONS = ["1D", "1W", "1M", "3M"]
const CONVICTIONS = ["Low", "Medium", "High"]
const THESIS_TYPES = ["Relative performance", "Sector rotation", "Momentum", "Mean reversion", "Narrative breakout"]

export function ThesisBuilder({
  thesis,
  setThesis,
}: {
  thesis: Thesis
  setThesis: (thesis: Thesis) => void
}) {
  const allOptions = [...ASSETS, ...BASKETS]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-foreground">Thesis Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thesis sentence */}
        <div className="rounded-lg bg-muted p-3 text-sm">
          <span className="text-muted-foreground">I believe </span>
          <span className="font-semibold text-primary">{thesis.a}</span>
          <span className="text-muted-foreground"> will outperform </span>
          <span className="font-semibold text-secondary">{thesis.b}</span>
          <span className="text-muted-foreground"> over the next </span>
          <span className="font-semibold text-foreground">{thesis.horizon}</span>
        </div>

        {/* A selector */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Outperformer (A)</Label>
          <Select value={thesis.a} onValueChange={(v) => setThesis({ ...thesis, a: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1 text-xs text-muted-foreground">Assets</div>
              {ASSETS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-muted-foreground">Baskets</div>
              {BASKETS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* B selector */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Underperformer (B)</Label>
          <Select value={thesis.b} onValueChange={(v) => setThesis({ ...thesis, b: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1 text-xs text-muted-foreground">Assets</div>
              {ASSETS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-muted-foreground">Baskets</div>
              {BASKETS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Horizon */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Time Horizon</Label>
          <div className="flex gap-2">
            {HORIZONS.map((h) => (
              <button
                key={h}
                onClick={() => setThesis({ ...thesis, horizon: h })}
                className={`flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors ${
                  thesis.horizon === h
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Thesis Type */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Thesis Type</Label>
          <Select value={thesis.type} onValueChange={(v) => setThesis({ ...thesis, type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THESIS_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conviction */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Conviction</Label>
          <div className="flex gap-2">
            {CONVICTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setThesis({ ...thesis, conviction: c })}
                className={`flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors ${
                  thesis.conviction === c
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
