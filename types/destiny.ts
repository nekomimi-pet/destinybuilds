import type { DestinyInventoryItemDefinition, DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2"

export type ExoticType = "Armor" | "Weapon"

export type PerkTier = "S" | "A" | "B" | "C"
export type GuardianClass = "Hunter" | "Warlock" | "Titan"
export type Subclass = "Solar" | "Arc" | "Void" | "Strand" | "Stasis" | "Prismatic"
export type DPSType = "Sustained" | "Burst" | null

export interface BuildMetrics {
  versatility: number
  easeOfUse: number
  survivability: number
  dps: number
  crowdControl: number
  buffHealingSupport: number
  contentBestFor: string[]
}

export interface Perk {
  id: string
  name: string
  description: string
  column: 1 | 2
  imageUrl: string
  tier: PerkTier
}

export interface PerkCombination {
  id: string
  perk1: Perk
  perk2: Perk
  tier: PerkTier
  description: string
  aspects: string[]
  fragments: string[]
}

export interface ClassItemData {
  class: GuardianClass
  name: string
  imageUrl: string
  description: string
  perks: Perk[]
  combinations: PerkCombination[]
}

export interface GlobalData {
  exoticArmor: DestinyInventoryItemDefinition[]
  exoticWeapons: DestinyInventoryItemDefinition[]
  mods: DestinyInventoryItemDefinition[]
  aspects: DestinyInventoryItemDefinition[]
  fragments: DestinyInventoryItemDefinition[]
  sandboxPerks: DestinySandboxPerkDefinition[]
  exoticClassItems: ClassItemData[]
}

export interface ArmorItem {
  id: string
  name: string
  type: "Helmet" | "Gauntlets" | "Chest" | "Legs" | "Class Item"
  tier: "Exotic" | "Legendary" | "Rare" | "Uncommon" | "Common"
  imageUrl: string
  stats: {
    mobility?: number
    resilience?: number
    recovery?: number
    discipline?: number
    intellect?: number
    strength?: number
  }
  mods: string[]
}

export interface ArmorMod {
  id: string
  name: string
  description: string
  energy: {
    cost: number
  }
  imageUrl: string
}

export interface Exotic {
  id: string
  name: string
  type: "Weapon" | "Armor"
  description: string
  imageUrl: string
}

export interface Aspect {
  id: string
  name: string
  description: string
  imageUrl: string
}

export interface Fragment {
  id: string
  name: string
  description: string
  imageUrl: string
  subclass: Subclass
}

export interface Build {
  id: string
  name: string
  class: GuardianClass
  subclass: Subclass
  description: string
  howItWorks: string[]
  howItWorks2?: string[]
  imageUrl: string
  tags: string[]
  exotics: string[]
  keyMods: string[]
  targetStats: ("mobility" | "resilience" | "recovery" | "discipline" | "intellect" | "strength")[]
  mode: "PvE" | "PvP"
  aspects: string[]
  fragments: string[]
  metrics?: BuildMetrics
}

