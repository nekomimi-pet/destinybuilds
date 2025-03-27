import { getDestinyManifest, getDestinyManifestSlice } from "bungie-api-ts/destiny2"
import { type GlobalData } from "../types/destiny"
import { type DestinyManifestSlice, type HttpClientConfig, type DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2"

class DestinyAPI {
    private static instance: DestinyAPI;
    private manifestData: GlobalData | null = null;
    private lastFetchTime: number | null = null;
    private readonly CACHE_DURATION = 24 * 3600 * 1000; // 24 hours
    private readonly apiKey = "93aab4d432f9427d96145cd62b8ed917"; //hardcoding because im a vibe coder

    private constructor() {
        // Initialize manifest data when the class is instantiated
        this.initializeManifest().catch(console.error);
    }

    public static getInstance(): DestinyAPI {
        if (!DestinyAPI.instance) {
            DestinyAPI.instance = new DestinyAPI();
        }
        return DestinyAPI.instance;
    }

    private async $http(config: HttpClientConfig) {
        const response = await fetch(config.url, {
            headers: {
                "X-API-Key": this.apiKey
            }
        })
        return response.json()
    }

    private async fetchManifestTables() {
        const destinyManifest = await getDestinyManifest(this.$http.bind(this));
        const manifestTables = await getDestinyManifestSlice(this.$http.bind(this), {
            destinyManifest: destinyManifest.Response,
            tableNames: ['DestinyInventoryItemDefinition', "DestinySandboxPerkDefinition"],
            language: 'en',
        });

        return manifestTables;
    }

    private async getManifestItems(manifestTables: DestinyManifestSlice<"DestinyInventoryItemDefinition"[] | "DestinySandboxPerkDefinition"[]>): Promise<GlobalData> {
        const items = Object.values(manifestTables.DestinyInventoryItemDefinition);
        const sandboxPerks = Object.values(manifestTables.DestinySandboxPerkDefinition);

        // Create a map of item hashes to items for quick lookup
        const itemMap = new Map(items.map(item => [item.hash, item]));

        //TierType 6 is exotic
        //ItemType 2 is armor
        //ItemType 3 is weapons
        //ItemType 19 is mods
        const exoticArmor = items.filter(item => 
            item.inventory?.tierType === 6 &&
            item.itemType === 2 &&
            !item.itemTypeDisplayName?.toLowerCase().includes("deprecated")
        );

        const exoticWeapons = items.filter(item => 
            item.inventory?.tierType === 6 &&
            item.itemType === 3 &&
            !item.itemTypeDisplayName?.toLowerCase().includes("deprecated")
        );

        const mods = items.filter(item => 
            item.itemType === 19 &&
            !item.itemTypeDisplayName?.toLowerCase().includes("deprecated")
        );

        const aspects = items.filter(item => 
            item.itemTypeDisplayName?.includes("Aspect") &&
            !item.itemTypeDisplayName?.toLowerCase().includes("deprecated")
        );

        const fragments = items.filter(item => 
            item.itemTypeDisplayName?.includes("Fragment") &&
            !item.itemTypeDisplayName?.toLowerCase().includes("deprecated")
        );

        // Add descriptions from sandbox perks
        const addDescriptionFromSandbox = (item: DestinyInventoryItemDefinition) => {
            const matchingPerk = sandboxPerks.find(perk => 
                perk.displayProperties.name === item.displayProperties.name
            );
            if (matchingPerk) {
                return {
                    ...item,
                    displayProperties: {
                        ...item.displayProperties,
                        description: matchingPerk.displayProperties.description
                    }
                };
            }
            return item;
        };

        // Add exotic perk descriptions from socket entries
        const addExoticPerkDescription = (item: DestinyInventoryItemDefinition) => {
            if (!item.sockets?.socketEntries) return item;

            const socketIndex = item.itemType === 2 ? 11 : 0; // 1 for armor, 0 for weapons
            const perkHash = item.sockets.socketEntries[socketIndex]?.singleInitialItemHash;
            
            if (perkHash) {
                const perkItem = itemMap.get(perkHash);
                if (perkItem?.displayProperties.description) {
                    return {
                        ...item,
                        displayProperties: {
                            ...item.displayProperties,
                            description: perkItem.displayProperties.description
                        }
                    };
                }
            }
            return item;
        };

        // Apply descriptions to all relevant items
        const modsWithDesc = mods.map(addDescriptionFromSandbox);
        const aspectsWithDesc = aspects.map(addDescriptionFromSandbox);
        const fragmentsWithDesc = fragments.map(addDescriptionFromSandbox);
        const exoticArmorWithDesc = exoticArmor.map(addExoticPerkDescription);
        const exoticWeaponsWithDesc = exoticWeapons.map(addExoticPerkDescription);
        
        return {
            exoticArmor: exoticArmorWithDesc,
            exoticWeapons: exoticWeaponsWithDesc,
            mods: modsWithDesc,
            aspects: aspectsWithDesc,
            fragments: fragmentsWithDesc,
            sandboxPerks: sandboxPerks
        }
    }

    private async initializeManifest(): Promise<GlobalData> {
        // Check if we have cached data and if it's still valid
        if (this.manifestData && this.lastFetchTime && Date.now() - this.lastFetchTime < this.CACHE_DURATION) {
            return this.manifestData;
        }

        // If no cache or expired, fetch new data
        const manifestTables = await this.fetchManifestTables();
        this.manifestData = await this.getManifestItems(manifestTables);
        this.lastFetchTime = Date.now();
        return this.manifestData;
    }

    public async getManifestData(): Promise<GlobalData> {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!;
    }

    public async getExoticArmor(armorName: string) {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.exoticArmor.find(armor => armor.displayProperties.name === armorName);
    }

    public async getExoticWeapon(weaponName: string) {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.exoticWeapons.find(weapon => weapon.displayProperties.name === weaponName);
    }

    public async getMod(modName: string) {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.mods.find(mod => mod.displayProperties.name === modName);
    }

    public async getAllExoticArmor() {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.exoticArmor;
    }

    public async getAllExoticWeapons() {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.exoticWeapons;
    }

    public async getAllMods() {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.mods;
    }

    public async getAspect(aspectName: string) {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.aspects.find(aspect => aspect.displayProperties.name === aspectName);
    }

    public async getFragment(fragmentName: string) {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.fragments.find(fragment => fragment.displayProperties.name === fragmentName);
    }

    public async getAllAspects() {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.aspects;
    }

    public async getAllFragments() {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.fragments;
    }

    public async getAspectsBySubclass(subclass: "Solar" | "Arc" | "Void" | "Strand" | "Stasis") {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.aspects.filter(aspect => 
            aspect.itemTypeDisplayName?.includes(`${subclass} Aspect`)
        );
    }

    public async getFragmentsBySubclass(subclass: "Solar" | "Arc" | "Void" | "Strand" | "Stasis") {
        if (!this.manifestData) {
            await this.initializeManifest();
        }
        return this.manifestData!.fragments.filter(fragment => 
            fragment.itemTypeDisplayName?.includes(`${subclass} Fragment`)
        );
    }

    public async refreshManifestData() {
        this.manifestData = null;
        this.lastFetchTime = null;
        return this.initializeManifest();
    }

    public isInitialized(): boolean {
        return this.manifestData !== null;
    }
}

export const destinyApi = DestinyAPI.getInstance();
