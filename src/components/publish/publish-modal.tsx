"use client"

import * as React from "react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Input } from "@/components/tiptap-ui-primitive/input"
import { Card } from "@/components/tiptap-ui-primitive/card"
import { CloseIcon } from "@/components/tiptap-icons/close-icon"
import { uploadStoryImage, deleteStoryImage, supabase } from "@/lib/supabase"

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
}

export function PublishModal({ isOpen, onClose, story, onPublish }: PublishModalProps) {
  const [subtitle, setSubtitle] = React.useState("")
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  const [isPublishing, setIsPublishing] = React.useState(false)
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Load existing preview image when modal opens
  React.useEffect(() => {
    if (isOpen && story.id) {
      loadExistingPreviewImage()
    }
  }, [isOpen, story.id])

  const loadExistingPreviewImage = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('preview_image, subtitle')
        .eq('id', story.id)
        .single()

      if (error) throw error
      
      if (data.preview_image) {
        setPreviewImage(data.preview_image)
      }
      if (data.subtitle) {
        setSubtitle(data.subtitle)
      }
    } catch (error) {
      console.error('Failed to load existing preview image:', error)
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
      // Save subtitle to database if changed
      if (subtitle) {
        await supabase
          .from('stories')
          .update({ subtitle })
          .eq('id', story.id)
      }

      await onPublish({
        subtitle,
        previewImage: previewImage || undefined,
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
        <Card className="publish-modal-card">
          {/* Header */}
          <div className="publish-modal-header">
            <h2 className="publish-modal-title">Story Preview</h2>
            <Button
              onClick={onClose}
              data-style="ghost"
              className="publish-modal-close"
            >
              <CloseIcon className="tiptap-button-icon" />
            </Button>
          </div>

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
                        className="change-image-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
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
              
              <Input
                placeholder="Write a preview subtitle..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="subtitle-input"
              />
              
              <p className="preview-note">
                <strong>Note:</strong> Changes here will affect how your story appears in public 
                places — not the contents of the story itself.
              </p>
            </div>

            {/* Right side - Publishing options */}
            <div className="publish-modal-options">
              <div className="publishing-to">
                <h4>Publishing to: <span className="author-name">Ly Tykea</span></h4>
              </div>

              <div className="publish-info">
                <p>Your story will be published and visible to all readers.</p>
              </div>

              {/* Action buttons */}
              <div className="publish-actions">
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || isUploadingImage}
                  className="publish-btn"
                >
                  {isPublishing ? "Publishing..." : "Publish now"}
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
