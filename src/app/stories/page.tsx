"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useStories } from "@/hooks/use-story"
import { SimpleAuthGuard } from "@/components/auth/simple-auth-guard"
import "./stories.scss"

function StoriesPageContent() {
  const { stories, loading } = useStories()

  if (loading) {
    return (
      <div className="stories-container">
        <div className="stories-content">
          <div className="stories-loading">
            Loading your stories...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="stories-container">
      <nav className="stories-nav">
        <Link href="/write" className="stories-nav-write">
          Write
        </Link>
        <ThemeToggle />
      </nav>

      <div className="stories-content">
        <header className="stories-header">
          <h1 className="stories-title">Your Stories</h1>
        </header>

        {stories.length === 0 ? (
          <div className="stories-empty">
            <p>No stories yet</p>
            <Link href="/write">Write your first one</Link>
          </div>
        ) : (
          <div className="stories-list">
            {stories.map((story) => (
              <Link 
                key={story.id} 
                href={`/write?id=${story.id}`} 
                className="stories-item"
              >
                <div className="stories-item-content">
                  {story.preview_image && (
                    <div className="stories-item-image">
                      <img 
                        src={story.preview_image} 
                        alt={story.title}
                      />
                    </div>
                  )}
                  
                  <div className="stories-item-details">
                    <h2 className="stories-item-title">{story.title}</h2>
                    
                    {story.subtitle && (
                      <p className="stories-item-subtitle">{story.subtitle}</p>
                    )}
                    
                    <div className="stories-item-meta">
                      <span className={`stories-status-badge ${story.published ? "published" : "draft"}`}>
                        {story.published ? "Published" : "Draft"}
                      </span>
                      
                      <time dateTime={story.updated_at}>
                        {new Date(story.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </time>
                      
                      {story.reading_time && (
                        <span>{story.reading_time} min</span>
                      )}
                      
                      {story.view_count !== undefined && story.view_count > 0 && (
                        <span>{story.view_count.toLocaleString()} {story.view_count === 1 ? "view" : "views"}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
