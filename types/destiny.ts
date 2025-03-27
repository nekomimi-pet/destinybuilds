import { DestinyInventoryItemDefinition, DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2"

export type ExoticType = "Armor" | "Weapon";

export interface GlobalData {
  exoticArmor: DestinyInventoryItemDefinition[]
  exoticWeapons: DestinyInventoryItemDefinition[]
  mods: DestinyInventoryItemDefinition[]
  aspects: DestinyInventoryItemDefinition[]
  fragments: DestinyInventoryItemDefinition[]
  sandboxPerks: DestinySandboxPerkDefinition[]
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
  subclass: "Solar" | "Arc" | "Void" | "Strand" | "Stasis"
}

export interface Fragment {
  id: string
  name: string
  description: string
  imageUrl: string
  subclass: "Solar" | "Arc" | "Void" | "Strand" | "Stasis"
}

export interface Build {
  id: string
  name: string
  class: "Hunter" | "Titan" | "Warlock"
  subclass: "Solar" | "Arc" | "Void" | "Strand" | "Stasis"
  description: string
  howItWorks: string[]
  imageUrl: string
  tags: string[]
  exotics: string[]
  keyMods: string[]
  targetStats: ("mobility" | "resilience" | "recovery" | "discipline" | "intellect" | "strength")[]
  mode: "PvE" | "PvP"
  aspects: string[]
  fragments: string[]
}

