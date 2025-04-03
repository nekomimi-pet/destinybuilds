"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSubclassColor } from "@/lib/colors"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BuildVariation {
  id: string
  name: string
  subclass?: string
  hasCustomMetrics?: boolean
}

interface BuildVariationsDropdownProps {
  currentBuildId: string
  variations: BuildVariation[]
}

export default function BuildVariationsDropdown({
  currentBuildId,
  variations,
}: BuildVariationsDropdownProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const currentVariation = variations.find((v) => v.id === currentBuildId) || variations[0]

  const handleVariationSelect = (variationId: string) => {
    if (variationId !== currentBuildId) {
      router.push(`/builds/${variationId}`)
    }
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 px-4">
          <span className="mr-2">Variation: {currentVariation.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {variations.map((variation) => (
          <DropdownMenuItem
            key={variation.id}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              variation.id === currentBuildId && "bg-accent"
            )}
            onClick={() => handleVariationSelect(variation.id)}
          >
            <div className="flex items-center">
              {variation.subclass && (
                <div className={cn("w-3 h-3 rounded-full mr-2", getSubclassColor(variation.subclass))}></div>
              )}
              <span>{variation.name}</span>
              {variation.hasCustomMetrics && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-1 py-0.5 rounded-full">
                  Custom
                </span>
              )}
            </div>
            {variation.id === currentBuildId && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 