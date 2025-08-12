import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const metadata: Metadata = {
  title: 'Published Stories',
  description: 'Discover amazing stories from our community. Read engaging articles, creative writing, and thought-provoking content.',
  openGraph: {
    title: 'Published Stories | TK Stories',
    description: 'Discover amazing stories from our community.',
    type: 'website',
  }
}

async function getPublishedStories() {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching stories:', error)
    return []
  }
}

export default async function PublishedStoriesPage() {
  const stories = await getPublishedStories()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Published Stories',
    description: 'A collection of published stories from our community',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/published`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: stories.length,
      itemListElement: stories.map((story, index) => ({
        '@type': 'Article',
        position: index + 1,
        headline: story.title,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/story/${story.slug}`,
        datePublished: story.published_at,
        author: {
          '@type': 'Organization',
          name: 'TK Stories'
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
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Published Stories</h1>
            <p className="text-lg text-gray-600">Discover amazing stories from our community</p>
          </header>

          {stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No published stories yet.</p>
              <Link 
                href="/write"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                Be the first to publish a story →
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <article key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {story.preview_image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={story.preview_image} 
                        alt={story.title}
                        className="w-full h-full object-cover"
                        width={400}
                        height={225}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      <Link 
                        href={`/story/${story.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {story.title}
                      </Link>
                    </h2>
                    
                    {story.subtitle && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {story.subtitle}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <time dateTime={story.published_at}>
                          {new Date(story.published_at!).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </time>
                        {story.reading_time && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>{story.reading_time} min read</span>
                          </>
                        )}
                      </div>
                      
                      <Link 
                        href={`/story/${story.slug}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
