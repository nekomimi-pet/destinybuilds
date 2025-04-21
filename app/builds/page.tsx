import Image from "next/image"
import Link from "next/link"
import { destinyApi } from "@/lib/destinyApi"
import { getSubclassColor } from "@/lib/colors"
import type { Build, BuildVariation, GuardianClass, Subclass, BuildMetrics } from "@/types/destiny"
import pb from "@/lib/pocketbase"

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
  tags: string[] | string;
  exotics: string[] | string;
  key_mods: string[] | string;
  target_stats: string[] | string;
  aspects: string[] | string;
  fragments: string[] | string;
  how_it_works: string[] | string;
  how_it_works2?: string[] | string;
  metrics?: BuildMetrics | string;
  parent_build_id?: string;
}

export const metadata = {
  title: "Destiny Builds - Browse by Class and Subclass",
  description: "Find optimized Destiny 2 builds sorted by class and subclass",
}

// Sort order for subclasses
const subclassOrder = {
  Arc: 0,
  Solar: 1,
  Void: 2,
  Strand: 3,
  Stasis: 4,
  Prismatic: 5,
}

// UI-specific build interface for display purposes
interface UiBuild {
  id: string;
  name: string;
  class: GuardianClass;
  subclass: Subclass;
  description: string;
  howItWorks: string[];
  howItWorks2?: string[];
  imageUrl: string;
  tags: string[];
  exotics: { name: string; imageUrl: string }[];
  keyMods: string[];
  targetStats: ("mobility" | "resilience" | "recovery" | "discipline" | "intellect" | "strength")[];
  mode: "PvE" | "PvP";
  aspects: string[];
  fragments: string[];
  metrics?: BuildMetrics;
  variations?: BuildVariation[];
  isVariation?: boolean;
  parentBuildId?: string;
}

export default async function BuildsPage() {
  // Fetch builds from PocketBase
  const records = await pb.collection('builds').getFullList<PBBuildRecord>({
    sort: 'created',
  })

  // Process builds from PocketBase records
  const baseBuilds = await Promise.all(
    records
      .filter(record => !record.parent_build_id) // Filter out variations initially
      .map(async (record): Promise<UiBuild> => ({
        id: record.id,
        name: record.name,
        class: record.class,
        subclass: record.subclass,
        description: record.description,
        imageUrl: record.imageUrl || "/placeholder.svg",
        mode: record.mode,
        tags: Array.isArray(record.tags) ? record.tags : JSON.parse(record.tags),
        exotics: await Promise.all(
          (Array.isArray(record.exotics) ? record.exotics : JSON.parse(record.exotics)).map(async (exoticName: string) => {
            const exoticData =
              (await destinyApi.getExoticArmor(exoticName)) || (await destinyApi.getExoticWeapon(exoticName))
            return {
              name: exoticName,
              imageUrl: exoticData ? `https://www.bungie.net${exoticData.displayProperties.icon}` : "/placeholder.svg",
            }
          }),
        ),
        keyMods: Array.isArray(record.key_mods) ? record.key_mods : JSON.parse(record.key_mods),
        targetStats: Array.isArray(record.target_stats) ? record.target_stats : JSON.parse(record.target_stats),
        aspects: Array.isArray(record.aspects) ? record.aspects : JSON.parse(record.aspects),
        fragments: Array.isArray(record.fragments) ? record.fragments : JSON.parse(record.fragments),
        howItWorks: Array.isArray(record.how_it_works) ? record.how_it_works : JSON.parse(record.how_it_works),
        howItWorks2: record.how_it_works2 ? (Array.isArray(record.how_it_works2) ? record.how_it_works2 : JSON.parse(record.how_it_works2)) : undefined,
        metrics: record.metrics ? (typeof record.metrics === 'object' ? record.metrics : JSON.parse(record.metrics)) : undefined,
      }))
  )

  // Process variations
  const variationBuilds = await Promise.all(
    records
      .filter(record => record.parent_build_id) // Get only variations
      .map(async (record): Promise<UiBuild | null> => {
        const parentBuild = baseBuilds.find(build => build.id === record.parent_build_id)
        if (!parentBuild) return null

        const exoticNames = Array.isArray(record.exotics) ? record.exotics : JSON.parse(record.exotics) as string[]
        const exoticsData = await Promise.all(
          exoticNames.map(async (exoticName: string) => {
            try {
              const exoticData =
                (await destinyApi.getExoticArmor(exoticName)) || (await destinyApi.getExoticWeapon(exoticName))
              return {
                name: exoticName,
                imageUrl: exoticData ? `https://www.bungie.net${exoticData.displayProperties.icon}` : "/placeholder.svg",
              }
            } catch {
              return {
                name: exoticName,
                imageUrl: "/placeholder.svg",
              }
            }
          })
        )

        return {
          id: record.id,
          name: record.name,
          class: record.class,
          subclass: record.subclass,
          description: record.description,
          imageUrl: record.imageUrl || parentBuild.imageUrl,
          mode: record.mode,
          tags: Array.isArray(record.tags) ? record.tags : JSON.parse(record.tags),
          exotics: exoticsData,
          keyMods: Array.isArray(record.key_mods) ? record.key_mods : JSON.parse(record.key_mods),
          targetStats: Array.isArray(record.target_stats) ? record.target_stats : JSON.parse(record.target_stats),
          aspects: Array.isArray(record.aspects) ? record.aspects : JSON.parse(record.aspects),
          fragments: Array.isArray(record.fragments) ? record.fragments : JSON.parse(record.fragments),
          howItWorks: Array.isArray(record.how_it_works) ? record.how_it_works : JSON.parse(record.how_it_works),
          howItWorks2: record.how_it_works2 ? (Array.isArray(record.how_it_works2) ? record.how_it_works2 : JSON.parse(record.how_it_works2)) : undefined,
          metrics: record.metrics ? (typeof record.metrics === 'object' ? record.metrics : JSON.parse(record.metrics)) : undefined,
          isVariation: true,
          parentBuildId: record.parent_build_id,
        }
      })
  )

  // Filter out null variations and combine builds
  const builds: UiBuild[] = [...baseBuilds, ...(variationBuilds.filter((build): build is UiBuild => build !== null))]

  // Group builds by class
  const classBuckets: Record<GuardianClass, UiBuild[]> = {
    Hunter: [],
    Titan: [],
    Warlock: [],
  }

  // Sort builds into class buckets
  builds.forEach((build) => {
    classBuckets[build.class].push(build)
  })

  // For each class, sort builds by subclass
  Object.keys(classBuckets).forEach((className) => {
    classBuckets[className as GuardianClass].sort((a, b) => {
      const orderA = subclassOrder[a.subclass as keyof typeof subclassOrder] ?? 99;
      const orderB = subclassOrder[b.subclass as keyof typeof subclassOrder] ?? 99;
      return orderA - orderB;
    })
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Destiny Builds</h1>
      <p className="text-muted-foreground mb-8">Browse builds by class and subclass</p>

      <div className="space-y-16">
        {Object.entries(classBuckets).map(([className, classBuilds]) => (
          <section key={className} className="space-y-6">
            <h2 className="text-3xl font-bold border-b pb-2">{className}</h2>

            {/* Group by subclass */}
            {Array.from(new Set(classBuilds.map((build) => build.subclass)))
              .sort((a, b) => {
                const orderA = subclassOrder[a as keyof typeof subclassOrder] ?? 99;
                const orderB = subclassOrder[b as keyof typeof subclassOrder] ?? 99;
                return orderA - orderB;
              })
              .map((subclass) => (
                <div key={`${className}-${subclass}`} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getSubclassColor(subclass)}`}></div>
                    <h3 className="text-xl font-semibold">{subclass}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classBuilds
                      .filter((build) => build.subclass === subclass)
                      .map((build) => (
                        <Link
                          key={build.id}
                          href={`/builds/${build.id}`}
                          className="group flex bg-card hover:bg-card/80 rounded-lg overflow-hidden transition-colors border border-border/50"
                        >
                          <div className={`w-1 ${getSubclassColor(build.subclass)}`}></div>
                          <div className="flex-1 p-4">
                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                              {build.name}
                            </h4>
                            {build.isVariation && (
                              <div className="inline-flex items-center text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full mb-2">
                                Variation
                              </div>
                            )}
                            <div className="flex items-center space-x-2 my-2">
                              {build.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{build.description}</p>

                            <div className="flex items-center gap-2">
                              {build.exotics.slice(0, 3).map((exotic) => (
                                <div key={exotic.name} className="relative w-8 h-8 bg-black/20 rounded">
                                  <Image
                                    src={exotic.imageUrl || "/placeholder.svg"}
                                    alt={exotic.name}
                                    fill
                                    className="object-contain p-1"
                                  />
                                </div>
                              ))}
                              {build.exotics.length > 3 && (
                                <span className="text-xs text-muted-foreground">+{build.exotics.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
          </section>
        ))}
      </div>
    </main>
  )
}

