"use client"

import { Trophy, Flame, Star, HelpCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAppStore } from "@/lib/store"

const STREAK_BADGES = [
  { id: "green-light", days: 50, name: "Green Light", icon: "🟢" },
  { id: "flow-state", days: 100, name: "Flow State", icon: "🌊" },
  { id: "onfire", days: 150, name: "Onfire", icon: "🔥" },
  { id: "untouchable", days: 200, name: "Untouchable", icon: "👑" },
]

export function AvatarDropdown() {
  const { avatar } = useAppStore()
  const progress = ((100 - avatar.xpToNextLevel) / 100) * 100

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 transition-colors hover:bg-muted">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {avatar.level}
          </div>
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-xs font-medium text-foreground">Level {avatar.level}</span>
            <span className="text-xs text-muted-foreground">{avatar.xp} XP</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-4">
        <div className="space-y-4">
          {/* Level & XP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Level {avatar.level}</span>
              </div>
              <span className="text-sm text-muted-foreground">{avatar.xp} XP</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {avatar.xpToNextLevel} XP to Level {avatar.level + 1}
            </p>
          </div>

          {/* Streaks */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-foreground">Streak: {avatar.currentStreakDays} days</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[200px] text-xs">Make at least one Pro trade per day to keep your streak.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground">Best: {avatar.longestStreakDays} days</p>
          </div>

          {/* Badges */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Badges</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STREAK_BADGES.map((badge) => {
                const unlocked = avatar.streakBadgesUnlocked.includes(badge.id)
                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs ${
                      unlocked ? "border-primary/50 bg-primary/10" : "border-border bg-muted opacity-50"
                    }`}
                  >
                    <span>{badge.icon}</span>
                    <span className={unlocked ? "text-foreground" : "text-muted-foreground"}>{badge.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
