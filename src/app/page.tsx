import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import { HomeClient } from "./home-client"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const metadata: Metadata = {
  title: "Published Stories",
  description: "Discover amazing stories from our community. Read engaging articles, creative writing, and thought-provoking content.",
  openGraph: {
    title: "Published Stories | TK Stories",
    description: "Discover amazing stories from our community.",
    type: "website",
  }
}

async function getPublishedStories() {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching stories:", error)
    return []
  }
}

export default async function Home() {
  const stories = await getPublishedStories()

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Published Stories",
    description: "A collection of published stories from our community",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: stories.length,
      itemListElement: stories.map((story, index) => ({
        "@type": "Article",
        position: index + 1,
        headline: story.title,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/story/${story.slug}`,
        datePublished: story.published_at,
        author: {
          "@type": "Organization",
          name: "TK Stories"
        }
      }))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <HomeClient stories={stories} />
    </>
  )
}
