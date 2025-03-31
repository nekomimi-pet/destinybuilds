import Image from "next/image"

interface FallbackItemProps {
  name: string
  type?: string
  description?: string
}

export default function FallbackItem({ name, type, description }: FallbackItemProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="relative w-12 h-12 bg-black/20 rounded flex-shrink-0 flex items-center justify-center">
        <Image src="/placeholder.svg" alt={name} width={48} height={48} className="object-contain p-1" />
      </div>
      <div>
        <h3 className="font-medium">{name}</h3>
        {type && <p className="text-xs text-gray-400">{type}</p>}
        {description && <p className="text-sm text-muted-foreground">{description || "No description available"}</p>}
      </div>
    </div>
  )
}

