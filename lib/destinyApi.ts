import { getDestinyManifest, getDestinyManifestSlice } from "bungie-api-ts/destiny2"
import type { ClassItemData, GlobalData, GuardianClass, Perk, PerkCombination, PerkTier } from "../types/destiny"
import type { DestinyManifestSlice, DestinyInventoryItemDefinition, HttpClientConfig } from "bungie-api-ts/destiny2"

// Define extended manifest slice type that includes ClassItemManifest
interface ExtendedDestinyManifestSlice extends DestinyManifestSlice<"DestinyInventoryItemDefinition"[] | "DestinySandboxPerkDefinition"[]> {
  ClassItemManifest: {
    [hash: number]: {
      hash: number;
      sockets: {
        [socketIndex: string]: {
          rewardPlugItems: Array<{
            plugItemHash: number;
          }>;
        };
      };
    };
  };
}

// Add static cache to preserve data between calls during build
let staticManifestCache: GlobalData | null = null;
let staticLastFetchTime: number | null = null;
let initializationPromise: Promise<GlobalData> | null = null;

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
      // For browser environments, use server API routes to avoid CORS
      if (typeof window !== 'undefined') {
        // Convert Bungie API URL to our own API route
        const url = new URL(config.url);
        const apiPath = url.pathname + url.search;
        const proxyUrl = `/api/bungie-proxy?path=${encodeURIComponent(apiPath)}`;
        
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return response.json();
      } else {
        // Server-side code can call the API directly
        const response = await fetch(config.url, {
          headers: {
            "X-API-Key": this.apiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
      }
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  private async fetchManifestTables(): Promise<ExtendedDestinyManifestSlice> {
    try {
      console.log("Fetching Destiny manifest...")
      const destinyManifest = await getDestinyManifest(this.$http.bind(this))
      console.log("Destiny manifest fetched successfully")

      console.log("Fetching manifest tables...");
      const manifestTables = await getDestinyManifestSlice(this.$http.bind(this), {
        destinyManifest: destinyManifest.Response,
        tableNames: ["DestinyInventoryItemDefinition", "DestinySandboxPerkDefinition"],
        language: "en",
      }) as ExtendedDestinyManifestSlice;
      console.log("Main manifest tables fetched successfully")

      console.log("Fetching Exotic Class Item Manifest from deepsight.gg...");
      let classItemManifest;
      
      // For browser environments, use our proxy
      if (typeof window !== 'undefined') {
        const proxyUrl = `/api/bungie-proxy?path=${encodeURIComponent('/deepsight-proxy?url=https://deepsight.gg/manifest/DeepsightSocketExtendedDefinition.json')}`;
        const classItemResponse = await fetch(proxyUrl);
        if (!classItemResponse.ok) {
          throw new Error(`Failed to fetch class item manifest: ${classItemResponse.status} ${classItemResponse.statusText}`);
        }
        classItemManifest = await classItemResponse.json();
      } else {
        // Server-side can fetch directly
        const classItemResponse = await fetch("https://deepsight.gg/manifest/DeepsightSocketExtendedDefinition.json");
        if (!classItemResponse.ok) {
          throw new Error(`Failed to fetch class item manifest: ${classItemResponse.status} ${classItemResponse.statusText}`);
        }
        classItemManifest = await classItemResponse.json();
      }
      
      // Validate that it's an object
      if (typeof classItemManifest !== 'object' || classItemManifest === null) {
        throw new Error('Class item manifest is not an object');
      }

      console.log(`Received class item manifest with ${Object.keys(classItemManifest).length} items`);
      manifestTables.ClassItemManifest = classItemManifest;

      // Validate that we have the required class item data
      const requiredHashes = [266021826, 2273643087, 2809120022]; // Titan, Warlock, Hunter
      const missingHashes = requiredHashes.filter(hash => 
        !classItemManifest[hash]
      );
      
      if (missingHashes.length > 0) {
        throw new Error(`Missing required class items with hashes: ${missingHashes.join(', ')}`);
      }

      console.log("All manifest tables fetched and validated successfully")
      return manifestTables
    } catch (error) {
      console.error("Failed to fetch manifest tables:", error)
      throw error
    }
  }

  private async buildExoticClassItemData(
    manifestTables: ExtendedDestinyManifestSlice,
    itemMap: Map<number, DestinyInventoryItemDefinition>
  ): Promise<ClassItemData[]> {
    console.log("Building exotic class item data...");
    const classItems = {
      TITAN: {
        hash: 266021826,
        class: "Titan" as GuardianClass,
        name: "Stoicism"
      },
      WARLOCK: {
        hash: 2273643087,
        class: "Warlock" as GuardianClass,
        name: "Solipsism"
      },
      HUNTER: {
        hash: 2809120022,
        class: "Hunter" as GuardianClass,
        name: "Relativism"
      }
    }

    const classItemData: ClassItemData[] = []
    const perksByName = new Map<string, Perk>();
    
    const perkInfo = (name: string, defaultColumn: 1 | 2 = 1): Perk => {
      const perk = perksByName.get(name);
      if (!perk) {
        console.warn(`Perk with name "${name}" not found in manifest, using placeholder`);
        return {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          description: `Description for ${name} not found`,
          column: defaultColumn,
          imageUrl: "/placeholder.svg",
          tier: "B"
        };
      }
      return perk;
    };

    for (const [className, item] of Object.entries(classItems)) {
      console.log(`Processing ${className} class item (hash: ${item.hash})...`);
      
      // Get base class item data using the itemMap
      const classItemDef = itemMap.get(item.hash);
      if (!classItemDef) {
        console.error(`Missing DestinyInventoryItemDefinition for hash ${item.hash}`);
        continue;
      }
      
      // Get socket data for perks
      const classItemSocketData = manifestTables.ClassItemManifest[item.hash];
      if (!classItemSocketData) {
        console.error(`Missing ClassItemManifest data for hash ${item.hash}`);
        continue;
      }

      console.log(`Found socket data for ${className}, processing perks...`);

      // Validate socket data
      if (!classItemSocketData.sockets["10"] || !classItemSocketData.sockets["11"]) {
        console.error(`Missing required sockets 10 or 11 for ${className}`);
        continue;
      }

      // Transform perks from column 1 (socket 10)
      const column1Perks = classItemSocketData.sockets["10"].rewardPlugItems.map(
        plugItem => {
          // Use itemMap for perk lookup
          const perkDef = itemMap.get(plugItem.plugItemHash);
          if (!perkDef) {
            console.error(`Missing perk definition for hash ${plugItem.plugItemHash}`);
            return null;
          }
          const perk: Perk = {
            id: plugItem.plugItemHash.toString(),
            name: perkDef.displayProperties.name,
            description: perkDef.displayProperties.description,
            column: 1,
            imageUrl: `https://www.bungie.net${perkDef.displayProperties.icon}`,
            tier: "B" // Placeholder tier
          }
          // Add to perk map for easy lookup
          perksByName.set(perk.name, perk);
          return perk;
        }
      ).filter((perk): perk is NonNullable<typeof perk> => perk !== null)

      // Transform perks from column 2 (socket 11)
      const column2Perks = classItemSocketData.sockets["11"].rewardPlugItems.map(
        plugItem => {
          // Use itemMap for perk lookup
          const perkDef = itemMap.get(plugItem.plugItemHash);
          if (!perkDef) {
            console.error(`Missing perk definition for hash ${plugItem.plugItemHash}`);
            return null;
          }
          const perk: Perk = {
            id: plugItem.plugItemHash.toString(),
            name: perkDef.displayProperties.name,
            description: perkDef.displayProperties.description,
            column: 2,
            imageUrl: `https://www.bungie.net${perkDef.displayProperties.icon}`,
            tier: "B" // Placeholder tier
          }
          // Add to perk map for easy lookup
          perksByName.set(perk.name, perk);
          return perk;
        }
      ).filter((perk): perk is NonNullable<typeof perk> => perk !== null)

      console.log(`Found ${column1Perks.length} perks in column 1 and ${column2Perks.length} perks in column 2`);

      // Build the ClassItemData object
      classItemData.push({
        class: item.class,
        name: classItemDef.displayProperties.name,
        imageUrl: `https://www.bungie.net${classItemDef.displayProperties.icon}`,
        description: classItemDef.flavorText,
        perks: [...column1Perks, ...column2Perks],
        combinations: [] // TODO: Add combinations from database later
      })
    }

    let hunterCombinations: PerkCombination[] = [];

    // Now you can use perkInfo to retrieve perks by name
    hunterCombinations.push({
      id: "hunter-combination-1",
      perk1: perkInfo("Spirit of the Ophidian", 1),
      perk2: perkInfo("Spirit of the Cyrtarachne", 2),
      tier: "A",
      description: "A great combination for PvP as handling is always helpful, and gaining Woven Mail is always a plus",
      aspects: ["Stylish Executioner", "Gunpowder Gamble"],
      fragments: ["Echo of Persistence", "Echo of Undermining"]
    });

    classItemData[2].combinations = hunterCombinations;
    
    // Log available perks for reference
    console.log("Available perks by name:");
    perksByName.forEach((perk, name) => {
      console.log(`- ${name} (Column ${perk.column})`);
    });

    console.log(`Built data for ${classItemData.length} exotic class items`);
    return classItemData
  }

  private async getManifestItems(
    manifestTables: ExtendedDestinyManifestSlice,
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

        // For weapons, use socket 0
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

      // Build exotic class items data
      const exoticClassItems = await this.buildExoticClassItemData(manifestTables, itemMap)

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
        exoticClassItems: exoticClassItems
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
    console.log("ensureManifestInitialized called, current state:", {
      hasManifestData: !!this.manifestData,
      isInitializing: this.isInitializing,
      hasInitPromise: !!initializationPromise
    })
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

  public async getExoticClassItems() {
    console.log("getExoticClassItems called")
    const data = await this.ensureManifestInitialized()
    console.log("Manifest data:", {
      hasData: !!data,
      hasExoticClassItems: !!data?.exoticClassItems,
      itemCount: data?.exoticClassItems?.length
    })
    return data.exoticClassItems
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

