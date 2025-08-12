"use client"

import Link from 'next/link'
import { useStories } from '@/hooks/use-story'
import { SimpleAuthGuard } from '@/components/auth/simple-auth-guard'

function StoriesPageContent() {
  const { stories, loading, deleteStory } = useStories()

  if (loading) {
    return <div className="p-8">Loading stories...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Stories</h1>
        <Link 
          href="/write"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Story
        </Link>
      </div>

      <div className="grid gap-4">
        {stories.map((story) => (
          <div key={story.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link 
                  href={`/write?id=${story.id}`}
                  className="text-xl font-semibold hover:text-blue-600"
                >
                  {story.title}
                </Link>
                
                {story.subtitle && (
                  <p className="text-gray-600 text-sm mt-1">
                    {story.subtitle}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-gray-500 text-sm">
                    Updated {new Date(story.updated_at).toLocaleDateString()}
                  </p>
                  
                  {story.published && story.slug && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                      <Link 
                        href={`/story/${story.slug}`}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => deleteStory(story.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p>No stories yet.</p>
          <Link 
            href="/write"
            className="text-blue-500 hover:text-blue-600"
          >
            Create your first story
          </Link>
        </div>
      )}
    </div>
  )
}

export default function StoriesPage() {
  return (
    <SimpleAuthGuard>
      <StoriesPageContent />
    </SimpleAuthGuard>
  )
}
