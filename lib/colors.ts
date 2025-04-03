/* Colors for the Destiny theme defined in tailwind.config.js
destiny: {
    solar: "#F5793B",
    arc: "#7AECF3",
    void: "#B184C5",
    stasis: "#4D88FF",
    strand: "#3FD780",
}*/

enum SubclassColors {
    solar = "#F5793B",
    arc = "#7AECF3",
    void = "#B184C5",
    stasis = "#4D88FF",
    strand = "#3FD780",
    prismatic = "bg-gradient-to-r from-destiny-arc via-destiny-solar to-destiny-void",
}

import type { Subclass } from "@/types/destiny"

export const subclassColors = {
  Solar: "bg-destiny-solar",
  Arc: "bg-destiny-arc",
  Void: "bg-destiny-void",
  Strand: "bg-destiny-strand",
  Stasis: "bg-destiny-stasis",
  Prismatic: "bg-gradient-to-r from-destiny-arc via-destiny-solar to-destiny-void",
} as const

export const textColors = {
  Solar: "text-destiny-solar",
  Arc: "text-destiny-arc",
  Void: "text-destiny-void",
  Strand: "text-destiny-strand",
  Stasis: "text-destiny-stasis",
  Prismatic: "text-destiny-arc",
} as const

export const getSubclassColor = (subclass: Subclass | string) => {
  if (subclass === "Prismatic") {
    return "bg-gradient-to-r from-destiny-arc via-destiny-solar to-destiny-void"
  }
  return subclassColors[subclass as keyof typeof subclassColors] || "bg-gray-500"
}

export const getTextColor = (subclass: Subclass | string) => {
  return textColors[subclass as keyof typeof textColors] || "text-gray-500"
}

export const getSubclassGradient = (subclass: Subclass | string) => {
  if (subclass === "Prismatic") {
    return "bg-gradient-to-r from-destiny-arc via-destiny-solar to-destiny-void"
  }
  return `bg-gradient-to-r from-destiny-${subclass.toLowerCase()} to-destiny-${subclass.toLowerCase()}/50`
}

