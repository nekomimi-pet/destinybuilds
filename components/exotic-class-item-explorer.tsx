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
import type {  GuardianClass, ClassItemData, PerkTier } from "@/types/destiny"
import { getTextColor, getTierColor, getTierBgColor } from "@/lib/colors"


// Helper function to get subclass icon
const getSubclassIcon = (subclass: string) => {
  switch (subclass) {
    case "Solar":
      return <Flame className={`h-4 w-4 ${getTextColor(subclass)}`} />
    case "Arc":
      return <Bolt className={`h-4 w-4 ${getTextColor(subclass)}`} />
    case "Void":
      return <Sparkles className={`h-4 w-4 ${getTextColor(subclass)}`} />
    case "Strand":
      return <Zap className={`h-4 w-4 ${getTextColor(subclass)}`} />
    case "Stasis":
      return <Sparkles className={`h-4 w-4 ${getTextColor(subclass)}`} />
    default:
      return <Sparkles className="h-4 w-4" />
  }
}

interface ExoticClassItemExplorerProps {
  initialClass?: GuardianClass
  classItemsData: ClassItemData[]
}

export default function ExoticClassItemExplorer({ 
  initialClass = "Hunter",
  classItemsData = [] // Provide default empty array
}: ExoticClassItemExplorerProps) {
  const [selectedClass, setSelectedClass] = useState<GuardianClass>(initialClass)
  const [selectedCombination, setSelectedCombination] = useState<string | null>(null)
  const [filterTier, setFilterTier] = useState<PerkTier | null>(null)

  // Handle empty data case
  if (!Array.isArray(classItemsData) || classItemsData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-8 text-center">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Class Item Data Available</h3>
              <p className="text-muted-foreground">
                No exotic class items are currently available. Please try refreshing the page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Get the data for the selected class
  const classData = classItemsData.find((data) => data.class === selectedClass) || classItemsData[0]

  // Get the combinations for the selected class, filtered by tier if applicable
  const filteredCombinations = filterTier
    ? classData?.combinations?.filter((combo) => combo.tier === filterTier) || []
    : classData?.combinations || []

  // Get the selected combination data
  const selectedComboData = selectedCombination
    ? classData?.combinations?.find((combo) => combo.id === selectedCombination)
    : filteredCombinations[0]

  console.log(`Selected combo data: ${JSON.stringify(selectedComboData)}`);

  // Get the perks for the selected combination
  const selectedPerk1 = selectedComboData?.perk1;
  const selectedPerk2 = selectedComboData?.perk2;

  console.log(`Selected perk 1: ${JSON.stringify(selectedPerk1)}`);
  console.log(`Selected perk 2: ${JSON.stringify(selectedPerk2)}`);

  // Set the first combination as selected when changing class or filter
  useEffect(() => {
    if (filteredCombinations.length > 0) {
      setSelectedCombination(filteredCombinations[0].id)
    } else {
      setSelectedCombination(null)
    }
  }, [selectedClass, filterTier, filteredCombinations])

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
                  const perk1 = combo.perk1;
                  const perk2 = combo.perk2;

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
                            {/*Aspects go here*/}
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
                        Recommended Aspects
                      </h4>
                      <ul className="space-y-1">
                        {/* Aspects go here */}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Recommended Fragments
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {/**Fragments goes here*/}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Perk Matrix Visualization - Removed from here since it's now always visible below */}
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

        {/* Perk Matrix Visualization - Always visible */}
        <Card className="mt-6">
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
                      <div key={perk.id} className="p-1 flex justify-center items-center">
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
                        <div className="p-1 flex justify-center items-center">
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
                            const combo = classData.combinations.find(
                              (c) => c.perk1.id === perk1.id && c.perk2.id === perk2.id,
                            )

                            return (
                              <div
                                key={`${perk1.id}-${perk2.id}`}
                                className={`p-1 ${
                                  selectedComboData && selectedComboData.perk1.id === perk1.id && selectedComboData.perk2.id === perk2.id
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
      </div>
    </div>
  )
}

