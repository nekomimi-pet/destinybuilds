import type React from "react"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function BuildsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

