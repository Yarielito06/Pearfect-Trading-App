import { create } from "zustand"
import { persist } from "zustand/middleware"

// Types
export interface DemoWallet {
  demoAddress: string
  demoCredits: number
  maxDemoCredits: number
  txHistory: DemoTransaction[]
  createdAt: number
}

export interface DemoTransaction {
  id: string
  type: "trade" | "reset"
  amount: number
  timestamp: number
  description: string
}

export interface DemoPosition {
  id: string
  longAssets: { asset: string; weight: number }[]
  shortAssets: { asset: string; weight: number }[]
  stake: number
  entryRatio: number
  createdAt: number
  matchup: string
}

export interface ProPosition {
  id: string
  thesis: string
  longAssets: { asset: string; weight: number }[]
  shortAssets: { asset: string; weight: number }[]
  stake: number
  leverage: number
  createdAt: number
  status: string
}

export interface Avatar {
  level: number
  xp: number
  xpToNextLevel: number
  currentStreakDays: number
  longestStreakDays: number
  lastProTradeDate: string | null
  streakBadgesUnlocked: string[]
}

export interface SelectedPair {
  base: string
  quote: string
}

interface AppState {
  // Mode
  mode: "demo" | "pro"
  setMode: (mode: "demo" | "pro") => void

  // Theme
  theme: "dark" | "light"
  setTheme: (theme: "dark" | "light") => void

  // Demo wallet
  demoWallet: DemoWallet | null
  initDemoWallet: () => void
  resetDemoWallet: () => void
  deductDemoCredits: (amount: number) => void
  addDemoTransaction: (tx: Omit<DemoTransaction, "id" | "timestamp">) => void

  // Demo positions
  demoPositions: DemoPosition[]
  addDemoPosition: (position: Omit<DemoPosition, "id" | "createdAt">) => void
  clearDemoPositions: () => void

  // Pro wallet
  wallet: { connected: boolean; address: string | null }
  setWallet: (wallet: { connected: boolean; address: string | null }) => void

  // Selected pair
  selectedPair: SelectedPair
  setSelectedPair: (pair: SelectedPair) => void

  // Avatar / XP / Streaks
  avatar: Avatar
  addXP: (amount: number, isProTrade?: boolean) => void

  // Coin shower
  showCoinShower: boolean
  triggerCoinShower: () => void

  // Search modal
  showSearchModal: boolean
  setShowSearchModal: (show: boolean) => void
}

const STREAK_BADGES = [
  { id: "green-light", days: 50, name: "Green Light" },
  { id: "flow-state", days: 100, name: "Flow State" },
  { id: "onfire", days: 150, name: "Onfire" },
  { id: "untouchable", days: 200, name: "Untouchable" },
]

function calculateLevel(xp: number): { level: number; xpToNextLevel: number } {
  // Simple level formula: 100 XP per level
  const level = Math.floor(xp / 100) + 1
  const xpToNextLevel = 100 - (xp % 100)
  return { level, xpToNextLevel }
}

function generateDemoAddress(): string {
  const chars = "0123456789ABCDEF"
  let result = "demo_0x"
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  result += "..."
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function getLocalDate(): string {
  return new Date().toISOString().split("T")[0]
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateStr === yesterday.toISOString().split("T")[0]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Mode
      mode: "demo",
      setMode: (mode) => set({ mode }),

      // Theme
      theme: "dark",
      setTheme: (theme) => {
        if (theme === "light") {
          document.documentElement.classList.add("light")
          document.documentElement.classList.remove("dark")
        } else {
          document.documentElement.classList.remove("light")
          document.documentElement.classList.add("dark")
        }
        set({ theme })
      },

      // Demo wallet
      demoWallet: null,
      initDemoWallet: () => {
        const existing = get().demoWallet
        if (!existing) {
          set({
            demoWallet: {
              demoAddress: generateDemoAddress(),
              demoCredits: 100,
              maxDemoCredits: 100,
              txHistory: [],
              createdAt: Date.now(),
            },
          })
        }
      },
      resetDemoWallet: () => {
        set({
          demoWallet: {
            demoAddress: generateDemoAddress(),
            demoCredits: 100,
            maxDemoCredits: 100,
            txHistory: [],
            createdAt: Date.now(),
          },
          demoPositions: [],
        })
      },
      deductDemoCredits: (amount) => {
        const wallet = get().demoWallet
        if (wallet) {
          set({
            demoWallet: {
              ...wallet,
              demoCredits: Math.max(0, wallet.demoCredits - amount),
            },
          })
        }
      },
      addDemoTransaction: (tx) => {
        const wallet = get().demoWallet
        if (wallet) {
          set({
            demoWallet: {
              ...wallet,
              txHistory: [...wallet.txHistory, { ...tx, id: crypto.randomUUID(), timestamp: Date.now() }],
            },
          })
        }
      },

      // Demo positions
      demoPositions: [],
      addDemoPosition: (position) => {
        set({
          demoPositions: [...get().demoPositions, { ...position, id: crypto.randomUUID(), createdAt: Date.now() }],
        })
      },
      clearDemoPositions: () => set({ demoPositions: [] }),

      // Pro wallet
      wallet: { connected: true, address: "0x2332196069342e15Fc20E55d6B57f238ec743c1E" },
      setWallet: (wallet) => set({ wallet }),

      // Selected pair
      selectedPair: { base: "HYPE", quote: "ETH" },
      setSelectedPair: (pair) => set({ selectedPair: pair }),

      // Avatar / XP / Streaks
      avatar: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        currentStreakDays: 0,
        longestStreakDays: 0,
        lastProTradeDate: null,
        streakBadgesUnlocked: [],
      },
      addXP: (amount, isProTrade = false) => {
        const { avatar } = get()
        let newXP = avatar.xp + amount
        let newStreak = avatar.currentStreakDays
        let newLongest = avatar.longestStreakDays
        let newLastDate = avatar.lastProTradeDate
        const newBadges = [...avatar.streakBadgesUnlocked]

        // Handle streak logic for Pro trades
        if (isProTrade) {
          const today = getLocalDate()

          if (newLastDate !== today) {
            // New day - process streak
            if (newLastDate && isYesterday(newLastDate)) {
              // Consecutive day
              newStreak += 1
              newXP += 25 // Streak XP
            } else {
              // Gap or first trade
              newStreak = 1
              newXP += 25 // First day streak XP
            }
            newLastDate = today

            // Update longest streak
            if (newStreak > newLongest) {
              newLongest = newStreak
            }

            // Check for new badges
            for (const badge of STREAK_BADGES) {
              if (newStreak >= badge.days && !newBadges.includes(badge.id)) {
                newBadges.push(badge.id)
              }
            }
          }
        }

        const { level, xpToNextLevel } = calculateLevel(newXP)

        set({
          avatar: {
            level,
            xp: newXP,
            xpToNextLevel,
            currentStreakDays: newStreak,
            longestStreakDays: newLongest,
            lastProTradeDate: newLastDate,
            streakBadgesUnlocked: newBadges,
          },
        })
      },

      // Coin shower
      showCoinShower: false,
      triggerCoinShower: () => {
        set({ showCoinShower: true })
        setTimeout(() => set({ showCoinShower: false }), 2500)
      },

      // Search modal
      showSearchModal: false,
      setShowSearchModal: (show) => set({ showSearchModal: show }),
    }),
    {
      name: "pearfect-storage",
      partialize: (state) => ({
        mode: state.mode,
        theme: state.theme,
        demoWallet: state.demoWallet,
        demoPositions: state.demoPositions,
        wallet: state.wallet,
        selectedPair: state.selectedPair,
        avatar: state.avatar,
      }),
    },
  ),
)
