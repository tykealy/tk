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
  view_count?: number
}

interface HomeClientProps {
  stories: Story[]
}

export function HomeClient({ stories }: HomeClientProps) {
  return (
    <div className="home-container">
      <nav className="home-nav">
        <Link href="/write" className="home-nav-write">
          Write
        </Link>
        <ThemeToggle />
      </nav>

      <div className="home-content">
        <header className="home-header">
          <h1 className="home-title">Stories</h1>
        </header>

        {stories.length === 0 ? (
          <div className="home-empty">
            <p>No stories yet</p>
            <Link href="/write">Write the first one</Link>
          </div>
        ) : (
          <div className="home-stories">
            {stories.map((story) => (
              <Link 
                key={story.id} 
                href={`/story/${story.slug}`} 
                className="home-story"
              >
                <article>
                  {story.preview_image && (
                    <div className="home-story-image">
                      <img 
                        src={story.preview_image} 
                        alt={story.title}
                      />
                    </div>
                  )}
                  
                  <div className="home-story-content">
                    <h2 className="home-story-title">{story.title}</h2>
                    
                    {story.subtitle && (
                      <p className="home-story-subtitle">{story.subtitle}</p>
                    )}
                    
                    <div className="home-story-meta">
                      {story.published_at && (
                        <time dateTime={story.published_at}>
                          {new Date(story.published_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </time>
                      )}
                      {story.reading_time && (
                        <span>{story.reading_time} min</span>
                      )}
                      {story.view_count !== undefined && story.view_count > 0 && (
                        <span>{story.view_count.toLocaleString()} {story.view_count === 1 ? "view" : "views"}</span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
