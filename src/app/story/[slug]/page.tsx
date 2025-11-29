import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import './page.scss'

import { ThemeToggleClient } from '@/app/story/[slug]/theme-toggle-client'
import { StoryContent } from './story-content'
import { ViewTracker } from './view-tracker'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Story = {
  id: string
  title: string
  content: any
  subtitle?: string
  preview_image?: string
  slug: string
  published: boolean
  published_at: string
  reading_time?: number
  view_count?: number
  user_id: string | null
  created_at: string
  updated_at: string
}

type Author = {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
}

async function getStory(slug: string): Promise<Story | null> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) return null
    return data
  } catch {
    return null
  }
}

async function getAuthor(userId: string | null): Promise<Author | null> {
  if (!userId) return null
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .eq('id', userId)
      .single()

    if (error) return null
    return data
  } catch {
    return null
  }
}

function extractTextFromContent(content: any): string {
  if (!content) return ''
  
  function extractFromNode(node: any): string {
    let text = ''
    if (node.text) {
      text += node.text
    }
    if (node.content) {
      for (const child of node.content) {
        text += extractFromNode(child)
      }
    }
    return text
  }
  
  return extractFromNode(content)
}

function extractSmartDescription(content: any, subtitle?: string, maxLength: number = 160): string {
  // Use subtitle if available
  if (subtitle && subtitle.trim()) {
    return subtitle.length > maxLength 
      ? subtitle.substring(0, maxLength - 3) + '...' 
      : subtitle
  }

  const fullText = extractTextFromContent(content).trim()
  if (!fullText) return 'Read this story on TK Stories.'

  // Try to extract first complete paragraph
  const paragraphs = fullText.split(/\n\n+/)
  const firstParagraph = paragraphs[0]?.trim() || ''

  if (firstParagraph.length <= maxLength) {
    return firstParagraph
  }

  // Find last complete sentence within maxLength
  const truncated = firstParagraph.substring(0, maxLength)
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  )

  if (lastSentenceEnd > 60) {
    // If we found a sentence ending and it's not too short
    return truncated.substring(0, lastSentenceEnd + 1)
  }

  // Fall back to word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) {
    return 'http://localhost:3000'
  }
  // Ensure it starts with http:// or https://
  return baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const story = await getStory(slug)
  
  if (!story) {
    console.log('No story found, returning 404 metadata')
    return {
      title: 'Story Not Found',
      description: 'The requested story could not be found.'
    }
  }

  // Fetch author information
  const author = await getAuthor(story.user_id)
  const authorName = author?.full_name || author?.email || 'TK Stories Author'
  
  const baseDescription = extractSmartDescription(story.content, story.subtitle)
  // Add view count to description if available
  const description = story.view_count && story.view_count > 0 
    ? `${baseDescription} • ${story.view_count.toLocaleString()} ${story.view_count === 1 ? 'view' : 'views'}`
    : baseDescription
  const publishedDate = new Date(story.published_at).toISOString()
  const baseUrl = getBaseUrl()
  const canonicalUrl = `${baseUrl}/story/${story.slug}`
  
  // Ensure image URL is absolute (important for Telegram and other platforms)
  let imageUrl = story.preview_image 
    ? (story.preview_image.startsWith('http') ? story.preview_image : `${baseUrl}${story.preview_image}`)
    : `${baseUrl}/og-image.jpg`
  
  // CRITICAL FIX FOR TELEGRAM: Use Next.js Image Optimization to compress large images
  // This creates a smaller, optimized version specifically for social media previews
  // Telegram has file size limits (~5MB) and the original image is 6.7MB
  if (story.preview_image && story.preview_image.startsWith('http')) {
    // Create an optimized version using Next.js image optimization
    // This will compress the image and reduce file size for better Telegram compatibility
    imageUrl = `${baseUrl}/_next/image?url=${encodeURIComponent(story.preview_image)}&w=1200&q=75`
  }
  
  // Detect image type from URL extension
  const getImageType = (url: string): string => {
    const ext = url.split('.').pop()?.toLowerCase()
    const typeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    }
    return typeMap[ext || ''] || 'image/jpeg'
  }
  
  const imageType = getImageType(imageUrl)
  
  return {
    title: story.title,
    description: description,
    authors: [{ name: authorName }],
    openGraph: {
      type: 'article',
      title: story.title,
      description: description,
      url: canonicalUrl,
      siteName: 'TK Stories',
      locale: 'en_US',
      publishedTime: publishedDate,
      modifiedTime: new Date(story.updated_at).toISOString(),
      authors: [authorName],
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl, // Telegram specifically looks for this
          width: 1200,
          height: 630,
          alt: story.title,
          type: imageType,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: description,
      images: [imageUrl],
      creator: authorName,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      ...(story.view_count && story.view_count > 0 && {
        'article:view_count': story.view_count.toString(),
        'analytics:views': story.view_count.toString(),
      })
    }
  }
}

function calculateReadingTime(content: any): number {
  if (!content) return 0
  const text = extractTextFromContent(content)
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// JSON-LD structured data
function generateArticleStructuredData(story: Story, author: Author | null) {
  const readingTime = story.reading_time || calculateReadingTime(story.content)
  const baseUrl = getBaseUrl()
  const authorName = author?.full_name || author?.email || 'TK Stories'
  
  // Ensure image URL is absolute
  const imageUrl = story.preview_image 
    ? (story.preview_image.startsWith('http') ? story.preview_image : `${baseUrl}${story.preview_image}`)
    : `${baseUrl}/og-image.jpg`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: extractSmartDescription(story.content, story.subtitle),
    image: [imageUrl],
    author: {
      '@type': author?.full_name ? 'Person' : 'Organization',
      name: authorName,
      ...(author?.avatar_url && { image: author.avatar_url }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'TK Stories',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    datePublished: story.published_at,
    dateModified: story.updated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/story/${story.slug}`
    },
    wordCount: extractTextFromContent(story.content).split(/\s+/).length,
    timeRequired: `PT${readingTime}M`,
    url: `${baseUrl}/story/${story.slug}`,
    ...(story.view_count && story.view_count > 0 && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ReadAction',
        userInteractionCount: story.view_count
      }
    })
  }
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const story = await getStory(slug)
  
  if (!story) {
    notFound()
  }

  // Fetch author information
  const author = await getAuthor(story.user_id)
  const authorName = author?.full_name || author?.email || 'TK'
  
  const readingTime = story.reading_time || calculateReadingTime(story.content)
  
  return (
    <>
      <ViewTracker storyId={story.id} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateArticleStructuredData(story, author))
        }}
      />
      
      <div className="minimal-container">
        <div className="minimal-theme-toggle">
          <ThemeToggleClient />
        </div>
        
        <article className="minimal-story">
          <header className="minimal-header">
            <h1 className="minimal-title">{story.title}</h1>
            
            {story.subtitle && (
              <h2 className="minimal-subtitle">{story.subtitle}</h2>
            )}

            <div className="minimal-meta">
              <time 
                className="minimal-date"
                dateTime={story.published_at}
              >
                {new Date(story.published_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
              <span className="minimal-separator">·</span>
              <span className="minimal-reading-time">{readingTime} min read</span>
              {story.view_count !== undefined && story.view_count > 0 && (
                <>
                  <span className="minimal-separator">·</span>
                  <span className="minimal-views">{story.view_count.toLocaleString()} {story.view_count === 1 ? 'view' : 'views'}</span>
                </>
              )}
              <span className="minimal-separator">·</span>
              <span className="minimal-author" rel="author">{authorName}</span>
            </div>

            {story.preview_image && (
              <div className="minimal-image">
                <Image 
                  src={story.preview_image} 
                  alt={story.title}
                  width={1200}
                  height={630}
                  priority
                  quality={90}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
          </header>

          <main className="minimal-content">
            <StoryContent content={story.content} />
          </main>
        </article>
      </div>
    </>
  )
}
