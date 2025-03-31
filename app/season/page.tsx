import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { dummyBuilds } from "@/data/dummy-data"
import { destinyApi } from "@/lib/destinyApi"

export const metadata = {
  title: "Season 26: Episode: Heresy - Recommended Builds for All Activities",
  description: "Find the best builds for each activity in the current season of Destiny 2",
  openGraph: {
    title: "Season 26: Episode: Heresy - Recommended Builds for All Activities",
    description: "Find the best builds for each activity in the current season of Destiny 2",
    images: [
      { url: "https://www.bungie.net/img/destiny_content/pgcr/raid_kings_fall.jpg" },
    ],
  },
}

export default async function SeasonPage() {
  // Get builds for recommendations with exotic images
  const allBuilds = await Promise.all(
    dummyBuilds.map(async (build) => ({
      ...build,
      exotics: await Promise.all(
        build.exotics.slice(0, 2).map(async (exoticName) => {
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

  // Activity types with their recommended builds
  const activityTypes = [
    {
      name: "Episodic Activities",
      description: "Recommended builds for the seasonal story missions and activities",
      activities: [
        {
          name: "Court of Blades",
          description: "Take on all challengers to sword logic in Oryx's old Court on the Dreadnaught.",
          image: "https://www.bungie.net/img/destiny_content/pgcr/court_of_blades.jpg",
          difficulty: "Medium",
          recommendedBuilds: [
            {
              build: allBuilds[0],
              reason: "High damage output against champions and elite enemies. The super regeneration helps clear waves of enemies efficiently."
            },
            {
              build: allBuilds[2],
              reason: "Excellent add clear with solar grenades. Heat Rises provides mobility to navigate the vertical spaces in the Court."
            }
          ],
        },
        {
          name: "Nether",
          description: "Journey aboard the Dreadnaught to discover secrets in the gloam.",
          image: "https://www.bungie.net/img/destiny_content/pgcr/nether.jpg",
          difficulty: "Medium-High",
          recommendedBuilds: [
            {
              build: allBuilds[1],
              reason: "Support capabilities are crucial in the Nether's darkness zones. Cenotaph Mask ensures your team has ammo for the many shielded enemies."
            },
            {
              build: allBuilds[3],
              reason: "Arc damage is particularly effective against many enemies in the Nether. The Geomag build provides excellent crowd control and boss damage."
            }
          ],
        },
      ],
    },
    {
      name: "Dungeons",
      description: "Build recommendations for the challenging three-player endgame activities",
      activities: [
        {
          name: "Rite of the Nine",
          description: "Enter the realm of the Nine and complete their trials to earn powerful rewards.",
          image: "/placeholder.svg?height=400&width=800&text=Rite+of+the+Nine",
          difficulty: "High",
          recommendedBuilds: [
            {
              build: allBuilds[3],
              reason: "Sustained DPS is critical for the boss encounters. Geomag Stabilizers provide extended super duration for maximum damage phases."
            },
            {
              build: allBuilds[0],
              reason: "One-shot damage is excellent for the specific mechanics in this dungeon. Celestial Nighthawk can take down priority targets quickly."
            }
          ],
        },
      ],
    },
    {
      name: "Grandmasters",
      description: "Optimal builds for surviving and completing the most challenging Nightfall difficulties",
      activities: [
        {
          name: "New Grandmaster Name",
          description: "Face the most challenging enemies in this high-level Nightfall activity.",
          image: "/placeholder.svg?height=400&width=800&text=Grandmaster",
          difficulty: "Very High",
          recommendedBuilds: [
            {
              build: allBuilds[2],
              reason: "Survivability and area control are essential. This build provides excellent grenade regeneration for constant crowd control as well as a lot of Cure."
            },
            {
              build: allBuilds[1],
              reason: "Support builds are crucial in Grandmasters. Cenotaph Mask ensures your team has consistent ammo economy throughout the strikes."
            }
          ],
        },
      ],
    },
    {
      name: "PvP",
      description: "Competitive builds optimized for Guardian versus Guardian activities",
      activities: [
        {
          name: "Trials of Osiris",
          description: "Compete in this high-stakes 3v3 elimination mode to earn exclusive rewards.",
          image: "https://www.bungie.net/img/theme/destiny/bgs/stats/banner_crucible_1.jpg",
          difficulty: "Competitive",
          recommendedBuilds: [
            {
              build: allBuilds[0],
              reason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            },
            {
              build: allBuilds[3],
              reason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            }
          ],
        },
        {
          name: "Iron Banner",
          description: "Lord Saladin's limited-time Crucible event with unique rewards.",
          image: "https://www.bungie.net/img/theme/destiny/bgs/pgcrs/placeholder.jpg",
          difficulty: "Moderate-High",
          recommendedBuilds: [
            {
              build: allBuilds[1],
              reason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            },
            {
              build: allBuilds[2],
              reason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            }
          ],
        },
        {
          name: "Competitive",
          description: "Test your skill against other Guardians in ranked PvP gameplay.",
          image: "https://www.bungie.net/img/theme/destiny/bgs/stats/banner_crucible_1.jpg",
          difficulty: "High",
          recommendedBuilds: [
            {
              build: allBuilds[3],
              reason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            },
            {
              build: allBuilds[0],
              reason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            }
          ],
        },
      ],
    },
  ]

  // Get subclass colors for styling
  const subclassColors = {
    Solar: "bg-destiny-solar",
    Arc: "bg-destiny-arc",
    Void: "bg-destiny-void",
    Strand: "bg-destiny-strand",
    Stasis: "bg-destiny-stasis",
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/" className="flex items-center text-primary mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>

      {/* Season Header */}
      <section className="mb-12">
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10" />
          <div className="relative h-[300px]">
            <Image
              src="https://www.bungie.net/img/destiny_content/pgcr/raid_kings_fall.jpg"
              alt="Season 26: Episode: Heresy"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-12 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Season 26: Episode: Heresy</h1>
            <p className="text-lg text-gray-200 mb-6">
              Find the optimal builds for all current seasonal activities
            </p>
          </div>
        </div>
      </section>

      {/* Activity Sections */}
      {activityTypes.map((activityType) => (
        <section key={activityType.name} className="mb-16">
          <h2 className="text-3xl font-bold mb-2">{activityType.name}</h2>
          <p className="text-muted-foreground mb-8">{activityType.description}</p>

          <div className="grid grid-cols-1 gap-8">
            {activityType.activities.map((activity) => (
              <Card key={activity.name} className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  <div className="relative h-64 lg:h-auto lg:col-span-1">
                    <Image
                      src={activity.image}
                      alt={activity.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white">{activity.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-primary/30 text-white px-2 py-0.5 rounded-full">
                          Difficulty: {activity.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <CardContent className="p-6">
                      <p className="text-muted-foreground mb-6">{activity.description}</p>
                      
                      <h4 className="text-lg font-semibold mb-4">Recommended Builds</h4>
                      <div className="space-y-4">
                        {activity.recommendedBuilds.map((item, index) => (
                          <div key={index} className="border border-border/50 rounded-lg overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <Link
                                href={`/builds/${item.build.id}`}
                                className="group flex md:w-1/3 bg-card/50 hover:bg-card/80 transition-colors p-4"
                              >
                                <div className={`w-1 ${subclassColors[item.build.subclass as keyof typeof subclassColors]}`}></div>
                                <div className="flex-1 ml-3">
                                  <h5 className="font-bold text-md group-hover:text-primary transition-colors">
                                    {item.build.name}
                                  </h5>
                                  <div className="flex items-center space-x-2 my-2">
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                      {item.build.class}
                                    </span>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                      {item.build.subclass}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-3">
                                    {item.build.exotics.map((exotic) => (
                                      <div key={exotic.name} className="relative w-8 h-8 bg-black/20 rounded">
                                        <Image
                                          src={exotic.imageUrl || "/placeholder.svg"}
                                          alt={exotic.name}
                                          fill
                                          className="object-contain p-1"
                                          title={exotic.name}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </Link>
                              <div className="p-4 md:w-2/3 bg-card">
                                <h6 className="font-medium text-sm text-primary mb-2">Why This Build Works</h6>
                                <p className="text-sm text-muted-foreground">{item.reason}</p>
                                
                                <div className="flex mt-3">
                                  <Button asChild size="sm" variant="outline">
                                    <Link href={`/builds/${item.build.id}`}>
                                      View Full Build Details
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
} 