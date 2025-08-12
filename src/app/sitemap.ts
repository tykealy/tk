import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/published`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
  ]
  
  // Dynamic story pages
  try {
    const { data: stories } = await supabase
      .from('stories')
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false })
    
    const storyPages = (stories || []).map((story) => ({
      url: `${baseUrl}/story/${story.slug}`,
      lastModified: new Date(story.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    
    return [...staticPages, ...storyPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
