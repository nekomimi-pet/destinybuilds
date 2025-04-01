"use client"

import React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Info, Star, Zap, Shield, Swords, Sparkles, Flame, Bolt } from "lucide-react"
import type { PerkTier, GuardianClass } from "@/types/destiny"
import { exoticClassItemsData } from "@/data/dummy-eci"

// Helper function to get tier color
const getTierColor = (tier: PerkTier) => {
  const colors = {
    S: "text-yellow-500 border-yellow-500",
    A: "text-green-500 border-green-500",
    B: "text-blue-500 border-blue-500",
    C: "text-gray-400 border-gray-400",
  }
  return colors[tier]
}

// Helper function to get tier background color
const getTierBgColor = (tier: PerkTier) => {
  const colors = {
    S: "bg-yellow-500/10",
    A: "bg-green-500/10",
    B: "bg-blue-500/10",
    C: "bg-gray-500/10",
  }
  return colors[tier]
}

// Helper function to get subclass color
const getSubclassColor = (subclass: string) => {
  const colors = {
    Solar: "bg-destiny-solar",
    Arc: "bg-destiny-arc",
    Void: "bg-destiny-void",
    Strand: "bg-destiny-strand",
    Stasis: "bg-destiny-stasis",
    Any: "bg-gradient-to-r from-destiny-arc via-destiny-solar to-destiny-void",
  }
  return colors[subclass as keyof typeof colors] || "bg-gray-500"
}

// Helper function to get subclass icon
const getSubclassIcon = (subclass: string) => {
  switch (subclass) {
    case "Solar":
      return <Flame className="h-4 w-4 text-destiny-solar" />
    case "Arc":
      return <Bolt className="h-4 w-4 text-destiny-arc" />
    case "Void":
      return <Sparkles className="h-4 w-4 text-destiny-void" />
    case "Strand":
      return <Zap className="h-4 w-4 text-destiny-strand" />
    case "Stasis":
      return <Sparkles className="h-4 w-4 text-destiny-stasis" />
    default:
      return <Sparkles className="h-4 w-4" />
  }
}

// Update the component definition to accept initialClass prop
interface ExoticClassItemExplorerProps {
  initialClass?: GuardianClass
}

export default function ExoticClassItemExplorer({ initialClass = "Hunter" }: ExoticClassItemExplorerProps) {
  const [selectedClass, setSelectedClass] = useState<GuardianClass>(initialClass)
  const [selectedCombination, setSelectedCombination] = useState<string | null>(null)
  const [filterTier, setFilterTier] = useState<PerkTier | null>(null)

  // Get the data for the selected class
  const classData = exoticClassItemsData.find((data) => data.class === selectedClass) || exoticClassItemsData[0]

  // Get the combinations for the selected class, filtered by tier if applicable
  const filteredCombinations = filterTier
    ? classData.combinations.filter((combo) => combo.tier === filterTier)
    : classData.combinations

  // Get the selected combination data
  const selectedComboData = selectedCombination
    ? classData.combinations.find((combo) => combo.id === selectedCombination)
    : filteredCombinations[0]

  // Get the perks for the selected combination
  const selectedPerk1 = selectedComboData ? classData.perks.find((perk) => perk.id === selectedComboData.perk1) : null

  const selectedPerk2 = selectedComboData ? classData.perks.find((perk) => perk.id === selectedComboData.perk2) : null

  // Set the first combination as selected when changing class or filter
  useEffect(() => {
    if (filteredCombinations.length > 0) {
      setSelectedCombination(filteredCombinations[0].id)
    } else {
      setSelectedCombination(null)
    }
  }, [selectedClass, filterTier])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Class Selection and Perk Combinations */}
      <div className="lg:col-span-1 space-y-6">
        {/* Class Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Guardian Class</CardTitle>
            <CardDescription>Select your class to see available exotic class items</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="Hunter"
              value={selectedClass}
              onValueChange={(value) => setSelectedClass(value as GuardianClass)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="Hunter">Hunter</TabsTrigger>
                <TabsTrigger value="Warlock">Warlock</TabsTrigger>
                <TabsTrigger value="Titan">Titan</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-4 mt-4">
              <div className="relative w-16 h-16 bg-black/20 rounded flex-shrink-0">
                <Image
                  src={classData.imageUrl || "/placeholder.svg"}
                  alt={classData.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">{classData.name}</h3>
                <p className="text-sm text-muted-foreground">{classData.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Perk Combinations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Best Perk Combinations</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterTier(null)}
                  className={!filterTier ? "bg-primary/10" : ""}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterTier("S")}
                  className={filterTier === "S" ? "bg-yellow-500/10 text-yellow-500" : ""}
                >
                  S
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterTier("A")}
                  className={filterTier === "A" ? "bg-green-500/10 text-green-500" : ""}
                >
                  A
                </Button>
              </div>
            </div>
            <CardDescription>Select a combination to see detailed information</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredCombinations.map((combo) => {
                  const perk1 = classData.perks.find((p) => p.id === combo.perk1)
                  const perk2 = classData.perks.find((p) => p.id === combo.perk2)

                  return (
                    <Button
                      key={combo.id}
                      variant="outline"
                      className={`w-full justify-start h-auto py-3 ${
                        selectedCombination === combo.id ? "border-primary" : ""
                      } ${getTierBgColor(combo.tier)}`}
                      onClick={() => setSelectedCombination(combo.id)}
                    >
                      <div className="flex flex-col items-start w-full">
                        <div className="flex items-center justify-between w-full mb-2">
                          <div className="flex items-center">
                            <Badge className={`mr-2 ${getTierColor(combo.tier)}`}>Tier {combo.tier}</Badge>
                            {combo.subclassSynergies.includes("Solar") && (
                              <Flame className="h-4 w-4 text-destiny-solar mr-1" />
                            )}
                            {combo.subclassSynergies.includes("Arc") && (
                              <Bolt className="h-4 w-4 text-destiny-arc mr-1" />
                            )}
                            {combo.subclassSynergies.includes("Void") && (
                              <Sparkles className="h-4 w-4 text-destiny-void mr-1" />
                            )}
                            {combo.subclassSynergies.includes("Strand") && (
                              <Zap className="h-4 w-4 text-destiny-strand mr-1" />
                            )}
                            {combo.subclassSynergies.includes("Stasis") && (
                              <Sparkles className="h-4 w-4 text-destiny-stasis mr-1" />
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="flex items-center gap-2 w-full">
                          <div className="relative w-8 h-8 bg-black/20 rounded flex-shrink-0">
                            <Image
                              src={perk1?.imageUrl || "/placeholder.svg"}
                              alt={perk1?.name || ""}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">{perk1?.name}</div>
                            <div className="text-xs text-muted-foreground">Column 1</div>
                          </div>
                        </div>

                        <div className="flex items-center mt-2 gap-2 w-full">
                          <div className="relative w-8 h-8 bg-black/20 rounded flex-shrink-0">
                            <Image
                              src={perk2?.imageUrl || "/placeholder.svg"}
                              alt={perk2?.name || ""}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">{perk2?.name}</div>
                            <div className="text-xs text-muted-foreground">Column 2</div>
                          </div>
                        </div>
                      </div>
                    </Button>
                  )
                })}

                {filteredCombinations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No combinations found for the selected filter.</p>
                    <Button variant="link" onClick={() => setFilterTier(null)} className="mt-2">
                      Clear filter
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Combination Details */}
      <div className="lg:col-span-2">
        {selectedComboData && selectedPerk1 && selectedPerk2 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Perk Combination Details</CardTitle>
                <Badge className={`${getTierColor(selectedComboData.tier)}`}>Tier {selectedComboData.tier}</Badge>
              </div>
              <CardDescription>Detailed information about this perk combination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Perk Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 bg-black/20 rounded flex-shrink-0">
                        <Image
                          src={selectedPerk1.imageUrl || "/placeholder.svg"}
                          alt={selectedPerk1.name}
                          fill
                          className="object-contain p-1"
                        />
                        <div className="absolute -top-2 -right-2">
                          <Badge className={`${getTierColor(selectedPerk1.tier)}`}>{selectedPerk1.tier}</Badge>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold">{selectedPerk1.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">Column 1 Perk</p>
                        <p className="text-sm">{selectedPerk1.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 bg-black/20 rounded flex-shrink-0">
                        <Image
                          src={selectedPerk2.imageUrl || "/placeholder.svg"}
                          alt={selectedPerk2.name}
                          fill
                          className="object-contain p-1"
                        />
                        <div className="absolute -top-2 -right-2">
                          <Badge className={`${getTierColor(selectedPerk2.tier)}`}>{selectedPerk2.tier}</Badge>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold">{selectedPerk2.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">Column 2 Perk</p>
                        <p className="text-sm">{selectedPerk2.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Synergy Description */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <Zap className="h-5 w-5 text-primary mr-2" />
                    How This Combination Works
                  </h3>
                  <p className="text-muted-foreground mb-4">{selectedComboData.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Swords className="h-4 w-4 mr-2" />
                        Build Synergies
                      </h4>
                      <ul className="space-y-1">
                        {selectedComboData.buildSynergies.map((synergy) => (
                          <li key={synergy} className="flex items-center text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                            {synergy}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Subclass Synergies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedComboData.subclassSynergies.map((subclass) => (
                          <div
                            key={subclass}
                            className="flex items-center px-2 py-1 rounded-full text-sm"
                            style={{
                              backgroundColor:
                                subclass === "Solar"
                                  ? "rgba(245, 121, 59, 0.2)"
                                  : subclass === "Arc"
                                    ? "rgba(122, 236, 243, 0.2)"
                                    : subclass === "Void"
                                      ? "rgba(177, 132, 197, 0.2)"
                                      : subclass === "Strand"
                                        ? "rgba(63, 215, 128, 0.2)"
                                        : subclass === "Stasis"
                                          ? "rgba(77, 136, 255, 0.2)"
                                          : "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {getSubclassIcon(subclass)}
                            <span className="ml-1">{subclass}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Perk Matrix Visualization */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    All Possible Combinations
                  </CardTitle>
                  <CardDescription>
                    Explore all 64 possible perk combinations for {selectedClass} exotic class items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      <div className="grid grid-cols-9 gap-1">
                        {/* Header row */}
                        <div className="col-span-1"></div>
                        {classData.perks
                          .filter((perk) => perk.column === 2)
                          .map((perk) => (
                            <div key={perk.id} className="p-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="relative w-10 h-10 bg-black/20 rounded mx-auto">
                                      <Image
                                        src={perk.imageUrl || "/placeholder.svg"}
                                        alt={perk.name}
                                        fill
                                        className="object-contain p-1"
                                      />
                                      <div className="absolute -top-2 -right-2">
                                        <Badge className={`text-xs ${getTierColor(perk.tier)}`}>{perk.tier}</Badge>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p className="font-bold">{perk.name}</p>
                                    <p className="text-xs">{perk.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}

                        {/* Matrix cells */}
                        {classData.perks
                          .filter((perk) => perk.column === 1)
                          .map((perk1) => (
                            <React.Fragment key={perk1.id}>
                              <div className="p-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="relative w-10 h-10 bg-black/20 rounded">
                                        <Image
                                          src={perk1.imageUrl || "/placeholder.svg"}
                                          alt={perk1.name}
                                          fill
                                          className="object-contain p-1"
                                        />
                                        <div className="absolute -top-2 -right-2">
                                          <Badge className={`text-xs ${getTierColor(perk1.tier)}`}>{perk1.tier}</Badge>
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-xs">
                                      <p className="font-bold">{perk1.name}</p>
                                      <p className="text-xs">{perk1.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>

                              {classData.perks
                                .filter((perk) => perk.column === 2)
                                .map((perk2) => {
                                  // Find if this combination exists in our predefined combinations
                                  const combo = classData.combinations.find(
                                    (c) => c.perk1 === perk1.id && c.perk2 === perk2.id,
                                  )

                                  return (
                                    <div
                                      key={`${perk1.id}-${perk2.id}`}
                                      className={`p-1 ${
                                        selectedComboData.perk1 === perk1.id && selectedComboData.perk2 === perk2.id
                                          ? "ring-2 ring-primary rounded"
                                          : ""
                                      }`}
                                    >
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className={`w-10 h-10 p-0 ${
                                                combo ? getTierBgColor(combo.tier) : "bg-gray-100 dark:bg-gray-800"
                                              }`}
                                              onClick={() => {
                                                if (combo) {
                                                  setSelectedCombination(combo.id)
                                                }
                                              }}
                                              disabled={!combo}
                                            >
                                              {combo ? (
                                                <Star
                                                  className={`h-5 w-5 ${
                                                    combo.tier === "S"
                                                      ? "text-yellow-500"
                                                      : combo.tier === "A"
                                                        ? "text-green-500"
                                                        : combo.tier === "B"
                                                          ? "text-blue-500"
                                                          : "text-gray-400"
                                                  }`}
                                                />
                                              ) : (
                                                <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                              )}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent side="top">
                                            {combo ? (
                                              <>
                                                <p className="font-bold">Tier {combo.tier} Combination</p>
                                                <p className="text-xs">
                                                  {perk1.name} + {perk2.name}
                                                </p>
                                                <p className="text-xs mt-1">Click to view details</p>
                                              </>
                                            ) : (
                                              <p className="text-xs">Untested combination</p>
                                            )}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  )
                                })}
                            </React.Fragment>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center mt-4 gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span className="text-xs">S-Tier</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-xs">A-Tier</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-xs">B-Tier</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
                      <span className="text-xs">C-Tier</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 mr-1"></div>
                      <span className="text-xs">Untested</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Combination Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a perk combination from the list to see detailed information.
              </p>
              <Button
                onClick={() => setSelectedCombination(filteredCombinations[0]?.id || null)}
                disabled={filteredCombinations.length === 0}
              >
                View First Combination
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

