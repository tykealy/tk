"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Story = Database['public']['Tables']['stories']['Row']
type StoryInsert = Database['public']['Tables']['stories']['Insert']
type StoryUpdate = Database['public']['Tables']['stories']['Update']

export function useStory(storyId?: string) {
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storyId) {
      setLoading(false)
      return
    }

    async function fetchStory() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single()

        if (error) throw error
        setStory(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [storyId])

  const saveStory = async (updates: StoryUpdate) => {
    if (!storyId) return

    try {
      const { data, error } = await supabase
        .from('stories')
        .update(updates)
        .eq('id', storyId)
        .select()
        .single()

      if (error) throw error
      setStory(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      throw err
    }
  }

  const createStory = async (story: StoryInsert) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('stories')
        .insert({
          ...story,
          user_id: user?.id || null, // Use user ID if authenticated, null if anonymous
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
      throw err
    }
  }

  return {
    story,
    loading,
    error,
    saveStory,
    createStory,
  }
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStories() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .order('updated_at', { ascending: false })

        if (error) throw error
        setStories(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  const deleteStory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setStories(prev => prev.filter(story => story.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
      throw err
    }
  }

  const unpublishStory = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .update({ 
          published: false,
          published_at: null,
          slug: null // Remove slug when unpublishing to avoid conflicts
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setStories(prev => prev.map(story => 
        story.id === id ? { ...story, published: false, published_at: undefined, slug: undefined } : story
      ))
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish')
      throw err
    }
  }

  return {
    stories,
    loading,
    error,
    deleteStory,
    unpublishStory,
    refetch: () => {
      setLoading(true)
      // Trigger useEffect to refetch
      setStories([])
    }
  }
}

// Add hook for fetching published stories by slug
export function usePublishedStory(slug?: string) {
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    async function fetchPublishedStory() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single()

        if (error) throw error
        setStory(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Story not found')
      } finally {
        setLoading(false)
      }
    }

    fetchPublishedStory()
  }, [slug])

  return {
    story,
    loading,
    error,
  }
}

// Add hook for fetching all published stories
export function usePublishedStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPublishedStories() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false })

        if (error) throw error
        setStories(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPublishedStories()
  }, [])

  return {
    stories,
    loading,
    error,
  }
}