import { preloadDestinyManifest } from "@/lib/destinyApi"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await preloadDestinyManifest()
    return NextResponse.json({ success: true, message: "Manifest preloaded successfully" })
  } catch (error) {
    console.error("Failed to preload manifest:", error)
    return NextResponse.json(
      { success: false, message: "Failed to preload manifest", error: String(error) },
      { status: 500 },
    )
  }
}

