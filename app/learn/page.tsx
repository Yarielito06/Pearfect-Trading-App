"use client"

import Link from "next/link"
import { BookOpen, ArrowRight, Play, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function LearnPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Learn Pair & Basket Trading</h1>
          <p className="mt-2 text-muted-foreground">Everything you need to know to get started</p>
        </div>

        {/* Video section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Play className="h-5 w-5 text-primary" />
              Watch: How a trade works end-to-end
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video overflow-hidden rounded-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/Z6bf4cg-dv8"
                title="How a trade works"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Learning sections */}
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="pair-trading" className="rounded-lg border border-border bg-card px-4">
            <AccordionTrigger className="text-foreground hover:no-underline">What is pair trading?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-4 pb-4">
                <p>
                  Pair trading is a market-neutral strategy that involves simultaneously buying one asset (going long)
                  and selling another asset (going short). The goal is to profit from the relative performance between
                  the two assets, regardless of overall market direction.
                </p>
                <p>
                  For example, if you believe HYPE will outperform ETH, you would go long HYPE and short ETH. If HYPE
                  goes up 10% while ETH goes up 5%, you profit from the 5% difference, even though both assets moved in
                  the same direction.
                </p>
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-medium text-foreground">Key benefits:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>Market-neutral exposure</li>
                    <li>Profit in any market condition</li>
                    <li>Reduced directional risk</li>
                    <li>Express specific market views</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="basket-trading" className="rounded-lg border border-border bg-card px-4">
            <AccordionTrigger className="text-foreground hover:no-underline">What is basket trading?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-4 pb-4">
                <p>
                  Basket trading extends pair trading by allowing you to trade groups of assets against each other.
                  Instead of trading just two individual assets, you can trade entire sectors or themes.
                </p>
                <p>
                  For example, you could go long a basket of AI tokens (HYPE, TAO, RNDR) against a basket of DeFi tokens
                  (AAVE, UNI, LINK). This lets you express broader market views like &quot;AI sector will outperform
                  DeFi.&quot;
                </p>
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-medium text-foreground">Popular baskets:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>AI tokens (HYPE, TAO, RNDR)</li>
                    <li>DeFi protocols (AAVE, UNI, LINK)</li>
                    <li>Layer 1s (ETH, SOL, AVAX)</li>
                    <li>Layer 2s (ARB, OP, MATIC)</li>
                    <li>Meme coins (PEPE, DOGE, SHIB)</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ratio" className="rounded-lg border border-border bg-card px-4">
            <AccordionTrigger className="text-foreground hover:no-underline">What does ratio mean?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-4 pb-4">
                <p>
                  The ratio represents the relative price of your LONG asset compared to your SHORT asset. It&apos;s
                  calculated as:
                </p>
                <div className="rounded-lg bg-muted p-4 font-mono text-center text-foreground">
                  Ratio = LONG Price / SHORT Price
                </div>
                <p>
                  When the ratio goes up, your LONG asset is outperforming your SHORT asset (you&apos;re making money).
                  When it goes down, your SHORT asset is outperforming (you&apos;re losing money).
                </p>
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-medium text-foreground">PnL Calculation:</p>
                  <p className="mt-2 font-mono text-sm">PnL % = (Current Ratio / Entry Ratio) - 1</p>
                  <p className="mt-2 font-mono text-sm">PnL $ = Stake × PnL %</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="demo-vs-pro" className="rounded-lg border border-border bg-card px-4">
            <AccordionTrigger className="text-foreground hover:no-underline">Demo vs Pro</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-3 text-left font-medium text-foreground">Feature</th>
                        <th className="py-3 text-left font-medium text-primary">Demo Mode</th>
                        <th className="py-3 text-left font-medium text-secondary">Pro Mode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="py-3">Funds</td>
                        <td className="py-3">100 fake credits</td>
                        <td className="py-3">Real wallet funds</td>
                      </tr>
                      <tr>
                        <td className="py-3">Trades</td>
                        <td className="py-3">Simulated</td>
                        <td className="py-3">Real execution</td>
                      </tr>
                      <tr>
                        <td className="py-3">Wallet</td>
                        <td className="py-3">Not required</td>
                        <td className="py-3">Phantom required</td>
                      </tr>
                      <tr>
                        <td className="py-3">Risk</td>
                        <td className="py-3">None</td>
                        <td className="py-3">Real financial risk</td>
                      </tr>
                      <tr>
                        <td className="py-3">XP Earning</td>
                        <td className="py-3">10 XP per trade</td>
                        <td className="py-3">10 XP + streak bonuses</td>
                      </tr>
                      <tr>
                        <td className="py-3">Best for</td>
                        <td className="py-3">Learning & testing</td>
                        <td className="py-3">Real trading</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="risks" className="rounded-lg border border-border bg-card px-4">
            <AccordionTrigger className="text-foreground hover:no-underline">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Risks
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="space-y-4 pb-4">
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <p className="font-medium text-warning">Important Disclaimers:</p>
                  <ul className="mt-2 list-inside list-disc space-y-2">
                    <li>Pair trading involves significant financial risk</li>
                    <li>You can lose more than your initial stake with leverage</li>
                    <li>Past performance does not guarantee future results</li>
                    <li>This is not financial advice</li>
                    <li>Only trade with funds you can afford to lose</li>
                    <li>Market conditions can change rapidly</li>
                    <li>Slippage and execution costs affect returns</li>
                  </ul>
                </div>
                <p>Always start with Demo Mode to understand how the platform works before risking real funds.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/demo/trade">
              Start Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
          >
            <Link href="/pro/trade">
              Go Pro
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
