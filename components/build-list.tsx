import Image from "next/image"
import Link from "next/link"
import { dummyBuilds } from "@/data/dummy-data"
import { destinyApi } from "@/lib/destinyApi"

export default async function BuildList() {
  const builds = await Promise.all(dummyBuilds.map(async (build) => ({
    ...build,
    exotics: await Promise.all(build.exotics.map(async (exoticName) => {
      const exoticData = await destinyApi.getExoticArmor(exoticName) || await destinyApi.getExoticWeapon(exoticName);
      return {
        name: exoticName,
        imageUrl: exoticData ? `https://www.bungie.net${exoticData.displayProperties.icon}` : "/placeholder.svg",
        description: exoticData?.displayProperties.description || ""
      };
    }))
  })));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {builds.map((build) => (
        <Link
          key={build.id}
          href={`/builds/${build.id}`}
          className="group bg-card hover:bg-card/80 rounded-lg overflow-hidden transition-colors"
        >
          <div className="relative h-48">
            <Image src={build.imageUrl || "/placeholder.svg"} alt={build.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-bold text-white">{build.name}</h3>
              <p className="text-sm text-gray-300">{build.class}</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              {build.tags.map((tag) => (
                <span key={tag} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{build.description}</p>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Key Exotics</h4>
              <div className="flex space-x-2">
                {build.exotics.map((exotic) => (
                  <div key={exotic.name} className="relative w-10 h-10 bg-black/20 rounded">
                    <Image
                      src={exotic.imageUrl}
                      alt={exotic.name}
                      fill
                      className="object-contain p-1"
                    />
                    <div className="absolute -bottom-6 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center">
                      {exotic.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

