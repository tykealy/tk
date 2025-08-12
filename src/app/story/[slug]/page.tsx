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
import { useState, useEffect } from 'react'

// Import custom extensions
import ImageUploadNode from '@/components/tiptap-node/image-upload-node/image-upload-node-extension'
import HorizontalRule from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'

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
  const [claps, setClaps] = useState(0)
  const [hasClapped, setHasClapped] = useState(false)

  useEffect(() => {
    // Simulate claps count (in real app, fetch from database)
    setClaps(Math.floor(Math.random() * 200) + 10)
  }, [])

  const handleClap = () => {
    if (!hasClapped) {
      setClaps(prev => prev + 1)
      setHasClapped(true)
    }
  }

  if (loading) {
    return (
      <div className="story-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading story...</p>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="story-error">
        <div className="error-content">
          <h1>Story Not Found</h1>
          <p>{error || 'The story you are looking for does not exist or has been unpublished.'}</p>
          <a href="/" className="back-link">← Return to Home</a>
        </div>
      </div>
    )
  }

  const readingTime = calculateReadingTime(story.content)

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
    <div className="medium-container">
      {/* Navigation Bar */}
      <nav className="medium-nav">
        <div className="nav-content">
          <a href="/" className="nav-logo">TK Stories</a>
          <div className="nav-actions">
            <a href="/write" className="nav-btn">Write</a>
            <button className="nav-btn nav-btn-primary">Sign in</button>
            <button className="nav-btn nav-btn-secondary">Get started</button>
          </div>
        </div>
      </nav>

      <article className="story-container">
        {/* Header */}
        <header className="story-header">
          <div className="story-header-content">
            <h1 className="story-title">{story.title}</h1>
            
            {story.subtitle && (
              <h2 className="story-subtitle">{story.subtitle}</h2>
            )}

            {/* Author and Meta Info */}
            <div className="story-author-section">
              <div className="author-info">
                <div className="author-avatar">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=44&h=44&fit=crop&crop=face&auto=format&q=80" alt="Mark Manson" />
                </div>
                <div className="author-details">
                  <div className="author-name">
                    Mark Manson
                    <svg className="verified-badge" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M12.643 4.357a.75.75 0 00-1.061 0L8 7.939 4.418 4.357a.75.75 0 10-1.061 1.061L6.939 9l-3.582 3.582a.75.75 0 101.061 1.061L8 10.061l3.582 3.582a.75.75 0 101.061-1.061L9.061 9l3.582-3.582a.75.75 0 000-1.061z"/>
                    </svg>
                  </div>
                  <div className="author-follow">
                    <button className="follow-btn">Following</button>
                    <svg className="chevron-down" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"/>
                    </svg>
                  </div>
                  <div className="story-meta">
                    <span className="reading-time">{readingTime} min read</span>
                    <span className="meta-separator">·</span>
                    <span className="story-date">
                      {new Date(story.published_at!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="story-actions">
                <button className="action-btn bookmark-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path d="M4 2h12a2 2 0 012 2v14l-8-4-8 4V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
                <button className="action-btn more-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <circle cx="10" cy="5" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="15" r="1.5" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {story.preview_image && (
              <div className="story-hero-image">
                <img src={story.preview_image} alt={story.title} />
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="story-content">
          <div className="story-prose-container">
            <div 
              className="story-prose"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </main>

        {/* Engagement Section */}
        <section className="story-engagement">
          <div className="engagement-actions">
            <div className="clap-section">
              <button 
                className={`clap-button ${hasClapped ? 'clapped' : ''}`}
                onClick={handleClap}
                disabled={hasClapped}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M11.37.83L12 3.28l.63-2.45h-1.26zM13.92 3.95l1.52-2.1-1.18-.4-.34 2.5zM8.59 1.45L10.1 3.95l-.34-2.5-1.17.4zM19.15 7.37c.84-2.98-1.42-3.33-2.26-2.08C15.88 2.91 13.36 3.35 12 3.35S8.12 2.91 7.11 5.29c-.84-1.25-3.1-.9-2.26 2.08C3.32 8.17 3.92 9.65 3.92 9.65S8.91 24 12 24s8.08-14.35 8.08-14.35S20.68 8.17 19.15 7.37z"/>
                </svg>
              </button>
              <span className="clap-count">{claps}</span>
            </div>
            
            <div className="engagement-right">
              <button className="comment-btn">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M18 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8l4 4V4a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
                <span>1019</span>
              </button>
              
              <button className="share-btn">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </button>
              
              <button className="bookmark-btn">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M4 2h16a2 2 0 012 2v16l-8-4-8 4V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </article>

      {/* Floating Action Bar - Left Side */}
      <div className="floating-actions">
        <button 
          className={`floating-clap ${hasClapped ? 'clapped' : ''}`}
          onClick={handleClap}
          disabled={hasClapped}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M11.37.83L12 3.28l.63-2.45h-1.26zM13.92 3.95l1.52-2.1-1.18-.4-.34 2.5zM8.59 1.45L10.1 3.95l-.34-2.5-1.17.4zM19.15 7.37c.84-2.98-1.42-3.33-2.26-2.08C15.88 2.91 13.36 3.35 12 3.35S8.12 2.91 7.11 5.29c-.84-1.25-3.1-.9-2.26 2.08C3.32 8.17 3.92 9.65 3.92 9.65S8.91 24 12 24s8.08-14.35 8.08-14.35S20.68 8.17 19.15 7.37z"/>
          </svg>
          <span className="clap-count">{claps}</span>
        </button>
        
        <button className="floating-action">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M18 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8l4 4V4a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
