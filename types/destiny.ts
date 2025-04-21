import type { DestinyInventoryItemDefinition, DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2"

export type ExoticType = "Armor" | "Weapon"

export type PerkTier = "S" | "A" | "B" | "C"
export type GuardianClass = "Hunter" | "Warlock" | "Titan"
export type Subclass = "Solar" | "Arc" | "Void" | "Strand" | "Stasis" | "Prismatic"
export type DPSType = "Sustained" | "Burst" | null

// PocketBase build record interface
export interface PBBuildRecord {
  id: string;
  created: string;
  updated: string;
  name: string;
  class: GuardianClass;
  subclass: Subclass;
  description: string;
  imageUrl?: string;
  mode: "PvE" | "PvP";
  tags: string[];
  exotics: string[];
  key_mods: string[];
  target_stats: string[];
  aspects: string[];
  fragments: string[];
  how_it_works: string[]; 
  how_it_works2?: string[]; 
  metrics?: BuildMetrics; 
  parent_build_id?: string; // Relation to parent build (optional)
}

export interface BuildMetrics {
  versatility: number
  easeOfUse: number
  survivability: number
  dps: number
  crowdControl: number
  buffHealingSupport: number
  contentBestFor: string[]
  teamplayOrientation: number
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
  variations?: BuildVariation[]
}

export interface BuildVariation {
  id: string
  name: string
  description: string
  subclass?: Subclass  // If different from parent build
  exotics?: string[]   // If different from parent build
  aspects?: string[]   // If different from parent build
  fragments?: string[] // If different from parent build
  howItWorks?: string[] // Optional specific instructions
  howItWorks2?: string[] // Optional additional instructions
  metrics?: BuildMetrics // Optional metrics specific to this variation
}

