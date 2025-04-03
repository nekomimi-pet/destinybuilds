import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Credits - Destiny 2 Builds",
  description: "Credits and acknowledgments for Destiny 2 Builds website",
}

export default function CreditsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Credits</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">About Destiny Builds</h2>
          <p className="text-muted-foreground">
            Destiny Builds is a fan-created website dedicated to helping Guardians find and share optimized builds for Destiny 2.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contributors</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><a href="https://github.com/waveringana" className="text-primary hover:underline transition-colors">waveringana</a> - Website design and development</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Resources</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Bungie API - for game data</li>
            <li>MIT LICENSE - <a href="https://github.com/DestinyItemManager/bungie-api-ts" className="text-primary hover:underline transition-colors">DestinyItemManager/bungie-api-ts</a> - Typescript Definitions for the Destiny Manifest</li>
            <li>MIT LICENSE - <a href="https://github.com/ChiriVulpes/deepsight.gg/tree/manifest" className="text-primary hover:underline transition-colors">ChiriVulpes/deepsight.gg</a> - Extended Typescript Definitions for the Destiny Manifest</li>
            <li>MIT LICENSE - Next.js - React framework</li>
            <li>MIT LICENSE - Tailwind CSS - for styling</li>
            <li>MIT LICENSE - Shadcn/ui - UI components</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Legal</h2>
          <p className="text-muted-foreground">
            Destiny 2 content and materials are trademarks and copyrights of Bungie, Inc. 
            All game assets are property of their respective owners.
          </p>
        </section>
      </div>
    </div>
  )
} 