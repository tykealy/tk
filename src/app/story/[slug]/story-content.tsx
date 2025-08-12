'use client'

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
import HorizontalRule from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'
import { useEffect, useState } from 'react'

export function StoryContent({ content }: { content: any }) {
  const [htmlContent, setHtmlContent] = useState('')

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const html = generateHTML(content, [
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
        HorizontalRule,
      ])
      setHtmlContent(html)
    }
  }, [content])

  if (!htmlContent) {
    return <div className="minimal-prose">Loading content...</div>
  }

  return (
    <div 
      className="minimal-prose"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
