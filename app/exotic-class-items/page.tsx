import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ExoticClassItemExplorerContainer } from "@/components/exotic-class-item-explorer-container"

export const metadata: Metadata = {
  title: "Exotic Class Item Explorer - Destiny Builds",
  description: "Explore and discover the best exotic class item perk combinations for your Guardian in Destiny 2",
}

export default function ExoticClassItemsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/" className="flex items-center text-primary mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Exotic Class Item Explorer</h1>
        <p className="text-muted-foreground">
          Discover the perfect perk combinations for your exotic class items. With 64 possible combinations per class,
          finding the optimal setup can be overwhelming. Our explorer highlights the best combinations and explains why
          they work so well together.
        </p>
      </div>

      <ExoticClassItemExplorerContainer />
    </main>
  )
}

