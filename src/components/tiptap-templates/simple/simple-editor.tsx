"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { useStory } from "@/hooks/use-story"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useThrottledCallback } from "@/hooks/use-throttled-callback"
import { useRouter, useSearchParams } from "next/navigation"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"
import { PublishModal } from "@/components/publish/publish-modal"
import "@/components/publish/publish-modal.scss"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import content from "@/components/tiptap-templates/simple/data/content.json"

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  onPublishClick,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  onPublishClick: () => void
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton />
      </ToolbarGroup>

      <Spacer />

      {/* Theme toggle and Publish button */}
      <ToolbarGroup>
        <ThemeToggle />
        <Button 
          onClick={onPublishClick} 
          data-style="default" 
          className="publish-toolbar-btn"
        >
          Publish
        </Button>
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

interface SimpleEditorProps {
  storyId?: string
  onStoryChange?: (story: any) => void
}

export function SimpleEditor({ storyId, onStoryChange }: SimpleEditorProps) {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  
  // Story management
  const { story, loading, createStory, saveStory } = useStory(storyId)
  const [currentStoryId, setCurrentStoryId] = React.useState(storyId)
  const [storyCreated, setStoryCreated] = React.useState(false)
  
  // Title state
  const [title, setTitle] = React.useState("")
  const [titleSaving, setTitleSaving] = React.useState(false)

  // Update title when story loads
  React.useEffect(() => {
    if (story?.title) {
      setTitle(story.title)
    }
  }, [story?.title])

  // Throttled title save function
  const saveTitle = React.useCallback(async (newTitle: string) => {
    if (!currentStoryId || !newTitle.trim()) return
    
    setTitleSaving(true)
    try {
      await saveStory({ title: newTitle.trim() })
    } catch (error) {
      console.error('Failed to save title:', error)
    } finally {
      setTitleSaving(false)
    }
  }, [currentStoryId, saveStory])

  const throttledSaveTitle = useThrottledCallback(saveTitle, 1000)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (newTitle.trim()) {
      throttledSaveTitle(newTitle)
    }
  }

  // Initialize content - empty for new stories, actual content for existing stories
  const initialContent = React.useMemo(() => {
    if (story?.content) {
      return story.content
    }
    // Start with empty content for new stories
    return { type: "doc", content: [{ type: "paragraph" }] }
  }, [story?.content])

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: initialContent,
  })

  // Auto-save functionality
  const { isSaving, lastSaved, hasUnsavedChanges } = useAutoSave({
    editor,
    storyId: currentStoryId,
    enabled: !!currentStoryId,
  })

  // Update editor content when story loads
  React.useEffect(() => {
    if (editor && story?.content && editor.getJSON() !== story.content) {
      // Defer the content update to avoid flushSync during render
      queueMicrotask(() => {
        editor.commands.setContent(story.content)
      })
    }
  }, [editor, story?.content])

  // Create new story if none provided (only once)
  React.useEffect(() => {
    if (!storyId && !loading && !currentStoryId && !storyCreated) {
      setStoryCreated(true)
      createStory({
        title: 'Untitled Story',
        content: { type: "doc", content: [{ type: "paragraph" }] }, // Empty content
      }).then((newStory) => {
        setCurrentStoryId(newStory.id)
        if (onStoryChange) {
          onStoryChange(newStory)
        }
      }).catch(console.error)
    }
  }, [storyId, loading, currentStoryId, createStory, onStoryChange, storyCreated])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  // Publish modal state
  const [isPublishModalOpen, setIsPublishModalOpen] = React.useState(false)

  const handlePublish = async (options: any) => {
    if (!currentStoryId) {
      alert('No story to publish. Please save your story first.')
      return
    }
    
    console.log('Publishing with options:', options) // Debug log
    
    try {
      // Save the current content first
      const currentContent = editor?.getJSON()
      if (currentContent) {
        await saveStory({ content: currentContent })
      }

      // Update the story with publishing information
      const publishData = {
        subtitle: options.subtitle,
        preview_image: options.previewImage,
        reading_time: options.readingTime,
        published: true,
        published_at: new Date().toISOString(),
      }
      
      console.log('Saving publish data:', publishData) // Debug log
      
      const result = await saveStory(publishData)
      console.log('Save result:', result) // Debug log
      
      alert('🎉 Story published successfully!')
    } catch (error) {
      console.error('Failed to publish story:', error)
      alert('❌ Failed to publish story. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="simple-editor-wrapper">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading story...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {/* Save status indicator */}
          <div className="save-status-indicator">
            {(isSaving || titleSaving) && <span>Saving...</span>}
            {!isSaving && !titleSaving && hasUnsavedChanges && <span>Unsaved changes</span>}
            {!isSaving && !titleSaving && !hasUnsavedChanges && lastSaved && (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>

          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              onPublishClick={() => setIsPublishModalOpen(true)}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <div className="simple-editor-content">
          {/* Story Title */}
          <div className="story-title-container">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Story"
              className="story-title-input"
              spellCheck={false}
            />
          </div>
          
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-prosemirror-container"
          />
        </div>
      </EditorContext.Provider>

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        story={{ 
          title, 
          content: editor?.getJSON(),
          id: currentStoryId || '' 
        }}
        onPublish={handlePublish}
      />
    </div>
  )
}
