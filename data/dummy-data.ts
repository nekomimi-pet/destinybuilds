import type { Build } from "@/types/destiny"

export const dummyBuilds: Build[] = [
  {
    id: "nighthawk",
    name: "Celestial Nighthawk",
    class: "Hunter",
    subclass: "Solar",
    description: "A high-damage build focused on maximizing Golden Gun damage for boss encounters.",
    howItWorks: [
      "The key thing with this build isn't really maxing intellect and forgetting about it, but using the fragments and mods to spam grenades and melees to maximize super energy.",
      "Gunpowder Gamble is great for this as its essentially a free grenade every so often for more super. Knock 'Em Down isn't essential, but the longer super time may be useful.",
      "If you did not know too, Celestial Nighthawk applies to Still Hunt as well and turns the three bullets into one super bullet."
    ],
    imageUrl: "/placeholder.svg?height=300&width=600",
    tags: ["PvE", "Boss DPS", "Solar"],
    exotics: ["Celestial Nighthawk", "Still Hunt"],
    keyMods: ["Heavy Handed", "Focusing Strike", "Bomber", "Ashes to Assets", "Hands-On"],
    targetStats: ["mobility", "discipline", "strength"],
    mode: "PvE",
    aspects: ["Knock 'Em Down", "Gunpowder Gamble"],
    fragments: ["Ember of Wonder", "Ember of Searing", "Ember of Benevolence", "Ember of Torches", "Ember of Blistering"]
  }
]

