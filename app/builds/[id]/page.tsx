import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import InventoryScreen from "@/components/inventory-screen"
import BuildMetrics from "@/components/build-metrics"
import { dummyBuilds } from "@/data/dummy-data"
import { destinyApi } from "@/lib/destinyApi"
import type { Metadata } from "next"
import { parseTextWithGameItems } from "@/lib/parseGameItems"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const build = (await dummyBuilds.find((b) => b.id === resolvedParams.id)) || dummyBuilds[0]

    // Get the exotic data to access the screenshot
    const exoticData =
      (await destinyApi.getExoticArmor(build.exotics[0])) || (await destinyApi.getExoticWeapon(build.exotics[0]))
    const imageUrl = exoticData?.screenshot ? `https://www.bungie.net${exoticData.screenshot}` : build.imageUrl

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
        ...build.tags,
        ...build.exotics,
        ...build.keyMods,
        ...build.aspects,
        ...build.fragments,
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
    const build = (await dummyBuilds.find((b) => b.id === resolvedParams.id)) || dummyBuilds[0]

    // Fetch exotic and mod data
    const exoticsData = await Promise.all(
      build.exotics.map(async (exoticName) => {
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
      build.keyMods.map(async (modName) => {
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
      build.aspects.map(async (aspectName) => {
        const aspectData = await destinyApi.getAspect(aspectName)
        return {
          name: aspectName,
          imageUrl: aspectData ? `https://www.bungie.net${aspectData.displayProperties.icon}` : "/placeholder.svg",
          description: aspectData?.displayProperties.description || "",
        }
      }),
    )

    const fragmentsData = await Promise.all(
      build.fragments.map(async (fragmentName) => {
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

    // Parse the howItWorks paragraphs - the first call resets tracking
    const parsedHowItWorks = await Promise.all(
      build.howItWorks.map((paragraph, index) => parseTextWithGameItems(paragraph, existingItems, index === 0)),
    )

    // Parse howItWorks2 paragraphs - don't reset tracking since we continue from howItWorks
    const parsedHowItWorks2 = build.howItWorks2
      ? await Promise.all(build.howItWorks2.map((paragraph) => parseTextWithGameItems(paragraph, existingItems, false)))
      : []

    // Default metrics if none are provided
    const defaultMetrics = {
      killPotential: 5,
      abilityUptime: 5,
      survivability: 5,
      crowdControl: 5,
      consistency: 5,
      easeOfUse: 5,
      dpsType: null,
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all builds
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-2">{build.name}</h1>
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-muted-foreground">{build.class}</span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center space-x-2">
                {build.tags.map((tag) => (
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

            <InventoryScreen build={build} />

            {build.howItWorks2 && build.howItWorks2.length > 0 && (
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
            {build.metrics && <BuildMetrics metrics={build.metrics} />}
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
        <Link href="/" className="flex items-center text-primary mb-6 hover:underline">
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

