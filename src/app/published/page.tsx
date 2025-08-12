"use client"

import Link from 'next/link'
import { usePublishedStories } from '@/hooks/use-story'

export default function PublishedStoriesPage() {
  const { stories, loading, error } = usePublishedStories()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading published stories...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
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
                    <time dateTime={story.published_at}>
                      {new Date(story.published_at!).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                    
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
  )
}
