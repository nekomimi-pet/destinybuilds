import Image from "next/image"
import Link from "next/link"
import { dummyBuilds } from "@/data/dummy-data"
import { destinyApi } from "@/lib/destinyApi"
import { getSubclassColor } from "@/lib/colors"
import type { Build, BuildVariation, GuardianClass, Subclass, BuildMetrics } from "@/types/destiny"

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
  // Fetch and process builds
  const baseBuilds = await Promise.all(
    dummyBuilds.map(async (build): Promise<UiBuild> => ({
      ...build,
      exotics: await Promise.all(
        build.exotics.map(async (exoticName) => {
          const exoticData =
            (await destinyApi.getExoticArmor(exoticName)) || (await destinyApi.getExoticWeapon(exoticName))
          return {
            name: exoticName,
            imageUrl: exoticData ? `https://www.bungie.net${exoticData.displayProperties.icon}` : "/placeholder.svg",
          }
        }),
      ),
    })),
  )
  
  // Process variations with different subclasses as separate builds
  const variationBuilds = (await Promise.all(
    baseBuilds.flatMap(async (build) => {
      if (!build.variations) return []
      
      // Only include variations with different subclasses
      const subclassVariations = build.variations.filter(variation => 
        variation.subclass && variation.subclass !== build.subclass
      )
      
      if (subclassVariations.length === 0) return []
      
      return Promise.all(
        subclassVariations.map(async (variation): Promise<UiBuild> => {
          // For variations we need to merge with the parent build
          const exoticNames = variation.exotics || build.exotics.map(e => e.name)
          
          // Fetch exotic data for the variation
          const exoticsData = await Promise.all(
            exoticNames.map(async (exoticName) => {
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
            ...build,
            id: variation.id,
            name: variation.name || build.name,
            description: variation.description || build.description,
            subclass: variation.subclass!,
            aspects: variation.aspects || build.aspects,
            fragments: variation.fragments || build.fragments,
            exotics: exoticsData,
            isVariation: true,
            parentBuildId: build.id,
            // Use variation metrics if available, otherwise use parent metrics
            metrics: variation.metrics || build.metrics
          }
        })
      )
    })
  )).flat()
  
  // Combine base builds with variation builds
  const builds: UiBuild[] = [...baseBuilds, ...variationBuilds]

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

