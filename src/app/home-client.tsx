"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import "./home.scss"

interface Story {
  id: string
  title: string
  subtitle?: string
  slug?: string
  preview_image?: string
  published_at?: string
  reading_time?: number
}

interface HomeClientProps {
  stories: Story[]
}

export function HomeClient({ stories }: HomeClientProps) {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-theme-toggle">
          <ThemeToggle />
        </div>

        <header className="home-header">
          <h1 className="home-title">Published Stories</h1>
          <p className="home-subtitle">Discover amazing stories from our community</p>
        </header>

        {stories.length === 0 ? (
          <div className="home-empty">
            <p className="home-empty-text">No published stories yet.</p>
            <Link href="/write" className="home-empty-link">
              Be the first to publish a story →
            </Link>
          </div>
        ) : (
          <div className="home-grid">
            {stories.map((story) => (
              <article key={story.id} className="home-card">
                {story.preview_image && (
                  <div className="home-card-image">
                    <img 
                      src={story.preview_image} 
                      alt={story.title}
                      width={400}
                      height={225}
                    />
                  </div>
                )}
                
                <div className="home-card-content">
                  <h2 className="home-card-title">
                    <Link href={`/story/${story.slug}`}>
                      {story.title}
                    </Link>
                  </h2>
                  
                  {story.subtitle && (
                    <p className="home-card-subtitle">
                      {story.subtitle}
                    </p>
                  )}
                  
                  <div className="home-card-meta">
                    <div className="home-card-meta-info">
                      <time dateTime={story.published_at}>
                        {story.published_at && new Date(story.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </time>
                      {story.reading_time && (
                        <>
                          <span className="home-card-meta-separator">•</span>
                          <span>{story.reading_time} min read</span>
                        </>
                      )}
                    </div>
                    
                    <Link href={`/story/${story.slug}`} className="home-card-link">
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
