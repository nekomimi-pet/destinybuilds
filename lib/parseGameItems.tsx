"use server"

import React from 'react'
import { GameItemPopover } from "@/components/game-item-popover"
import { destinyApi } from "./destinyApi"

// Create a map to track which items have been highlighted
// We'll make this a global variable that persists between requests
// This ensures highlighting only happens on first mention across all paragraphs
let highlightedItems = new Set<string>();

export async function parseTextWithGameItems(
  text: string, 
  existingItems: {
    exotics: Array<{name: string, imageUrl: string, description: string}>,
    mods: Array<{name: string, imageUrl: string, description: string, armorType?: string}>
  },
  resetTracking: boolean = false
) {
  // If this is the first paragraph in a new build, reset the tracking
  if (resetTracking) {
    highlightedItems = new Set<string>();
  }

  // Get aspect and fragment data - these aren't loaded in the page already
  const [aspects, fragments] = await Promise.all([
    destinyApi.getAllAspects(),
    destinyApi.getAllFragments()
  ]);
  
  // Build a map of item names to their data for efficient lookup
  const itemMap = new Map<string, {
    type: 'exotic' | 'mod' | 'aspect' | 'fragment',
    name: string,
    imageUrl: string,
    description: string,
    armorType?: string
  }>();
  
  // Add exotics that we've already fetched
  existingItems.exotics.forEach(exotic => {
    itemMap.set(exotic.name, {
      type: 'exotic',
      name: exotic.name,
      imageUrl: exotic.imageUrl,
      description: exotic.description
    });
  });
  
  // Add mods that we've already fetched
  existingItems.mods.forEach(mod => {
    itemMap.set(mod.name, {
      type: 'mod',
      name: mod.name,
      imageUrl: mod.imageUrl,
      description: mod.description,
      armorType: mod.armorType
    });
  });
  
  // Add aspects to the map
  aspects.forEach(aspect => {
    itemMap.set(aspect.displayProperties.name, {
      type: 'aspect',
      name: aspect.displayProperties.name,
      imageUrl: `https://www.bungie.net${aspect.displayProperties.icon}`,
      description: aspect.displayProperties.description
    });
  });
  
  // Add fragments to the map
  fragments.forEach(fragment => {
    itemMap.set(fragment.displayProperties.name, {
      type: 'fragment',
      name: fragment.displayProperties.name,
      imageUrl: `https://www.bungie.net${fragment.displayProperties.icon}`,
      description: fragment.displayProperties.description
    });
  });

  // Sort item names by length (descending) to match longer names first
  const itemNames = Array.from(itemMap.keys()).sort((a, b) => b.length - a.length);
  
  // Create a regex pattern that matches any of the item names
  const itemPattern = new RegExp(`\\b(${itemNames.map(name => name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'g');
  
  // Split the text by matches and create an array of text and match segments
  const segments: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;
  
  // Make a copy of the text for regex matching
  const textToMatch = text;
  
  while ((match = itemPattern.exec(textToMatch)) !== null) {
    // Add the text segment before the match
    if (match.index > lastIndex) {
      segments.push(textToMatch.substring(lastIndex, match.index));
    }
    
    // Get the matched item name
    const itemName = match[0];
    const item = itemMap.get(itemName);
    
    if (item) {
      // Check if this item has already been highlighted
      if (!highlightedItems.has(itemName)) {
        // Add the highlighted item component
        segments.push(
          <GameItemPopover 
            key={`${itemName}-${match.index}`} 
            item={item} 
          />
        );
        // Add to the set of highlighted items
        highlightedItems.add(itemName);
      } else {
        // Item already highlighted before, just add the text
        segments.push(itemName);
      }
    } else {
      // If the item isn't found (shouldn't happen), just add the text
      segments.push(itemName);
    }
    
    lastIndex = match.index + itemName.length;
  }
  
  // Add any remaining text after the last match
  if (lastIndex < textToMatch.length) {
    segments.push(textToMatch.substring(lastIndex));
  }
  
  return segments;
} 