import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
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
import './page.scss'

// Import custom extensions (you may need to adjust these for server-side)
import HorizontalRule from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'
import { ThemeToggleClient } from '@/app/story/[slug]/theme-toggle-client' // We'll create this
import { StoryContent } from './story-content'

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
  user_id: string | null
  created_at: string
  updated_at: string
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  console.log('generateMetadata called')
  const { slug } = await params
  console.log('Processing slug:', slug)
  
  const story = await getStory(slug)
  console.log('Story found:', !!story, story?.title)
  
  if (!story) {
    console.log('No story found, returning 404 metadata')
    return {
      title: 'Story Not Found',
      description: 'The requested story could not be found.'
    }
  }
  
  const excerpt = story.subtitle || extractTextFromContent(story.content).substring(0, 160)
  const publishedDate = new Date(story.published_at).toISOString()
  
  console.log('Generating metadata for:', story.title)
  
  return {
    title: story.title,
    description: excerpt,
    keywords: [story.title.split(' '), 'story', 'article', 'blog'].flat(),
    authors: [{ name: 'TK Stories Author' }],
    openGraph: {
      type: 'article',
      title: story.title,
      description: excerpt,
      url: `/story/${story.slug}`,
      publishedTime: publishedDate,
      images: story.preview_image ? [
        {
          url: story.preview_image,
          width: 1200,
          height: 630,
          alt: story.title
        }
      ] : [],
      authors: ['TK Stories'],
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: excerpt,
      images: story.preview_image ? [story.preview_image] : [],
    },
    alternates: {
      canonical: `/story/${story.slug}`,
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
function generateArticleStructuredData(story: Story) {
  const readingTime = story.reading_time || calculateReadingTime(story.content)
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.subtitle || extractTextFromContent(story.content).substring(0, 160),
    image: story.preview_image ? [story.preview_image] : [],
    author: {
      '@type': 'Organization',
      name: 'TK Stories'
    },
    publisher: {
      '@type': 'Organization',
      name: 'TK Stories',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png` // You'll need to create this
      }
    },
    datePublished: story.published_at,
    dateModified: story.updated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_BASE_URL}/story/${story.slug}`
    },
    wordCount: extractTextFromContent(story.content).split(/\s+/).length,
    timeRequired: `PT${readingTime}M`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/story/${story.slug}`
  }
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const story = await getStory(slug)
  
  if (!story) {
    notFound()
  }
  
  const readingTime = story.reading_time || calculateReadingTime(story.content)
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateArticleStructuredData(story))
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
              <span className="minimal-reading-time">{readingTime} min read</span>
            </div>

            {story.preview_image && (
              <div className="minimal-image">
                <img 
                  src={story.preview_image} 
                  alt={story.title}
                  width={800}
                  height={400}
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
