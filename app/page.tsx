import InventoryScreen from "@/components/inventory-screen"
import BuildList from "@/components/build-list"
import { dummyBuilds } from "@/data/dummy-data"

export default function Home() {
  const featuredBuild = dummyBuilds[0]

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-primary">Destiny Builds</h1>
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Featured Build</h2>
          <InventoryScreen build={featuredBuild} />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Popular Builds</h2>
          <BuildList />
        </section>
      </div>
    </main>
  )
}

