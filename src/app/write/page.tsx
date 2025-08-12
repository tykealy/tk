"use client"

import { Suspense } from "react"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { SimpleAuthGuard } from "@/components/auth/simple-auth-guard"
import { useRouter, useSearchParams } from "next/navigation"

function WritePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const storyId = searchParams.get('id') || undefined

  const handleStoryChange = (story: any) => {
    if (!storyId && story?.id) {
      // Redirect to include the story ID in the URL
      router.replace(`/write?id=${story.id}`)
    }
  }

  return (
    <SimpleAuthGuard>
      <SimpleEditor 
        storyId={storyId} 
        onStoryChange={handleStoryChange}
      />
    </SimpleAuthGuard>
  )
}

export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading editor...</div>
      </div>
    }>
      <WritePageContent />
    </Suspense>
  )
}
