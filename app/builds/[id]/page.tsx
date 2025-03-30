"use server"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import InventoryScreen from "@/components/inventory-screen"
import { dummyBuilds } from "@/data/dummy-data"
import { destinyApi } from "@/lib/destinyApi"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const build = await dummyBuilds.find((b) => b.id === resolvedParams.id) || dummyBuilds[0]
  
  // Get the exotic data to access the screenshot
  const exoticData = await destinyApi.getExoticArmor(build.exotics[0]) || await destinyApi.getExoticWeapon(build.exotics[0]);
  const imageUrl = exoticData?.screenshot 
    ? `https://www.bungie.net${exoticData.screenshot}`
    : build.imageUrl;
  
  return {
    title: `${build.name} Build - Destiny 2 ${build.subclass} ${build.class} Build Guide`,
    description: build.description,
    openGraph: {
      title: `${build.name} Build - Destiny 2 ${build.subclass} ${build.class} Build Guide`,
      description: build.description,
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${build.name} Build - Destiny 2 ${build.subclass} ${build.class} Build Guide`,
      description: build.description,
      images: [imageUrl],
    },
    keywords: [
      'Destiny 2',
      'build guide',
      build.class,
      build.subclass,
      build.name,
      ...build.tags,
      ...build.exotics,
      ...build.keyMods,
      ...build.aspects,
      ...build.fragments
    ].join(', '),
  }
}

export default async function BuildPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const build = await dummyBuilds.find((b) => b.id === resolvedParams.id) || dummyBuilds[0]

  // Fetch exotic and mod data
  const exoticsData = await Promise.all(build.exotics.map(async (exoticName) => {
    const exoticData = await destinyApi.getExoticArmor(exoticName) || await destinyApi.getExoticWeapon(exoticName);
    return {
      name: exoticName,
      imageUrl: exoticData ? `https://www.bungie.net${exoticData.displayProperties.icon}` : "/placeholder.svg",
      description: exoticData?.displayProperties.description || ""
    };
  }));

  const modsData = await Promise.all(build.keyMods.map(async (modName) => {
    const modData = await destinyApi.getMod(modName);
    return {
      name: modName,
      imageUrl: modData ? `https://www.bungie.net${modData.displayProperties.icon}` : "/placeholder.svg",
      description: modData?.displayProperties.description || "",
      armorType: modData?.armorType
    };
  }));

  // Sort mods by armor type
  const sortedModsData = [...modsData].sort((a, b) => {
    const order = { helmet: 0, arms: 1, chest: 2, legs: 3, class: 4 };
    const typeA = a.armorType || '';
    const typeB = b.armorType || '';
    return (order[typeA as keyof typeof order] ?? 999) - (order[typeB as keyof typeof order] ?? 999);
  });

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
              {build.howItWorks.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <InventoryScreen build={build} />

          {build.howItWorks2 && (
            <div className="prose dark:prose-invert max-w-none mt-8">
              <h2>Additional Build Details</h2>
              <div className="space-y-4">
                {build.howItWorks2.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-card rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Key Exotics</h2>
            <div className="space-y-4">
              {exoticsData.map((exotic) => (
                <div key={exotic.name} className="flex items-start space-x-3">
                  <div className="relative w-12 h-12 bg-black/20 rounded flex-shrink-0">
                    <Image
                      src={exotic.imageUrl}
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

            <h2 className="text-xl font-bold mt-8 mb-4">Key Mods</h2>
            <div className="space-y-4">
              {sortedModsData.map((mod) => (
                <div key={mod.name} className="flex items-start space-x-3">
                  <div className="relative w-12 h-12 bg-black/20 rounded flex-shrink-0">
                    <Image
                      src={mod.imageUrl}
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
}

