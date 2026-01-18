"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"

const SUGGESTED_PAIRS = [
  { base: "HYPE", quote: "ETH", name: "HYPE/ETH" },
  { base: "SOL", quote: "BTC", name: "SOL/BTC" },
  { base: "PEPE", quote: "ETH", name: "PEPE/ETH" },
  { base: "ARB", quote: "ETH", name: "ARB/ETH" },
  { base: "OP", quote: "ARB", name: "OP/ARB" },
  { base: "DOGE", quote: "SHIB", name: "DOGE/SHIB" },
]

export function SearchPairModal() {
  const { showSearchModal, setShowSearchModal, setSelectedPair } = useAppStore()
  const [query, setQuery] = useState("")
  const [pairs, setPairs] = useState(SUGGESTED_PAIRS)

  useEffect(() => {
    if (query.length > 0) {
      const filtered = SUGGESTED_PAIRS.filter(
        (pair) =>
          pair.name.toLowerCase().includes(query.toLowerCase()) ||
          pair.base.toLowerCase().includes(query.toLowerCase()) ||
          pair.quote.toLowerCase().includes(query.toLowerCase()),
      )
      setPairs(filtered)
    } else {
      setPairs(SUGGESTED_PAIRS)
    }
  }, [query])

  const handleSelectPair = (pair: { base: string; quote: string }) => {
    setSelectedPair(pair)
    setShowSearchModal(false)
    setQuery("")
  }

  return (
    <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Search Pair</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pairs (e.g., HYPE/ETH)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="max-h-64 space-y-1 overflow-y-auto">
            {pairs.map((pair) => (
              <button
                key={pair.name}
                onClick={() => handleSelectPair(pair)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <span className="font-medium text-foreground">{pair.name}</span>
                <span className="text-sm text-muted-foreground">Ratio</span>
              </button>
            ))}
            {pairs.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No pairs found</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
