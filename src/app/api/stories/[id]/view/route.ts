import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Increment view count using Supabase RPC or raw SQL
    const { data, error } = await supabase.rpc("increment_story_views", {
      story_id: id
    })

    if (error) {
      // If RPC doesn't exist, fall back to manual increment
      const { data: story, error: fetchError } = await supabase
        .from("stories")
        .select("view_count")
        .eq("id", id)
        .single()

      if (fetchError) {
        console.error("Error fetching story:", fetchError)
        return NextResponse.json(
          { error: "Story not found" },
          { status: 404 }
        )
      }

      const currentCount = story.view_count || 0
      const { error: updateError } = await supabase
        .from("stories")
        .update({ view_count: currentCount + 1 })
        .eq("id", id)

      if (updateError) {
        console.error("Error updating view count:", updateError)
        return NextResponse.json(
          { error: "Failed to update view count" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, view_count: currentCount + 1 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error incrementing view count:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
