import Image from "next/image"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { destinyApi } from "@/lib/destinyApi"
import { Build } from "@/types/destiny"

interface InventoryScreenProps {
  build: Build
}

export default async function InventoryScreen({ build }: InventoryScreenProps) {
  const buildData = {
    ...build,
    exotics: await Promise.all(build.exotics.map(async (exoticName) => {
      const exoticData = await destinyApi.getExoticArmor(exoticName) || await destinyApi.getExoticWeapon(exoticName);
      return {
        name: exoticName,
        type: exoticData?.itemType === 2 ? "Armor" : "Weapon",
        imageUrl: exoticData ? `https://www.bungie.net${exoticData.displayProperties.icon}` : "/placeholder.svg",
        description: exoticData?.displayProperties.description || ""
      };
    })),
    aspects: await Promise.all(build.aspects.map(async (aspectName) => {
      const aspectData = await destinyApi.getAspect(aspectName);
      return {
        name: aspectName,
        subclass: build.subclass,
        imageUrl: aspectData ? `https://www.bungie.net${aspectData.displayProperties.icon}` : "/placeholder.svg",
        description: aspectData?.displayProperties.description || ""
      };
    })),
    fragments: await Promise.all(build.fragments.map(async (fragmentName) => {
      const fragmentData = await destinyApi.getFragment(fragmentName);
      return {
        name: fragmentName,
        subclass: build.subclass,
        imageUrl: fragmentData ? `https://www.bungie.net${fragmentData.displayProperties.icon}` : "/placeholder.svg",
        description: fragmentData?.displayProperties.description || ""
      };
    }))
  };

  return (
    <div className="bg-black/80 rounded-lg p-6 text-white">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Stats Column */}
        <div className="md:col-span-2 bg-black/50 rounded px-3">
          <div className="text-sm text-gray-300">
            <h4 className="text-sm font-semibold mb-2">Stats to Target</h4>
            <div className="space-y-1">
              {buildData.targetStats.map((stat) => (
                <div key={stat} className="capitalize">{stat}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Build items */}
        <div className="md:col-span-10">
          <div className="flex flex-wrap gap-4">
            {/* Exotics */}
            <div className="flex-1 basis-0 min-w-[200px] max-w-fit">
              <h4 className="text-sm font-semibold mb-2">Exotics</h4>
              <div className="grid auto-cols-[120px] grid-flow-col gap-2" style={{ gridTemplateRows: 'repeat(3, auto)' }}>
                {buildData.exotics.map((exotic) => (
                  <Popover key={exotic.name}>
                    <PopoverTrigger asChild>
                      <button className="relative bg-black/40 p-1 rounded border border-gray-700 hover:border-primary transition-colors">
                        <div className="relative w-full aspect-square">
                          <Image
                            src={exotic.imageUrl}
                            alt={exotic.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="text-xs mt-1 text-center truncate">{exotic.name}</div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="left" className="w-80 bg-black/90 border border-gray-700 text-white">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12">
                            <Image
                              src={exotic.imageUrl}
                              alt={exotic.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold">{exotic.name}</h3>
                            <p className="text-xs text-gray-400">{exotic.type}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">{exotic.description}</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            </div>

            {/* Aspects */}
            <div className="flex-1 basis-0 min-w-[200px] max-w-fit">
              <h4 className="text-sm font-semibold mb-2">Aspects</h4>
              <div className="grid auto-cols-[120px] grid-flow-col gap-2" style={{ gridTemplateRows: 'repeat(3, auto)' }}>
                {buildData.aspects.map((aspect) => (
                  <Popover key={aspect.name}>
                    <PopoverTrigger asChild>
                      <button className="relative bg-black/40 p-1 rounded border border-gray-700 hover:border-primary transition-colors">
                        <div className="relative w-full aspect-square">
                          <Image
                            src={aspect.imageUrl}
                            alt={aspect.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="text-xs mt-1 text-center truncate">{aspect.name}</div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="left" className="w-80 bg-black/90 border border-gray-700 text-white">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12">
                            <Image
                              src={aspect.imageUrl}
                              alt={aspect.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold">{aspect.name}</h3>
                            <p className="text-xs text-gray-400">{aspect.subclass}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">{aspect.description}</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            </div>

            {/* Fragments */}
            <div className="flex-1 basis-0 min-w-[200px] max-w-fit">
              <h4 className="text-sm font-semibold mb-2">Fragments</h4>
              <div className="grid auto-cols-[120px] grid-flow-col gap-2" style={{ gridTemplateRows: 'repeat(3, auto)' }}>
                {buildData.fragments.map((fragment) => (
                  <Popover key={fragment.name}>
                    <PopoverTrigger asChild>
                      <button className="relative bg-black/40 p-1 rounded border border-gray-700 hover:border-primary transition-colors">
                        <div className="relative w-full aspect-square">
                          <Image
                            src={fragment.imageUrl}
                            alt={fragment.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="text-xs mt-1 text-center truncate">{fragment.name}</div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="left" className="w-80 bg-black/90 border border-gray-700 text-white">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12">
                            <Image
                              src={fragment.imageUrl}
                              alt={fragment.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold">{fragment.name}</h3>
                            <p className="text-xs text-gray-400">{fragment.subclass}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">{fragment.description}</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

