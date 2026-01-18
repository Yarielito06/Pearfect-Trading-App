"use client"

import { useState, useEffect, useRef } from "react"
import { Send, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { api } from "@/lib/api"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Prediction {
  direction: "UP" | "DOWN"
  confidence: number
  asOf: string
}

const QUICK_PROMPTS = ["Bullish", "Bearish", "What's the risk?", "Explain like I'm new"]

export default function AgentPage() {
  const { selectedPair, mode } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<Prediction>({
    direction: "UP",
    confidence: 0.65,
    asOf: new Date().toISOString(),
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load persisted chat from localStorage
  useEffect(() => {
    const key = `agent_chat_${selectedPair.base}_${selectedPair.quote}`
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      setMessages(parsed.messages || [])
      if (parsed.prediction) {
        setPrediction(parsed.prediction)
      }
    }
  }, [selectedPair])

  // Save chat to localStorage
  useEffect(() => {
    const key = `agent_chat_${selectedPair.base}_${selectedPair.quote}`
    localStorage.setItem(key, JSON.stringify({ messages, prediction }))
  }, [messages, prediction, selectedPair])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const newMessages: Message[] = [...messages, { role: "user", content }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const { data } = await api.agentChat({
        pair: selectedPair,
        messages: newMessages,
      })

      if (data) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }])
        setPrediction({
          direction: data.direction,
          confidence: data.confidence,
          asOf: data.asOf,
        })
      } else {
        // Simulate response for demo
        const simResponse = simulateResponse(content, newMessages)
        setMessages([...newMessages, { role: "assistant", content: simResponse.reply }])
        setPrediction(simResponse.prediction)
      }
    } catch {
      // Simulate response for demo
      const simResponse = simulateResponse(content, newMessages)
      setMessages([...newMessages, { role: "assistant", content: simResponse.reply }])
      setPrediction(simResponse.prediction)
    }

    setLoading(false)
  }

  const simulateResponse = (userMessage: string, allMessages: Message[]) => {
    const lowerMsg = userMessage.toLowerCase()
    let reply = ""
    let direction: "UP" | "DOWN" = prediction.direction
    let confidence = prediction.confidence

    if (lowerMsg.includes("bullish") || lowerMsg.includes("buy") || lowerMsg.includes("long")) {
      reply = `Based on recent momentum indicators, ${selectedPair.base}/${selectedPair.quote} shows bullish divergence. The ratio has been consolidating near support levels, and volume patterns suggest accumulation. Consider the upside potential, but always manage your risk.`
      direction = "UP"
      confidence = 0.72
    } else if (lowerMsg.includes("bearish") || lowerMsg.includes("sell") || lowerMsg.includes("short")) {
      reply = `Looking at the ${selectedPair.base}/${selectedPair.quote} ratio, there are some bearish signals. Resistance at current levels appears strong, and momentum indicators show weakening buying pressure. The short-term outlook favors caution.`
      direction = "DOWN"
      confidence = 0.68
    } else if (lowerMsg.includes("risk")) {
      reply = `Key risks for ${selectedPair.base}/${selectedPair.quote}:\n\n1. Correlation breakdown - assets may move together unexpectedly\n2. Liquidity risk - large orders may face slippage\n3. Market regime changes - thesis may become invalid\n4. Technical failures - smart contract or execution risks\n\nAlways size positions appropriately and use stop losses.`
      confidence = Math.max(0.5, confidence - 0.1)
    } else if (lowerMsg.includes("explain") || lowerMsg.includes("new")) {
      reply = `Welcome! Here's what you're looking at:\n\n${selectedPair.base}/${selectedPair.quote} is a trading pair. The chart shows the ratio between these two assets.\n\nIf you think ${selectedPair.base} will outperform ${selectedPair.quote}, you'd go LONG this pair. The ratio going UP means you profit.\n\nI can help analyze the pair - just ask me anything about market conditions, risk factors, or trading ideas!`
    } else {
      reply = `Analyzing ${selectedPair.base}/${selectedPair.quote}...\n\nThe current ratio dynamics show ${direction === "UP" ? "positive" : "mixed"} momentum. Key factors to watch:\n\n- Recent price action: ${direction === "UP" ? "Bullish consolidation" : "Testing support"}\n- Volume trend: ${direction === "UP" ? "Increasing" : "Declining"}\n- Market sentiment: ${direction === "UP" ? "Risk-on environment" : "Cautious positioning"}\n\nWould you like me to elaborate on any specific aspect?`
      // Slight random adjustment
      confidence = Math.min(0.85, Math.max(0.45, confidence + (Math.random() - 0.5) * 0.1))
    }

    return {
      reply,
      prediction: {
        direction,
        confidence,
        asOf: new Date().toISOString(),
      },
    }
  }

  const resetChat = () => {
    setMessages([])
    setPrediction({
      direction: "UP",
      confidence: 0.5,
      asOf: new Date().toISOString(),
    })
    const key = `agent_chat_${selectedPair.base}_${selectedPair.quote}`
    localStorage.removeItem(key)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agent</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered insights for {selectedPair.base}/{selectedPair.quote}
            </p>
          </div>
          <Badge
            variant="outline"
            className={mode === "demo" ? "border-primary text-primary" : "border-secondary text-secondary"}
          >
            {mode.toUpperCase()} MODE
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Chat panel */}
          <div className="lg:col-span-2">
            <Card className="flex h-[600px] flex-col">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-foreground">Ask the Agent</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetChat} className="text-muted-foreground">
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Reset
                </Button>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                  {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-4 rounded-full bg-primary/10 p-4">
                        <AlertCircle className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground">
                        Ask me anything about {selectedPair.base}/{selectedPair.quote}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Try the quick prompts below to get started</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg bg-muted px-4 py-2">
                        <div className="flex gap-1">
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      disabled={loading}
                      className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(input)
                  }}
                  className="mt-4 flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about this pair..."
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Prediction panel */}
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">
                  Prediction: {selectedPair.base}/{selectedPair.quote}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Direction */}
                <div className="flex items-center justify-center gap-4">
                  <div
                    className={`flex h-20 w-20 flex-col items-center justify-center rounded-full ${
                      prediction.direction === "UP" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                    }`}
                  >
                    {prediction.direction === "UP" ? (
                      <TrendingUp className="h-8 w-8" />
                    ) : (
                      <TrendingDown className="h-8 w-8" />
                    )}
                    <span className="text-sm font-bold">{prediction.direction}</span>
                  </div>
                </div>

                {/* Confidence */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-bold text-foreground">{(prediction.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${prediction.direction === "UP" ? "bg-success" : "bg-danger"}`}
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-center text-xs text-muted-foreground">
                  As of {new Date(prediction.asOf).toLocaleString()}
                </div>

                {/* Disclaimer */}
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <p className="text-xs text-warning">
                    Demo insight only. Not financial advice. Always do your own research.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Selected pair info */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">Current Pair</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="border-primary text-primary">
                      LONG
                    </Badge>
                    <span className="ml-2 font-medium text-foreground">{selectedPair.base}</span>
                  </div>
                  <span className="text-muted-foreground">/</span>
                  <div>
                    <Badge variant="outline" className="border-secondary text-secondary">
                      SHORT
                    </Badge>
                    <span className="ml-2 font-medium text-foreground">{selectedPair.quote}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Change the pair using &quot;Search Pair&quot; in the navigation bar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
