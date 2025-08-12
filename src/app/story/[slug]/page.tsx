"use client"

import './page.scss'
import { useParams } from 'next/navigation'
import { usePublishedStory } from '@/hooks/use-story'
import { generateHTML } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Underline from '@tiptap/extension-underline'

// Import custom extensions
import ImageUploadNode from '@/components/tiptap-node/image-upload-node/image-upload-node-extension'
import HorizontalRule from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'
import { ThemeToggle } from '@/components/tiptap-templates/simple/theme-toggle'

// Calculate reading time
function calculateReadingTime(content: any): number {
  if (!content) return 0
  const text = JSON.stringify(content)
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export default function StoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const { story, loading, error } = usePublishedStory(slug)

  if (loading) {
    return (
      <div className="minimal-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="minimal-error">
        <h1>Story not found</h1>
        <a href="/">← Back</a>
      </div>
    )
  }

  // Use stored reading time if available, otherwise calculate it
  const readingTime = story.reading_time || calculateReadingTime(story.content)

  // Convert TipTap JSON content to HTML
  const htmlContent = generateHTML(story.content, [
    StarterKit,
    Image,
    Link.configure({
      openOnClick: false,
    }),
    Highlight,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Color,
    TextStyle,
    Subscript,
    Superscript,
    Underline,
    ImageUploadNode,
    HorizontalRule,
  ])

  return (
    <div className="minimal-container">
      {/* Theme toggle - positioned absolutely in top right */}
      <div className="minimal-theme-toggle">
        <ThemeToggle />
      </div>
      
      <article className="minimal-story">
        <header className="minimal-header">
          <h1 className="minimal-title">{story.title}</h1>
          
          {story.subtitle && (
            <h2 className="minimal-subtitle">{story.subtitle}</h2>
          )}

          <div className="minimal-meta">
            <span className="minimal-date">
              {new Date(story.published_at!).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="minimal-reading-time">{readingTime} min read</span>
          </div>

          {story.preview_image && (
            <div className="minimal-image">
              <img src={story.preview_image} alt={story.title} />
            </div>
          )}
        </header>

        <main className="minimal-content">
          <div 
            className="minimal-prose"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </main>
      </article>
    </div>
  )
}
