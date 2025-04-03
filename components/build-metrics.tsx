"use client"

import { useState } from "react"
import type { BuildMetrics as BuildMetricsType } from "@/types/destiny"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BuildMetricsProps {
  metrics: BuildMetricsType
}

export default function BuildMetrics({ metrics }: BuildMetricsProps) {
  const [showTooltips, setShowTooltips] = useState(true)

  const getColorForRating = (rating: number) => {
    if (rating >= 9) return "bg-emerald-500"
    if (rating >= 7) return "bg-green-500"
    if (rating >= 5) return "bg-yellow-500"
    if (rating >= 3) return "bg-orange-500"
    return "bg-red-500"
  }

  const getDPSTypeColor = (type: string | null) => {
    if (type === "Burst") return "bg-purple-500 hover:bg-purple-600"
    if (type === "Sustained") return "bg-blue-500 hover:bg-blue-600"
    return "bg-gray-500 hover:bg-gray-600"
  }

  const tooltips = {
    versatility: "How well this build adapts to different situations and content types",
    easeOfUse: "How simple this build is to use effectively",
    survivability: "How well this build keeps you alive in difficult content",
    dps: "How much damage this build can output",
    crowdControl: "How effectively this build can control groups of enemies",
    buffHealingSupport: "How well this build supports teammates with buffs, healing, or other utility",
    contentBestFor: "The types of content this build excels in",
    teamplayOrientation: "How well-suited this build is for solo vs team play",
  }

  const getTeamplayLabel = (rating: number) => {
    if (rating <= 3) return "Solo"
    if (rating <= 7) return "Balanced"
    return "Teamplay"
  }

  const getTeamplayColor = (rating: number) => {
    if (rating <= 3) return "bg-blue-500"
    if (rating <= 7) return "bg-purple-500"
    return "bg-green-500"
  }

  return (
    <div className="bg-card rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Build Performance</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <Info className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="max-w-xs">Metrics are rated from 1-10, with 10 being the highest.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        <TooltipProvider>
          {/* Versatility */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium flex items-center gap-1 cursor-help">Versatility</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tooltips.versatility}</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-medium">{metrics.versatility}/10</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getColorForRating(metrics.versatility)} rounded-full transition-all`}
                style={{ width: `${metrics.versatility * 10}%` }}
              />
            </div>
          </div>

          {/* Ease of Use */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium flex items-center gap-1 cursor-help">Ease of Use</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tooltips.easeOfUse}</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-medium">{metrics.easeOfUse}/10</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getColorForRating(metrics.easeOfUse)} rounded-full transition-all`}
                style={{ width: `${metrics.easeOfUse * 10}%` }}
              />
            </div>
          </div>

          {/* Survivability */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium flex items-center gap-1 cursor-help">Survivability</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tooltips.survivability}</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-medium">{metrics.survivability}/10</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getColorForRating(metrics.survivability)} rounded-full transition-all`}
                style={{ width: `${metrics.survivability * 10}%` }}
              />
            </div>
          </div>

          {/* DPS */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium flex items-center gap-1 cursor-help">DPS</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tooltips.dps}</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-medium">{metrics.dps}/10</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getColorForRating(metrics.dps)} rounded-full transition-all`}
                style={{ width: `${metrics.dps * 10}%` }}
              />
            </div>
          </div>

          {/* Crowd Control */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium flex items-center gap-1 cursor-help">Crowd Control</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tooltips.crowdControl}</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-medium">{metrics.crowdControl}/10</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getColorForRating(metrics.crowdControl)} rounded-full transition-all`}
                style={{ width: `${metrics.crowdControl * 10}%` }}
              />
            </div>
          </div>

          {/* Buff/Healing/Support */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium flex items-center gap-1 cursor-help">Buff/Healing/Support</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tooltips.buffHealingSupport}</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-medium">{metrics.buffHealingSupport}/10</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getColorForRating(metrics.buffHealingSupport)} rounded-full transition-all`}
                style={{ width: `${metrics.buffHealingSupport * 10}%` }}
              />
            </div>
          </div>

          {/* Teamplay Orientation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium flex items-center gap-1 cursor-help">Playstyle</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tooltips.teamplayOrientation}</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-medium">{getTeamplayLabel(metrics.teamplayOrientation)}</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getTeamplayColor(metrics.teamplayOrientation)} rounded-full transition-all`}
                style={{ width: `${metrics.teamplayOrientation * 10}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Solo</span>
              <span>Balanced</span>
              <span>Teamplay</span>
            </div>
          </div>
        </TooltipProvider>

        {/* Content Best For */}
        {metrics.contentBestFor && metrics.contentBestFor.length > 0 && (
          <div className="pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-wrap gap-2">
                    {metrics.contentBestFor.map((content, index) => (
                      <Badge key={index} className="bg-blue-500 hover:bg-blue-600">
                        {content}
                      </Badge>
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tooltips.contentBestFor}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  )
}

