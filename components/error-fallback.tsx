'use client'

import { Button } from "@/components/ui/button"

export function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">
          Something went wrong
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          {error.message}
        </p>
        <Button onClick={resetErrorBoundary}>
          Try again
        </Button>
      </div>
    </div>
  )
} 