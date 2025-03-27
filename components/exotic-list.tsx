import { destinyApi } from "@/lib/destinyApi"
import Image from "next/image"
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2"

export default async function ExoticList() {
    // This is a Server Component, so we can fetch data directly
    const exoticArmor = await destinyApi.getAllExoticArmor()

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exoticArmor.map((exotic: DestinyInventoryItemDefinition) => (
                <div key={exotic.hash} className="bg-card p-4 rounded-lg">
                    <div className="relative w-full aspect-square mb-4">
                        <Image
                            src={`https://www.bungie.net${exotic.displayProperties.icon}`}
                            alt={exotic.displayProperties.name}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h3 className="font-bold">{exotic.displayProperties.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {exotic.displayProperties.description}
                    </p>
                </div>
            ))}
        </div>
    )
} 