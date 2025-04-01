import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import ExoticClassItemExplorer from "@/components/exotic-class-item-explorer"
import { ExoticClassItemExplorerContainer } from "@/components/exotic-class-item-explorer-container"

type Props = {
  params: { class: string }
}

export function generateMetadata({ params }: Props): Metadata {
  const guardianClass = params.class.charAt(0).toUpperCase() + params.class.slice(1).toLowerCase()

  return {
    title: `${guardianClass} Exotic Class Item - Destiny Builds`,
    description: `Explore and discover the best exotic class item perk combinations for your ${guardianClass} in Destiny 2`,
  }
}

export default function ClassSpecificExoticItemPage({ params }: Props) {
  // Validate the class parameter
  const validClasses = ["hunter", "warlock", "titan"]
  if (!validClasses.includes(params.class.toLowerCase())) {
    notFound()
  }

  const guardianClass = (params.class.charAt(0).toUpperCase() + params.class.slice(1).toLowerCase()) as
    | "Hunter"
    | "Warlock"
    | "Titan"

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/exotic-class-items" className="flex items-center text-primary mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Classes
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{guardianClass} Exotic Class Item</h1>
        <p className="text-muted-foreground">
          Discover the perfect perk combinations for your {guardianClass} exotic class item. With 64 possible
          combinations, finding the optimal setup can be overwhelming. Our explorer highlights the best combinations and
          explains why they work so well together.
        </p>
      </div>

      <ExoticClassItemExplorerContainer initialClass={guardianClass} />
    </main>
  )
}

