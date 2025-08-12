"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useStories } from '@/hooks/use-story'
import { SimpleAuthGuard } from '@/components/auth/simple-auth-guard'

function StoriesPageContent() {
  const { stories, loading, deleteStory, unpublishStory } = useStories()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'status'>('updated')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter and sort stories
  const filteredAndSortedStories = stories
    .filter(story => 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (story.subtitle?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'status':
          if (a.published !== b.published) {
            return a.published ? -1 : 1
          }
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

  const toggleStorySelection = (storyId: string) => {
    const newSelected = new Set(selectedStories)
    if (newSelected.has(storyId)) {
      newSelected.delete(storyId)
    } else {
      newSelected.add(storyId)
    }
    setSelectedStories(newSelected)
  }

  const selectAllStories = () => {
    if (selectedStories.size === stories.length) {
      setSelectedStories(new Set())
    } else {
      setSelectedStories(new Set(stories.map(s => s.id)))
    }
  }

  const deleteSelectedStories = async () => {
    if (confirm(`Delete ${selectedStories.size} selected stories?`)) {
      for (const storyId of selectedStories) {
        await deleteStory(storyId)
      }
      setSelectedStories(new Set())
    }
  }

  const unpublishSelectedStories = async () => {
    const selectedStoriesData = stories.filter(story => selectedStories.has(story.id))
    const publishedStories = selectedStoriesData.filter(story => story.published)
    
    if (publishedStories.length === 0) {
      alert('No published stories selected.')
      return
    }
    
    if (confirm(`Unpublish ${publishedStories.length} selected stories?`)) {
      for (const story of publishedStories) {
        await unpublishStory(story.id)
      }
      setSelectedStories(new Set())
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--tt-bg-color)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading your stories...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--tt-bg-color)' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 transition-colors duration-200 text-gray-900 dark:text-gray-100">
              Your Stories
            </h1>
            <p className="text-lg transition-colors duration-200 text-gray-600 dark:text-gray-400">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            </p>
          </div>
        <Link 
          href="/write"
            className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--tt-brand-color-500)' }}
        >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          New Story
        </Link>
      </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="updated">Recently Updated</option>
            <option value="title">Title A-Z</option>
            <option value="status">Status</option>
          </select>

          {/* View Mode */}
          <div className="flex rounded-lg border overflow-hidden border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-3 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-3 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedStories.size > 0 && (
          <div className="flex items-center gap-4 mb-6 p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {selectedStories.size} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={unpublishSelectedStories}
                className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                Unpublish Selected
              </button>
              <button
                onClick={deleteSelectedStories}
                className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected
              </button>
            </div>
            <button
              onClick={() => setSelectedStories(new Set())}
              className="px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Stories Grid/List */}
        {filteredAndSortedStories.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {filteredAndSortedStories.map((story) => (
              <StoryCard 
                key={story.id} 
                story={story} 
                viewMode={viewMode}
                isSelected={selectedStories.has(story.id)}
                onToggleSelect={() => toggleStorySelection(story.id)}
                onDelete={() => deleteStory(story.id)}
                onUnpublish={() => unpublishStory(story.id)}
              />
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
              No stories found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Select All (only show when there are stories) */}
        {stories.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={selectAllStories}
              className="text-sm text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
            >
              {selectedStories.size === stories.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Story Card Component
function StoryCard({ 
  story, 
  viewMode, 
  isSelected, 
  onToggleSelect, 
  onDelete,
  onUnpublish
}: {
  story: any
  viewMode: 'grid' | 'list'
  isSelected: boolean
  onToggleSelect: () => void
  onDelete: () => void
  onUnpublish: () => void
}) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this story?')) {
      onDelete()
    }
  }

  const handleUnpublish = () => {
    if (confirm('Are you sure you want to unpublish this story? It will no longer be visible to the public.')) {
      onUnpublish()
    }
  }

  if (viewMode === 'list') {
    return (
      <div 
        className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800 ${
          isSelected 
            ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500"
        />
        
        {story.preview_image && (
          <img
            src={story.preview_image}
            alt={story.title}
            className="w-16 h-16 object-cover rounded"
          />
        )}
        
                <div className="flex-1 min-w-0">
          <Link 
            href={`/write?id=${story.id}`}
            className="font-semibold hover:underline block truncate text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400"
          >
            {story.title}
          </Link>
          {story.subtitle && (
            <p className="text-sm mt-1 truncate text-gray-600 dark:text-gray-400">
              {story.subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <StatusBadge story={story} onUnpublish={handleUnpublish} />
          <span className="text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
            {new Date(story.updated_at).toLocaleDateString()}
          </span>
                    <div className="flex items-center gap-2">
                        {story.published && story.slug && (
              <Link 
                href={`/story/${story.slug}`}
                className="text-sm transition-colors text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                View →
              </Link>
            )}
            {story.published && (
              <button
                onClick={handleUnpublish}
                className="text-sm p-1 rounded transition-colors text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                title="Unpublish story"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-sm p-1 rounded transition-colors text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete story"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative p-6 rounded-lg border transition-all duration-200 hover:shadow-lg group bg-white dark:bg-gray-800 ${
        isSelected 
          ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="absolute top-4 right-4 w-4 h-4 rounded z-10 text-purple-500 focus:ring-purple-500"
      />
      
      {story.preview_image && (
        <div className="aspect-video mb-4 overflow-hidden rounded-lg">
          <img
            src={story.preview_image}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
                    </div>
                  )}
      
      <div className="space-y-3">
        <div>
          <Link 
            href={`/write?id=${story.id}`}
            className="text-xl font-semibold hover:underline line-clamp-2 text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400"
          >
            {story.title}
          </Link>
          {story.subtitle && (
            <p className="text-sm mt-2 line-clamp-2 text-gray-600 dark:text-gray-400">
              {story.subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <StatusBadge story={story} onUnpublish={handleUnpublish} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(story.updated_at).toLocaleDateString()}
          </span>
                </div>
        
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {story.reading_time && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {story.reading_time} min read
              </span>
            )}
            {story.published && story.slug && (
              <Link 
                href={`/story/${story.slug}`}
                className="text-sm transition-colors text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Published →
              </Link>
            )}
          </div>
              
                      <div className="flex items-center gap-1">
            {story.published && (
              <button
                onClick={handleUnpublish}
                className="opacity-0 group-hover:opacity-100 p-2 rounded transition-all text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                title="Unpublish story"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            )}
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 p-2 rounded transition-all text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete story"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
            </div>
          </div>
    </div>
  )
}

// Status Badge Component
function StatusBadge({ story, onUnpublish }: { story: any, onUnpublish?: () => void }) {
  if (story.published) {
    return (
      <div className="relative group">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white cursor-pointer bg-green-500 dark:bg-green-600">
          <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
          Published
        </span>
        {onUnpublish && (
          <div className="absolute hidden group-hover:block top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-max">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Are you sure you want to unpublish this story? It will no longer be visible to the public.')) {
                  onUnpublish()
                }
              }}
              className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left rounded-lg transition-colors text-amber-600 dark:text-amber-400"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              Unpublish
            </button>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-600 dark:bg-amber-500"></span>
      Draft
    </span>
  )
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="mb-8">
        <svg className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
          No stories yet
        </h3>
        <p className="text-lg mb-8 text-gray-500 dark:text-gray-400">
          Start writing your first story and share it with the world
        </p>
      </div>
      
      <div className="space-y-4">
        <Link 
          href="/write"
          className="inline-flex items-center px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Story
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h4 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Write</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Use our rich text editor to craft your story</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Save</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Auto-save keeps your work safe as you write</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <h4 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Publish</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Share your stories with the world when ready</p>
          </div>
        </div>
      </div>
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
