import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { dummyBuilds } from "@/data/dummy-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CurrentSeason from "@/components/current-season"
import { getSubclassColor } from "@/lib/colors"

export default async function Home() {
  // Get a featured build and one build per class for quick access
  const featuredBuild = dummyBuilds[4]

  // Group builds by class
  const buildsByClass = {
    Hunter: dummyBuilds.filter((build) => build.class === "Hunter")[0],
    Titan: dummyBuilds.filter((build) => build.class === "Titan")[0] || dummyBuilds[0],
    Warlock: dummyBuilds.filter((build) => build.class === "Warlock")[0],
  }

  // Get subclass counts
  const subclassCounts = dummyBuilds.reduce(
    (acc, build) => {
      acc[build.subclass] = (acc[build.subclass] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Get class icons
  const classIcons = {
    Hunter: await getClassIcon("Hunter"),
    Titan: await getClassIcon("Titan"),
    Warlock: await getClassIcon("Warlock"),
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10" />
        <div className="relative h-[400px]">
          <Image
            src="/placeholder.svg?height=800&width=1600"
            alt="Destiny Builds"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-12 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Optimize Your Guardian</h1>
          <p className="text-lg text-gray-200 mb-6">
            Discover powerful builds for every class and subclass in Destiny 2
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/builds">
                Browse All Builds
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/exotics">Explore Exotics</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <CurrentSeason />
      </section>

      {/* Class Navigation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Browse Builds by Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(buildsByClass).map(([className, build]) => (
            <Link key={className} href={`/builds?class=${className.toLowerCase()}`} className="group">
              <Card className="overflow-hidden h-full transition-all hover:shadow-lg">
                <div className="relative h-40 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary to-transparent"></div>
                  {classIcons[className as keyof typeof classIcons] && (
                    <Image
                      src={classIcons[className as keyof typeof classIcons] || "/placeholder.svg"}
                      alt={className}
                      width={80}
                      height={80}
                      className="opacity-90"
                    />
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{className}</h3>
                  <p className="text-muted-foreground mb-4">
                    {dummyBuilds.filter((b) => b.class === className).length} builds available
                  </p>
                  <div className="flex gap-2">
                    {Object.keys(subclassCounts)
                      .filter((subclass) => dummyBuilds.some((b) => b.class === className && b.subclass === subclass))
                      .map((subclass) => (
                        <div
                          key={`${className}-${subclass}`}
                          className={`w-4 h-4 rounded-full ${getSubclassColor(subclass)}`}
                          title={`${subclass} ${className}`}
                        />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Build */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Build</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/builds/${featuredBuild.id}`}>
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              <Image
                src={featuredBuild.imageUrl || "/placeholder.svg?height=600&width=800"}
                alt={featuredBuild.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div
                  className={`w-6 h-1 mb-2 ${getSubclassColor(featuredBuild.subclass)}`}
                />
                <h3 className="text-xl font-bold text-white">{featuredBuild.name}</h3>
                <p className="text-sm text-gray-300">
                  {featuredBuild.class} • {featuredBuild.subclass}
                </p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {featuredBuild.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground mb-6">{featuredBuild.description}</p>
              <div>
                <h4 className="text-sm font-medium mb-2">Key Exotics</h4>
                <div className="flex gap-3 mb-4">
                  {featuredBuild.exotics.map((exotic) => (
                    <div key={exotic} className="text-sm">
                      {exotic}
                    </div>
                  ))}
                </div>
                <Button asChild>
                  <Link href={`/builds/${featuredBuild.id}`}>View Full Build</Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </section>

      {/* Subclass Overview */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Builds by Subclass</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(subclassCounts).map(([subclass, count]) => (
            <Link key={subclass} href={`/builds?subclass=${subclass.toLowerCase()}`} className="group">
              <Card className="overflow-hidden h-full hover:shadow-md transition-all">
                <div className={`h-2 ${getSubclassColor(subclass)}`} />
                <CardContent className="p-4">
                  <h3 className="font-medium group-hover:text-primary transition-colors">{subclass}</h3>
                  <p className="text-sm text-muted-foreground">{count} builds</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

// Helper function to get class icons
async function getClassIcon(className: string): Promise<string> {
  const icons = {
    Hunter: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 32 32" clip-rule="evenodd" fill-rule="evenodd" stroke-linecap="round" stroke-miterlimit="8" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m11.857 12.696 4.132-.015-4.134 6.219 4.134-.014-4.41 6.634h-4.192l4.186-6.204h-4.186l4.184-6.202h-4.184l4.467-6.62 4.135-.014zm8.264 0-4.132-6.216 4.136.014 4.466 6.62h-4.184l4.184 6.202h-4.186l4.186 6.204h-4.192l-4.41-6.634 4.134.014-4.134-6.219z" fill="none" stroke="#000000" stroke-miterlimit="6" stroke-width="1.58"></path><path d="m11.857 12.696 4.132-.015-4.134 6.219 4.134-.014-4.41 6.634h-4.192l4.186-6.204h-4.186l4.184-6.202h-4.184l4.467-6.62 4.135-.014zm8.264 0-4.132-6.216 4.136.014 4.466 6.62h-4.184l4.184 6.202h-4.186l4.186 6.204h-4.192l-4.41-6.634 4.134.014-4.134-6.219z" fill="#ffffff"></path></g></svg>')}`,
    Warlock: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 32 32" clip-rule="evenodd" fill-rule="evenodd" stroke-linecap="round" stroke-miterlimit="8" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m6.723 23.017 6.375-10.236-2.381-3.798-8.775 14.034zm5.26 0 3.76-6.018-2.387-3.807-6.143 9.825zm6.879-10.202 6.429 10.202h4.767l-8.8-14.034zm-6.378 10.202h7.032l-3.521-5.616zm6.143-9.825-2.376 3.799 3.78 6.026h4.756zm-5.015-.403 2.381-3.806 2.381 3.806-2.375 3.8z" fill="none" stroke="#000000" stroke-width="1.58"></path><path d="m6.723 23.017 6.375-10.236-2.381-3.798-8.775 14.034zm5.26 0 3.76-6.018-2.387-3.807-6.143 9.825zm6.879-10.202 6.429 10.202h4.767l-8.8-14.034zm-6.378 10.202h7.032l-3.521-5.616zm6.143-9.825-2.376 3.799 3.78 6.026h4.756zm-5.015-.403 2.381-3.806 2.381 3.806-2.375 3.8z" fill="#ffffff"></path></g></svg>')}`,
    Titan: `data:image/svg+xml,${encodeURIComponent('<svg fill="#ffffff" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m15.214 15.986-8.925-5.153v10.306zm1.572 0 8.925 5.153v-10.306zm8.109-5.629-8.856-5.193-8.896 5.17 8.896 5.136zm-.023 11.274-8.833-5.101-8.873 5.123 8.873 5.183z"></path></g></svg>')}`
  };

  return icons[className as keyof typeof icons] || '/placeholder.svg?height=80&width=80';
}

