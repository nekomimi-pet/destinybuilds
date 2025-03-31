import { getDestinyManifest, getDestinyManifestSlice } from "bungie-api-ts/destiny2"
import type { GlobalData } from "../types/destiny"
import type { DestinyManifestSlice, DestinyInventoryItemDefinition, HttpClientConfig } from "bungie-api-ts/destiny2"

// Add static cache to preserve data between calls during build
let staticManifestCache: GlobalData | null = null
let staticLastFetchTime: number | null = null
let initializationPromise: Promise<GlobalData> | null = null

class DestinyAPI {
  private static instance: DestinyAPI
  private manifestData: GlobalData | null = null
  private lastFetchTime: number | null = null
  private readonly CACHE_DURATION = 24 * 3600 * 1000 // 24 hours
  private readonly apiKey = process.env.DESTINY_API_KEY || ""
  private isInitializing = false

  private static readonly ITEM_TYPES = {
    ARMOR: 2,
    WEAPON: 3,
    MODS: 19,
  }

  private static readonly TIER_TYPES = {
    EXOTIC: 6,
  }

  private constructor() {
    // Use static cache if available
    if (staticManifestCache && staticLastFetchTime && Date.now() - staticLastFetchTime < this.CACHE_DURATION) {
      this.manifestData = staticManifestCache
      this.lastFetchTime = staticLastFetchTime
      console.log("Using cached manifest data")
    }
    // Don't automatically initialize - we'll do it on first data access
  }

  public static getInstance(): DestinyAPI {
    if (!DestinyAPI.instance) {
      DestinyAPI.instance = new DestinyAPI()
    }
    return DestinyAPI.instance
  }

  private async $http(config: HttpClientConfig) {
    try {
      const response = await fetch(config.url, {
        headers: {
          "X-API-Key": this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  private async fetchManifestTables() {
    try {
      console.log("Fetching Destiny manifest...")
      const destinyManifest = await getDestinyManifest(this.$http.bind(this))

      console.log("Fetching manifest tables...")
      const manifestTables = await getDestinyManifestSlice(this.$http.bind(this), {
        destinyManifest: destinyManifest.Response,
        tableNames: ["DestinyInventoryItemDefinition", "DestinySandboxPerkDefinition"],
        language: "en",
      })

      console.log("Manifest tables fetched successfully")
      return manifestTables
    } catch (error) {
      console.error("Failed to fetch manifest tables:", error)
      throw error
    }
  }

  private async getManifestItems(
    manifestTables: DestinyManifestSlice<"DestinyInventoryItemDefinition"[] | "DestinySandboxPerkDefinition"[]>,
  ): Promise<GlobalData> {
    console.log("Processing manifest items")
    const startTime = Date.now()

    try {
      const items = Object.values(manifestTables.DestinyInventoryItemDefinition)
      const sandboxPerks = Object.values(manifestTables.DestinySandboxPerkDefinition)

      console.log(`Processing ${items.length} items and ${sandboxPerks.length} perks`)

      const itemMap = new Map(items.map((item) => [item.hash, item]))

      const exoticArmor = items.filter(
        (item) =>
          item.inventory?.tierType === DestinyAPI.TIER_TYPES.EXOTIC &&
          item.itemType === DestinyAPI.ITEM_TYPES.ARMOR &&
          !item.itemTypeDisplayName?.toLowerCase().includes("deprecated") &&
          item.screenshot,
      )

      const exoticWeapons = items.filter(
        (item) =>
          item.inventory?.tierType === DestinyAPI.TIER_TYPES.EXOTIC &&
          item.itemType === DestinyAPI.ITEM_TYPES.WEAPON &&
          !item.itemTypeDisplayName?.toLowerCase().includes("deprecated") &&
          item.screenshot,
      )

      const mods = items.filter(
        (item) =>
          item.itemType === DestinyAPI.ITEM_TYPES.MODS &&
          !item.itemTypeDisplayName?.toLowerCase().includes("deprecated"),
      )

      const aspects = items.filter(
        (item) =>
          item.itemTypeDisplayName?.includes("Aspect") &&
          !item.itemTypeDisplayName?.toLowerCase().includes("deprecated"),
      )

      const fragments = items.filter(
        (item) =>
          item.itemTypeDisplayName?.includes("Fragment") &&
          !item.itemTypeDisplayName?.toLowerCase().includes("deprecated"),
      )

      const addDescriptionFromSandbox = (item: DestinyInventoryItemDefinition) => {
        const matchingPerk = sandboxPerks.find((perk) => perk.displayProperties.name === item.displayProperties.name)
        if (matchingPerk) {
          return {
            ...item,
            displayProperties: {
              ...item.displayProperties,
              description: matchingPerk.displayProperties.description,
            },
          }
        }
        return item
      }

      const addExoticPerkDescription = (item: DestinyInventoryItemDefinition) => {
        if (!item.sockets?.socketEntries) return item

        // For armor items, try socket 11 first, then socket 1 if no description
        if (item.itemType === 2) {
          // Armor
          const socket11Hash = item.sockets.socketEntries[11]?.singleInitialItemHash
          if (socket11Hash) {
            const perk11Item = itemMap.get(socket11Hash)
            if (perk11Item?.displayProperties.description) {
              return {
                ...item,
                displayProperties: {
                  ...item.displayProperties,
                  description: perk11Item.displayProperties.description,
                },
              }
            }
          }

          // If socket 11 doesn't have a description, try socket 1
          const socket1Hash = item.sockets.socketEntries[1]?.singleInitialItemHash
          if (socket1Hash) {
            const perk1Item = itemMap.get(socket1Hash)
            if (perk1Item?.displayProperties.description) {
              return {
                ...item,
                displayProperties: {
                  ...item.displayProperties,
                  description: perk1Item.displayProperties.description,
                },
              }
            }
          }
          return item
        }

        // For weapons, use socket 0 (unchanged)
        const perkHash = item.sockets.socketEntries[0]?.singleInitialItemHash
        if (perkHash) {
          const perkItem = itemMap.get(perkHash)
          if (perkItem?.displayProperties.description) {
            return {
              ...item,
              displayProperties: {
                ...item.displayProperties,
                description: perkItem.displayProperties.description,
              },
            }
          }
        }
        return item
      }

      const modsWithDesc = mods.map(addDescriptionFromSandbox)
      const aspectsWithDesc = aspects.map(addDescriptionFromSandbox)
      const fragmentsWithDesc = fragments.map(addDescriptionFromSandbox)
      const exoticArmorWithDesc = exoticArmor.map(addExoticPerkDescription)
      const exoticWeaponsWithDesc = exoticWeapons.map(addExoticPerkDescription)

      const endTime = Date.now()
      const duration = endTime - startTime
      console.log(`Processing manifest items took ${duration}ms`)

      return {
        exoticArmor: exoticArmorWithDesc,
        exoticWeapons: exoticWeaponsWithDesc,
        mods: modsWithDesc,
        aspects: aspectsWithDesc,
        fragments: fragmentsWithDesc,
        sandboxPerks: sandboxPerks,
      }
    } catch (error) {
      console.error("Error processing manifest items:", error)
      throw error
    }
  }

  private async initializeManifest(): Promise<GlobalData> {
    // If we're already initializing, return the existing promise
    if (initializationPromise) {
      return initializationPromise
    }

    // Use static cache if available
    if (staticManifestCache && staticLastFetchTime && Date.now() - staticLastFetchTime < this.CACHE_DURATION) {
      this.manifestData = staticManifestCache
      this.lastFetchTime = staticLastFetchTime
      return this.manifestData
    }

    // If instance cache is valid, use it
    if (this.manifestData && this.lastFetchTime && Date.now() - this.lastFetchTime < this.CACHE_DURATION) {
      return this.manifestData
    }

    // Create a new initialization promise
    this.isInitializing = true
    initializationPromise = (async () => {
      try {
        console.log("Initializing Destiny manifest data...")
        const manifestTables = await this.fetchManifestTables()
        const data = await this.getManifestItems(manifestTables)

        // Update instance cache
        this.manifestData = data
        this.lastFetchTime = Date.now()

        // Update static cache
        staticManifestCache = data
        staticLastFetchTime = this.lastFetchTime

        console.log("Destiny manifest data initialized successfully")
        return data
      } catch (error) {
        console.error("Failed to initialize manifest:", error)
        // Clear the promise so we can try again
        initializationPromise = null
        throw error
      } finally {
        this.isInitializing = false
      }
    })()

    return initializationPromise
  }

  // Ensure manifest is initialized before accessing data
  private async ensureManifestInitialized(): Promise<GlobalData> {
    if (!this.manifestData) {
      return this.initializeManifest()
    }
    return this.manifestData
  }

  public async getManifestData(): Promise<GlobalData> {
    return this.ensureManifestInitialized()
  }

  public async getExoticArmor(armorName: string) {
    const data = await this.ensureManifestInitialized()
    return data.exoticArmor.find((armor) => armor.displayProperties.name === armorName)
  }

  public async getExoticWeapon(weaponName: string) {
    const data = await this.ensureManifestInitialized()
    return data.exoticWeapons.find((weapon) => weapon.displayProperties.name === weaponName)
  }

  public async getMod(modName: string) {
    const data = await this.ensureManifestInitialized()
    const mod = data.mods.find((mod) => mod.displayProperties.name === modName)
    if (!mod) return null

    let armorType = ""
    const displayName = mod.itemTypeDisplayName || ""
    if (displayName.includes("Helmet")) armorType = "helmet"
    else if (displayName.includes("Arms")) armorType = "arms"
    else if (displayName.includes("Chest")) armorType = "chest"
    else if (displayName.includes("Leg")) armorType = "legs"
    else if (displayName.includes("Class Item")) armorType = "class"

    return {
      ...mod,
      armorType,
    }
  }

  public async getAllExoticArmor() {
    const data = await this.ensureManifestInitialized()
    return data.exoticArmor
  }

  public async getAllExoticWeapons() {
    const data = await this.ensureManifestInitialized()
    return data.exoticWeapons
  }

  public async getAllMods() {
    const data = await this.ensureManifestInitialized()
    return data.mods
  }

  public async getAllAspects() {
    const data = await this.ensureManifestInitialized()
    return data.aspects
  }

  public async getAllFragments() {
    const data = await this.ensureManifestInitialized()
    return data.fragments
  }

  public async getAspect(aspectName: string) {
    const data = await this.ensureManifestInitialized()
    return data.aspects.find((aspect) => aspect.displayProperties.name === aspectName)
  }

  public async getFragment(fragmentName: string) {
    const data = await this.ensureManifestInitialized()
    return data.fragments.find((fragment) => fragment.displayProperties.name === fragmentName)
  }

  public async getAspectsBySubclass(subclass: "Solar" | "Arc" | "Void" | "Strand" | "Stasis") {
    const data = await this.ensureManifestInitialized()
    return data.aspects.filter((aspect) => aspect.itemTypeDisplayName?.includes(`${subclass} Aspect`))
  }

  public async getFragmentsBySubclass(subclass: "Solar" | "Arc" | "Void" | "Strand" | "Stasis") {
    const data = await this.ensureManifestInitialized()
    return data.fragments.filter((fragment) => fragment.itemTypeDisplayName?.includes(`${subclass} Fragment`))
  }

  public async refreshManifestData() {
    // Clear all caches
    this.manifestData = null
    this.lastFetchTime = null
    staticManifestCache = null
    staticLastFetchTime = null
    initializationPromise = null

    // Re-initialize
    return this.initializeManifest()
  }

  public isInitialized(): boolean {
    return this.manifestData !== null
  }
}

// Create a singleton instance
export const destinyApi = DestinyAPI.getInstance()

// Preload the manifest data
export async function preloadDestinyManifest() {
  console.log("Preloading Destiny manifest data...")
  await destinyApi.getManifestData()
  console.log("Destiny manifest data preloaded")
}

