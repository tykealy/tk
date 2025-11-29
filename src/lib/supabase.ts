import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      stories: {
        Row: {
          id: string
          title: string
          content: any
          subtitle?: string
          preview_image?: string
          slug?: string
          published: boolean
          published_at?: string
          reading_time?: number
          view_count?: number
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: any
          subtitle?: string
          preview_image?: string
          slug?: string
          published?: boolean
          published_at?: string
          reading_time?: number
          view_count?: number
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: any
          subtitle?: string
          preview_image?: string
          slug?: string
          published?: boolean
          published_at?: string
          reading_time?: number
          view_count?: number
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Slug generation utility
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters
    .substring(0, 100)
}

// Check if slug is unique and generate a unique one if needed
export const generateUniqueSlug = async (title: string, excludeId?: string): Promise<string> => {
  const baseSlug = generateSlug(title)
  
  if (!baseSlug) {
    // Fallback if title generates empty slug
    return `story-${Date.now()}`
  }
  
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    // Check if slug exists
    let query = supabase
      .from('stories')
      .select('id')
      .eq('slug', slug)
      .eq('published', true) // Only check against published stories
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error checking slug uniqueness:', error)
      // If error, add timestamp to make it unique
      return `${baseSlug}-${Date.now()}`
    }
    
    if (!data || data.length === 0) {
      // Slug is unique
      return slug
    }
    
    // Slug exists, try with counter
    slug = `${baseSlug}-${counter}`
    counter++
    
    // Prevent infinite loop
    if (counter > 100) {
      return `${baseSlug}-${Date.now()}`
    }
  }
}

// Simplified image upload - just try to upload directly
export const uploadStoryImage = async (file: File, storyId: string): Promise<string> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${storyId}-${Date.now()}.${fileExt}`
    const filePath = `story-images/${fileName}`

    console.log('Uploading to bucket: story-assets')
    console.log('File path:', filePath)
    console.log('File size:', file.size, 'bytes')
    console.log('File type:', file.type)

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('story-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true  // Allow overwrite if file exists
      })

    if (error) {
      console.error('Supabase storage error:', error)
      
      // More specific error handling
      if (error.message.includes('Bucket not found')) {
        throw new Error('Storage bucket "story-assets" not found. Please check that the bucket exists and is properly configured.')
      } else if (error.message.includes('exceeded')) {
        throw new Error('File size too large. Please use an image smaller than 10MB.')
      } else if (error.message.includes('not allowed')) {
        throw new Error('File type not allowed. Please upload a valid image file.')
      } else {
        throw new Error(`Upload failed: ${error.message}`)
      }
    }

    console.log('Upload successful:', data)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('story-assets')
      .getPublicUrl(filePath)

    console.log('Public URL generated:', publicUrl)
    
    // Verify the URL is accessible
    if (!publicUrl) {
      throw new Error('Failed to generate public URL for uploaded image')
    }

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Failed to upload image. Please try again.')
  }
}

export const deleteStoryImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract filename from URL
    const url = new URL(imageUrl)
    const pathSegments = url.pathname.split('/')
    
    // Look for the filename after story-images
    const storyImagesIndex = pathSegments.findIndex(segment => segment === 'story-images')
    if (storyImagesIndex === -1 || storyImagesIndex >= pathSegments.length - 1) {
      console.warn('Could not extract filename from URL:', imageUrl)
      return
    }
    
    const fileName = pathSegments[storyImagesIndex + 1]
    const filePath = `story-images/${fileName}`

    console.log('Attempting to delete file:', filePath)

    const { error } = await supabase.storage
      .from('story-assets')
      .remove([filePath])

    if (error) {
      console.error('Error deleting image:', error)
    } else {
      console.log('Image deleted successfully:', filePath)
    }
  } catch (error) {
    console.error('Error in deleteStoryImage:', error)
    // Don't throw - deletion failure shouldn't break the flow
  }
}

// Test function to verify bucket access
export const testBucketAccess = async (): Promise<void> => {
  try {
    console.log('Testing bucket access...')
    
    // Try to list buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }
    
    console.log('Available buckets:', buckets?.map(b => b.name))
    
    // Check if story-assets exists
    const storyAssetsBucket = buckets?.find(b => b.name === 'story-assets')
    if (storyAssetsBucket) {
      console.log('story-assets bucket found:', storyAssetsBucket)
    } else {
      console.error('story-assets bucket not found')
    }
    
    // Try to list files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('story-assets')
      .list('story-images', {
        limit: 1
      })
    
    if (filesError) {
      console.error('Error accessing story-assets bucket:', filesError)
    } else {
      console.log('Successfully accessed story-assets bucket, files:', files)
    }
    
  } catch (error) {
    console.error('Bucket access test failed:', error)
  }
}
