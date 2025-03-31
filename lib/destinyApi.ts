import { getDestinyManifest, getDestinyManifestSlice } from "bungie-api-ts/destiny2"
import type { GlobalData } from "../types/destiny"
import type { DestinyManifestSlice, DestinyInventoryItemDefinition, HttpClientConfig } from "bungie-api-ts/destiny2"

class DestinyAPI {
    private static instance: DestinyAPI;
    private manifestData: GlobalData | null = null;
    private lastFetchTime: number | null = null;
    private readonly CACHE_DURATION = 24 * 3600 * 1000; // 24 hours
    private readonly apiKey = process.env.DESTINY_API_KEY || '';

    private static readonly ITEM_TYPES = {
        ARMOR: 2,
        WEAPON: 3,
        MODS: 19,
    }

    private static readonly TIER_TYPES = {
        EXOTIC: 6,
    }

    private constructor() {
        if (!this.apiKey) {
            throw new Error('Destiny API key is not configured');
        }
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

        console.log("Manifest tables fetched");

        return manifestTables;
    }

    private async getManifestItems(manifestTables: DestinyManifestSlice<"DestinyInventoryItemDefinition"[] | "DestinySandboxPerkDefinition"[]>): Promise<GlobalData> {
        console.log("Processing manifest items");
        let startTime = Date.now();

        const items = Object.values(manifestTables.DestinyInventoryItemDefinition);
        const sandboxPerks = Object.values(manifestTables.DestinySandboxPerkDefinition);

        const itemMap = new Map(items.map(item => [item.hash, item]));

        const exoticArmor = items.filter(item =>
            item.inventory?.tierType === DestinyAPI.TIER_TYPES.EXOTIC &&
            item.itemType === DestinyAPI.ITEM_TYPES.ARMOR &&
            !item.itemTypeDisplayName?.toLowerCase().includes("deprecated") &&
            item.screenshot
        );
        
        const exoticWeapons = items.filter(item =>
            item.inventory?.tierType === DestinyAPI.TIER_TYPES.EXOTIC &&
            item.itemType === DestinyAPI.ITEM_TYPES.WEAPON &&
            !item.itemTypeDisplayName?.toLowerCase().includes("deprecated") &&
            item.screenshot
        );

        const mods = items.filter(item =>
            item.itemType === DestinyAPI.ITEM_TYPES.MODS &&
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

        const addExoticPerkDescription = (item: DestinyInventoryItemDefinition) => {
            if (!item.sockets?.socketEntries) return item;

            const socketIndex = item.itemType === 2 ? 11 : 0; // 11 for armor, 0 for weapons
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

        const modsWithDesc = mods.map(addDescriptionFromSandbox);
        const aspectsWithDesc = aspects.map(addDescriptionFromSandbox);
        const fragmentsWithDesc = fragments.map(addDescriptionFromSandbox);
        const exoticArmorWithDesc = exoticArmor.map(addExoticPerkDescription);
        const exoticWeaponsWithDesc = exoticWeapons.map(addExoticPerkDescription);

        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`Processing manifest items took ${duration}ms`);

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
        if (this.manifestData && this.lastFetchTime && Date.now() - this.lastFetchTime < this.CACHE_DURATION) {
            return this.manifestData;
        }

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
        const mod = this.manifestData!.mods.find(mod => mod.displayProperties.name === modName);
        if (!mod) return null;

        let armorType = "";
        const displayName = mod.itemTypeDisplayName || "";
        if (displayName.includes("Helmet")) armorType = "helmet";
        else if (displayName.includes("Arms")) armorType = "arms";
        else if (displayName.includes("Chest")) armorType = "chest";
        else if (displayName.includes("Leg")) armorType = "legs";
        else if (displayName.includes("Class Item")) armorType = "class";

        return {
            ...mod,
            armorType
        };
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

//Globalize the instance to stop nextjs dev server from losing it on hot reloads
declare global {
    var destinyApi: DestinyAPI | undefined;
}

export const destinyApi =
    global.destinyApi || (global.destinyApi = DestinyAPI.getInstance());