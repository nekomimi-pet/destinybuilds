import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { destinyApi } from "@/lib/destinyApi"

export default async function CurrentSeason() {
  // This would be fetched from an API in a real app
  const currentSeason = {
    number: 26,
    name: "Episode: Heresy",
    endDate: "???",
    image: "/placeholder.svg?height=400&width=800",
    description:
      "The Dreadnaught has returned. Gather your allies and bring order to chaos as shadows gather in the galaxy.",
    metaWeapons: [
      { name: "Barrow-Dyad", type: "Submachine Gun", element: "Strand" },
      { name: "Lord of Wolves", type: "Shotgun", element: "Solar" },
      { name: "The Queenbreaker", type: "Linear Fusion Rifle", element: "Arc" },
    ],
    metaExotics: [
      { name: "Geomag Stabilizers", class: "Warlock" },
      { name: "Hazardous Propulsion", class: "Titan" },
      { name: "Relativism", class: "Hunter" },
    ],
  }

  // Fetch exotic data for images
  const exoticData = await Promise.all(
    currentSeason.metaExotics.map(async (exotic) => {
      try {
        const data = await destinyApi.getExoticArmor(exotic.name)
        return {
          ...exotic,
          imageUrl: data ? `https://www.bungie.net${data.displayProperties.icon}` : "/placeholder.svg",
        }
      } catch (error) {
        console.error(`Error fetching exotic ${exotic.name}:`, error)
        return {
          ...exotic,
          imageUrl: "/placeholder.svg",
        }
      }
    })
  )

  // Fetch weapon data for images
  const weaponData = await Promise.all(
    currentSeason.metaWeapons.map(async (weapon) => {
      try {
        const data = await destinyApi.getExoticWeapon(weapon.name)
        return {
          ...weapon,
          imageUrl: data ? `https://www.bungie.net${data.displayProperties.icon}` : "/placeholder.svg",
        }
      } catch (error) {
        console.error(`Error fetching weapon ${weapon.name}:`, error)
        return {
          ...weapon,
          imageUrl: "/placeholder.svg",
        }
      }
    })
  )

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={currentSeason.image || "/placeholder.svg"}
          alt={`Season ${currentSeason.number}: ${currentSeason.name}`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="text-sm text-primary font-medium mb-1">Current Season</div>
          <h3 className="text-xl font-bold text-white">
            Season {currentSeason.number}: {currentSeason.name}
          </h3>
          <p className="text-sm text-gray-300">Ends {currentSeason.endDate}</p>
        </div>
      </div>
      <CardContent className="p-6">
        <p className="text-muted-foreground mb-4">{currentSeason.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Meta Weapons</h4>
            <ul className="space-y-2">
              {weaponData.map((weapon) => (
                <li key={weapon.name} className="flex items-center text-sm">
                  <div className="relative w-8 h-8 bg-black/20 rounded-full mr-3">
                    <Image
                      src={weapon.imageUrl}
                      alt={weapon.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <span className="font-medium">{weapon.name}</span>
                  <span className="text-muted-foreground ml-2">
                    {weapon.type} • {weapon.element}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Meta Exotics</h4>
            <ul className="space-y-2">
              {exoticData.map((exotic) => (
                <li key={exotic.name} className="flex items-center text-sm">
                  <div className="relative w-8 h-8 bg-black/20 rounded-full mr-3">
                    <Image
                      src={exotic.imageUrl}
                      alt={exotic.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <span className="font-medium">{exotic.name}</span>
                  <span className="text-muted-foreground ml-2">{exotic.class}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/season">
              Season Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

