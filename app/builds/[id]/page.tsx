import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import InventoryScreen from "@/components/inventory-screen"
import BuildMetrics from "@/components/build-metrics"
import { destinyApi } from "@/lib/destinyApi"
import type { Metadata } from "next"
import { parseTextWithGameItems } from "@/lib/parseGameItems"
import BuildVariationsDropdown from "@/components/build-variations-dropdown"
import pb from "@/lib/pocketbase"
import type { PBBuildRecord } from "../page"

// Add type for parsed items
interface ParsedItem {
  name: string;
  imageUrl: string;
  description: string;
  armorType?: string;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const build = await pb.collection('builds').getOne(resolvedParams.id, {
      requestKey: null // Disable request cancellation
    })

    // Get the exotic data to access the screenshot
    const exotics = Array.isArray(build.exotics) ? build.exotics : JSON.parse(build.exotics)
    const exoticData =
      (await destinyApi.getExoticArmor(exotics[0])) || (await destinyApi.getExoticWeapon(exotics[0]))
    const imageUrl = exoticData?.screenshot ? `https://www.bungie.net${exoticData.screenshot}` : build.imageUrl

    const tags = Array.isArray(build.tags) ? build.tags : JSON.parse(build.tags)
    const keyMods = Array.isArray(build.key_mods) ? build.key_mods : JSON.parse(build.key_mods)
    const aspects = Array.isArray(build.aspects) ? build.aspects : JSON.parse(build.aspects)
    const fragments = Array.isArray(build.fragments) ? build.fragments : JSON.parse(build.fragments)

    return {
      title: `${build.name} Build - Destiny 2 ${build.subclass} ${build.class} Build Guide`,
      description: build.description,
      openGraph: {
        title: `${build.name} Build - Destiny 2 ${build.subclass} ${build.class} Build Guide`,
        description: build.description,
        images: [imageUrl],
      },
      twitter: {
        card: "summary_large_image",
        title: `${build.name} Build - Destiny 2 ${build.subclass} ${build.class} Build Guide`,
        description: build.description,
        images: [imageUrl],
      },
      keywords: [
        "Destiny 2",
        "build guide",
        build.class,
        build.subclass,
        build.name,
        ...tags,
        ...exotics,
        ...keyMods,
        ...aspects,
        ...fragments,
      ].join(", "),
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Destiny Build Guide",
      description: "Detailed guide for Destiny 2 builds",
    }
  }
}

export default async function BuildPage({ params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params
    
    // Try to find the build directly first
    let build = await pb.collection('builds').getOne<PBBuildRecord>(resolvedParams.id, {
      requestKey: null // Disable request cancellation
    })
    let parentBuild: PBBuildRecord | null = null
    
    // If this is a variation, fetch the parent build
    if (build.parent_build_id) {
      parentBuild = await pb.collection('builds').getOne<PBBuildRecord>(build.parent_build_id, {
        requestKey: null // Disable request cancellation
      })
      
      // Merge parent build data with variation data
      build = {
        ...parentBuild,
        id: build.id,
        name: build.name,
        description: build.description,
        subclass: build.subclass,
        aspects: build.aspects,
        fragments: build.fragments,
        exotics: build.exotics,
        how_it_works: build.how_it_works,
        how_it_works2: build.how_it_works2,
        metrics: build.metrics,
        created: build.created,
        updated: build.updated,
      }
    }

    // Get all variations if this is a parent build
    const variations = parentBuild ? [] : await pb.collection('builds').getFullList<PBBuildRecord>({
      filter: `parent_build_id = "${build.id}"`,
      requestKey: null // Disable request cancellation
    })

    // Determine which builds to show in the variations dropdown
    const buildsForDropdown = parentBuild 
      ? [
          { id: parentBuild.id, name: parentBuild.name, subclass: parentBuild.subclass },
          { 
            id: build.id, 
            name: build.name, 
            subclass: build.subclass,
            hasCustomMetrics: !!build.metrics
          }
        ]
      : [
          { id: build.id, name: build.name, subclass: build.subclass },
          ...variations.map(v => ({
            id: v.id,
            name: v.name,
            subclass: v.subclass,
            hasCustomMetrics: !!v.metrics
          }))
        ]

    // Parse JSON fields
    const exotics = Array.isArray(build.exotics) ? build.exotics : JSON.parse(build.exotics)
    const keyMods = Array.isArray(build.key_mods) ? build.key_mods : JSON.parse(build.key_mods)
    const aspects = Array.isArray(build.aspects) ? build.aspects : JSON.parse(build.aspects)
    const fragments = Array.isArray(build.fragments) ? build.fragments : JSON.parse(build.fragments)
    const howItWorks = Array.isArray(build.how_it_works) ? build.how_it_works : JSON.parse(build.how_it_works)
    const howItWorks2 = build.how_it_works2 ? (Array.isArray(build.how_it_works2) ? build.how_it_works2 : JSON.parse(build.how_it_works2)) : undefined
    const metrics = build.metrics ? (typeof build.metrics === 'object' ? build.metrics : JSON.parse(build.metrics)) : undefined
    const tags = Array.isArray(build.tags) ? build.tags : JSON.parse(build.tags)

    // Fetch exotic and mod data
    const exoticsData = await Promise.all(
      exotics.map(async (exoticName: string): Promise<ParsedItem> => {
        try {
          const exoticData =
            (await destinyApi.getExoticArmor(exoticName)) || (await destinyApi.getExoticWeapon(exoticName))
          return {
            name: exoticName,
            imageUrl: exoticData ? `https://www.bungie.net${exoticData.displayProperties.icon}` : "/placeholder.svg",
            description: exoticData?.displayProperties.description || "",
          }
        } catch (error) {
          console.error(`Error fetching exotic ${exoticName}:`, error)
          return {
            name: exoticName,
            imageUrl: "/placeholder.svg",
            description: "Item data unavailable",
          }
        }
      }),
    )

    const modsData = await Promise.all(
      keyMods.map(async (modName: string): Promise<ParsedItem> => {
        try {
          const modData = await destinyApi.getMod(modName)
          return {
            name: modName,
            imageUrl: modData ? `https://www.bungie.net${modData.displayProperties.icon}` : "/placeholder.svg",
            description: modData?.displayProperties.description || "",
            armorType: modData?.armorType,
          }
        } catch (error) {
          console.error(`Error fetching mod ${modName}:`, error)
          return {
            name: modName,
            imageUrl: "/placeholder.svg",
            description: "Mod data unavailable",
            armorType: "",
          }
        }
      }),
    )

    const aspectsData = await Promise.all(
      aspects.map(async (aspectName: string): Promise<ParsedItem> => {
        const aspectData = await destinyApi.getAspect(aspectName)
        return {
          name: aspectName,
          imageUrl: aspectData ? `https://www.bungie.net${aspectData.displayProperties.icon}` : "/placeholder.svg",
          description: aspectData?.displayProperties.description || "",
        }
      }),
    )

    const fragmentsData = await Promise.all(
      fragments.map(async (fragmentName: string): Promise<ParsedItem> => {
        const fragmentData = await destinyApi.getFragment(fragmentName)
        return {
          name: fragmentName,
          imageUrl: fragmentData ? `https://www.bungie.net${fragmentData.displayProperties.icon}` : "/placeholder.svg",
          description: fragmentData?.displayProperties.description || "",
        }
      }),
    )

    // Sort mods by armor type
    const sortedModsData = [...modsData].sort((a, b) => {
      const order = { helmet: 0, arms: 1, chest: 2, legs: 3, class: 4 }
      const typeA = a.armorType || ""
      const typeB = b.armorType || ""
      return (order[typeA as keyof typeof order] ?? 999) - (order[typeB as keyof typeof order] ?? 999)
    })

    // Collection of items we've already fetched
    const existingItems = {
      exotics: exoticsData,
      mods: modsData,
      aspects: aspectsData,
      fragments: fragmentsData,
    }

    // Parse the howItWorks paragraphs
    const parsedHowItWorks = await Promise.all(
      howItWorks.map((paragraph: string, index: number) => parseTextWithGameItems(paragraph, existingItems, index === 0)),
    )

    // Parse howItWorks2 paragraphs
    const parsedHowItWorks2 = howItWorks2
      ? await Promise.all(howItWorks2.map((paragraph: string, index: number) => parseTextWithGameItems(paragraph, existingItems, index === 0)))
      : []

    // Convert PocketBase record to UI build format for the InventoryScreen component
    const uiBuild = {
      id: build.id,
      name: build.name,
      class: build.class,
      subclass: build.subclass,
      description: build.description,
      imageUrl: build.imageUrl || "/placeholder.svg", // Provide default value
      mode: build.mode,
      tags,
      exotics,
      keyMods,
      targetStats: Array.isArray(build.target_stats) ? build.target_stats : JSON.parse(build.target_stats),
      aspects,
      fragments,
      howItWorks,
      howItWorks2,
      metrics,
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/builds" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all builds
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h1 className="text-4xl font-bold">{build.name}</h1>
              
              {buildsForDropdown.length > 1 && (
                <BuildVariationsDropdown 
                  currentBuildId={build.id} 
                  variations={buildsForDropdown}
                />
              )}
            </div>
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-muted-foreground">{build.class}</span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center space-x-2">
                {tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-lg">{build.description}</p>
              <h2>How This Build Works</h2>
              <div className="space-y-4">
                {parsedHowItWorks.map((segments: (string | React.ReactElement)[], index: number) => (
                  <p key={index}>{segments}</p>
                ))}
              </div>
            </div>

            <InventoryScreen build={uiBuild} />

            {build.how_it_works2 && build.how_it_works2.length > 0 && (
              <div className="prose dark:prose-invert max-w-none mt-8">
                <h2>Additional Build Details</h2>
                <div className="space-y-4">
                  {parsedHowItWorks2.map((segments: (string | React.ReactElement)[], index: number) => (
                    <p key={index}>{segments}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Build Metrics */}
            {metrics && <BuildMetrics metrics={metrics} />}
          </div>

          <div>
            <div className="bg-card rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Key Exotics</h2>
              <div className="space-y-4">
                {exoticsData.map((exotic) => (
                  <div key={exotic.name} className="flex items-start space-x-3">
                    <div className="relative w-12 h-12 bg-black/20 rounded flex-shrink-0">
                      <Image
                        src={exotic.imageUrl || "/placeholder.svg"}
                        alt={exotic.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{exotic.name}</h3>
                      <p className="text-sm text-muted-foreground">{exotic.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold mt-8 mb-4">Key Aspects</h2>
              <div className="space-y-4">
                {aspectsData.map((aspect) => (
                  <div key={aspect.name} className="flex items-start space-x-3">
                    <div className="relative w-12 h-12 bg-black/20 rounded flex-shrink-0">
                      <Image
                        src={aspect.imageUrl || "/placeholder.svg"}
                        alt={aspect.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{aspect.name}</h3>
                      <p className="text-sm text-muted-foreground">{aspect.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold mt-8 mb-4">Key Fragments</h2>
              <div className="space-y-4">
                {fragmentsData.map((fragment) => (
                  <div key={fragment.name} className="flex items-start space-x-3">
                    <div className="relative w-12 h-12 bg-black/20 rounded flex-shrink-0">
                      <Image
                        src={fragment.imageUrl || "/placeholder.svg"}
                        alt={fragment.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{fragment.name}</h3>
                      <p className="text-sm text-muted-foreground">{fragment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              

              <h2 className="text-xl font-bold mt-8 mb-4">Key Mods</h2>
              <div className="space-y-4">
                {sortedModsData.map((mod) => (
                  <div key={mod.name} className="flex items-start space-x-3">
                    <div className="relative w-12 h-12 bg-black/20 rounded flex-shrink-0">
                      <Image
                        src={mod.imageUrl || "/placeholder.svg"}
                        alt={mod.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{mod.name}</h3>
                        {mod.armorType && (
                          <span className="text-sm text-muted-foreground capitalize">({mod.armorType})</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{mod.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error("Error rendering build page:", error)
    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/builds" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all builds
        </Link>

        <div className="bg-card rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Build</h1>
          <p className="text-muted-foreground mb-6">
            There was an error loading this build. Please try refreshing the page.
          </p>
        </div>
      </main>
    )
  }
}

