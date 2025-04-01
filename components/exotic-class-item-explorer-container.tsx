import { destinyApi } from "@/lib/destinyApi"
import { GuardianClass } from "@/types/destiny"
import ExoticClassItemExplorer from "./exotic-class-item-explorer"

interface ExoticClassItemExplorerContainerProps {
  initialClass?: GuardianClass
}

export async function ExoticClassItemExplorerContainer({
  initialClass,
}: ExoticClassItemExplorerContainerProps) {
  console.log("ExoticClassItemExplorerContainer: Starting to fetch data")
  
  try {
    const classItemsData = await destinyApi.getExoticClassItems()
    console.log("ExoticClassItemExplorerContainer: Data fetched", {
      hasData: !!classItemsData,
      itemCount: classItemsData?.length,
      items: classItemsData?.map(item => ({
        class: item.class,
        name: item.name,
        perkCount: item.perks.length
      }))
    })

    if (!classItemsData || classItemsData.length === 0) {
      console.error("ExoticClassItemExplorerContainer: No class items data available")
      return <div>Error: No exotic class items data available. Please try refreshing the page.</div>
    }

    return (
      <ExoticClassItemExplorer
        initialClass={initialClass}
        classItemsData={classItemsData}
      />
    )
  } catch (error) {
    console.error("ExoticClassItemExplorerContainer: Error fetching data:", error)
    return <div>Error loading exotic class items. Please try refreshing the page.</div>
  }
} 