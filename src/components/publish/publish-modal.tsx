"use client"

import * as React from "react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Input } from "@/components/tiptap-ui-primitive/input"
import { Card } from "@/components/tiptap-ui-primitive/card"
import { CloseIcon } from "@/components/tiptap-icons/close-icon"
import { uploadStoryImage, deleteStoryImage, supabase, generateSlug, generateUniqueSlug } from "@/lib/supabase"

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  story: {
    title: string
    content: any
    id: string
  }
  onPublish: (options: PublishOptions) => void
}

interface PublishOptions {
  subtitle?: string
  previewImage?: string
  slug?: string
  readingTime?: number
}

export function PublishModal({ isOpen, onClose, story, onPublish }: PublishModalProps) {
  const [subtitle, setSubtitle] = React.useState("")
  const [readingTime, setReadingTime] = React.useState<number>(1)
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  const [isPublishing, setIsPublishing] = React.useState(false)
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [generatedSlug, setGeneratedSlug] = React.useState<string>("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Click outside to close functionality
  const modalRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  // Generate slug when modal opens or title changes
  React.useEffect(() => {
    if (isOpen && story.title) {
      const baseSlug = generateSlug(story.title)
      setGeneratedSlug(baseSlug)
    }
  }, [isOpen, story.title])

  // Load existing data when modal opens
  React.useEffect(() => {
    if (isOpen && story.id) {
      loadExistingData()
    }
  }, [isOpen, story.id])

  const loadExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('preview_image, subtitle, slug, reading_time')
        .eq('id', story.id)
        .single()

      if (error) throw error
      
      if (data.preview_image) {
        setPreviewImage(data.preview_image)
      }
      if (data.subtitle) {
        setSubtitle(data.subtitle)
      }
      if (data.slug) {
        setGeneratedSlug(data.slug)
      }
      if (data.reading_time) {
        setReadingTime(data.reading_time)
      }
    } catch (error) {
      console.error('Failed to load existing data:', error)
    }
  }

  const saveImageToDatabase = async (imageUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .update({ preview_image: imageUrl })
        .eq('id', story.id)
        .select()
        .single()

      if (error) throw error
      console.log('Preview image saved to database:', imageUrl)
      return data
    } catch (error) {
      console.error('Failed to save preview image to database:', error)
      throw error
    }
  }

  const removeImageFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .update({ preview_image: null })
        .eq('id', story.id)
        .select()
        .single()

      if (error) throw error
      console.log('Preview image removed from database')
      return data
    } catch (error) {
      console.error('Failed to remove preview image from database:', error)
      throw error
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Clear previous errors
    setUploadError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (PNG, JPG, GIF, WebP, etc.)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB')
      return
    }

    setIsUploadingImage(true)
    console.log('Starting image upload...')
    
    try {
      // Delete old image if exists
      if (previewImage) {
        console.log('Removing previous image...')
        await deleteStoryImage(previewImage)
        await removeImageFromDatabase()
      }

      // Upload new image to storage
      console.log('Uploading new image...')
      const imageUrl = await uploadStoryImage(file, story.id)
      console.log('Upload completed, URL:', imageUrl)
      
      // Save image URL to database immediately
      console.log('Saving image URL to database...')
      await saveImageToDatabase(imageUrl)
      
      setPreviewImage(imageUrl)
      setUploadError(null)
    } catch (error) {
      console.error('Upload failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
      setUploadError(errorMessage)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImage = async () => {
    if (previewImage) {
      try {
        // Delete from storage
        await deleteStoryImage(previewImage)
        // Remove from database
        await removeImageFromDatabase()
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
    }
    
    setPreviewImage(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      // Generate unique slug
      const uniqueSlug = await generateUniqueSlug(story.title, story.id)
      
      // Check if story is already published to preserve published_at
      const { data: existingStory } = await supabase
        .from('stories')
        .select('published, published_at')
        .eq('id', story.id)
        .single()
      
      // Save subtitle and slug to database if changed
      const updates: any = {
        published: true,
        slug: uniqueSlug
      }
      
      // Only set published_at if this is the first time publishing
      if (!existingStory?.published || !existingStory?.published_at) {
        updates.published_at = new Date().toISOString()
      }
      
      if (subtitle) {
        updates.subtitle = subtitle
      }
      
      if (readingTime) {
        updates.reading_time = readingTime
      }
      
      await supabase
        .from('stories')
        .update(updates)
        .eq('id', story.id)

      await onPublish({
        subtitle,
        previewImage: previewImage || undefined,
        slug: uniqueSlug,
        readingTime,
      })
      onClose()
    } catch (error) {
      console.error('Failed to publish:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="publish-modal-overlay">
      <div className="publish-modal-container">
        <Card ref={modalRef} className="publish-modal-card">
          {/* Close button moved to top-right corner */}
          <Button
            onClick={onClose}
            data-style="ghost"
            className="publish-modal-close-floating"
          >
            <CloseIcon className="tiptap-button-icon" />
          </Button>

          <div className="publish-modal-content">
            {/* Left side - Preview */}
            <div className="publish-modal-preview">
              <div className="story-preview-image">
                {previewImage ? (
                  <div className="preview-image-container">
                    <img src={previewImage} alt="Story preview" className="preview-image" />
                    <div className="image-overlay">
                      <Button 
                        data-style="secondary" 
                        className="change-image-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? 'Uploading...' : 'Change image'}
                      </Button>
                      <Button 
                        data-style="ghost" 
                        className="remove-image-btn"
                        onClick={removeImage}
                        disabled={isUploadingImage}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="preview-image-placeholder">
                    {isUploadingImage ? (
                      <div className="upload-progress">
                        <div className="upload-spinner"></div>
                        <span>Uploading image...</span>
                      </div>
                    ) : (
                      <Button 
                        data-style="secondary" 
                        className="add-image-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg className="image-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        Add preview image
                      </Button>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden-file-input"
                  disabled={isUploadingImage}
                />
              </div>

              {/* Upload error message */}
              {uploadError && (
                <div className="upload-error">
                  <p>{uploadError}</p>
                </div>
              )}
              
              <h3 className="story-preview-title">{story.title || "Untitled Story"}</h3>
              
              <div className="subtitle-field">
                <label className="subtitle-label">Subtitle</label>
                <Input
                  placeholder="Add a compelling subtitle to draw readers in..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="subtitle-input"
                />
                <div className="subtitle-hint">
                  A good subtitle provides context and entices readers to continue
                </div>
              </div>

              {/* Reading Time Field */}
              <div className="reading-time-field">
                <label className="reading-time-label">Reading Time</label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  placeholder="1"
                  value={readingTime}
                  onChange={(e) => setReadingTime(parseInt(e.target.value) || 1)}
                  className="reading-time-input"
                />
                <div className="reading-time-hint">
                  Estimated reading time in minutes (e.g., 1 min read, 5 min read)
                </div>
              </div>

              {/* Story URL Preview */}
              <div className="story-url-preview">
                <label className="url-label">Story URL</label>
                <div className="url-display">
                  <span className="url-base">yoursite.com/story/</span>
                  <span className="url-slug">{generatedSlug || 'story-slug'}</span>
                </div>
                <div className="url-hint">
                  URL is automatically generated from your title
                </div>
              </div>
              
              <p className="preview-note">
                <strong>Note:</strong> Changes here will affect how your story appears in public 
                places — not the contents of the story itself.
              </p>
            </div>

            {/* Right side - Publishing options */}
            <div className="publish-modal-options">
              <div className="publish-header">
                <h3>Ready to Publish?</h3>
                <p>Share your story with the world</p>
              </div>

              <div className="publish-details">
                <div className="detail-item">
                  <div className="detail-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Publishing to</span>
                    <span className="detail-value">Ly Tykea</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Publication time</span>
                    <span className="detail-value">Immediately</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Visibility</span>
                    <span className="detail-value">Public</span>
                  </div>
                </div>
              </div>

              <div className="publish-info">
                <p>Your story will be published and visible to all readers immediately.</p>
              </div>

              {/* Action buttons */}
              <div className="publish-actions">
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || isUploadingImage}
                  className="publish-btn"
                >
                  {isPublishing ? (
                    <>
                      <div className="publish-spinner"></div>
                      Publishing...
                    </>
                  ) : (
                    "Publish Story"
                  )}
                </Button>
                <Button 
                  data-style="ghost" 
                  className="schedule-btn"
                  disabled={isUploadingImage}
                >
                  Schedule for later
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
