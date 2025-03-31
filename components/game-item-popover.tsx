"use server"

import Image from "next/image"

type GameItem = {
  type: 'exotic' | 'mod' | 'aspect' | 'fragment';
  name: string;
  imageUrl: string;
  description: string;
  armorType?: string;
}

export async function GameItemPopover({ item }: { item: GameItem }) {
  // Class names based on item type
  const typeClassMap = {
    'exotic': 'text-amber-500 hover:text-amber-400',
    'mod': 'text-blue-500 hover:text-blue-400',
    'aspect': 'text-violet-500 hover:text-violet-400',
    'fragment': 'text-emerald-500 hover:text-emerald-400'
  };
  
  const colorClass = typeClassMap[item.type] || 'text-blue-500 hover:text-blue-400';
  
  return (
    <span 
      className={`font-medium cursor-help ${colorClass} relative group`}
      title={item.description}
    >
      {item.name}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-64 bg-black/90 text-white text-sm rounded-md p-3 shadow-lg pointer-events-none z-50">
        <span className="flex items-start gap-2 inline-flex">
          <span className="relative h-10 w-10 flex-shrink-0 bg-black/30 rounded inline-block">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-contain p-1"
            />
          </span>
          <span className="inline-block">
            <span className="font-semibold text-white block">{item.name}</span>
            {item.armorType && (
              <span className="text-xs text-white/70 capitalize">({item.armorType})</span>
            )}
            <span className="text-xs text-white/80 mt-1 block">{item.description}</span>
          </span>
        </span>
        <span className="tooltip-arrow absolute left-1/2 top-full -translate-x-1/2 -mt-1 border-8 border-transparent border-t-black/90"></span>
      </span>
    </span>
  );
} 