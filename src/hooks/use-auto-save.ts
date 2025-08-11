"use client"

import { useEffect, useState, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import { useStory } from './use-story'
import throttle from 'lodash.throttle'

interface UseAutoSaveProps {
  editor: Editor | null
  storyId?: string
  enabled?: boolean
  delay?: number
}

export function useAutoSave({ 
  editor, 
  storyId, 
  enabled = true, 
  delay = 2000 
}: UseAutoSaveProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { saveStory } = useStory(storyId)

  const save = useCallback(async () => {
    if (!editor || !storyId || !enabled) return

    setIsSaving(true)
    try {
      const content = editor.getJSON()
      await saveStory({ content })
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [editor, storyId, enabled, saveStory])

  const throttledSave = useCallback(
    throttle(save, delay, { leading: false, trailing: true }),
    [save, delay]
  )

  useEffect(() => {
    if (!editor || !enabled) return

    const handleUpdate = () => {
      setHasUnsavedChanges(true)
      throttledSave()
    }

    editor.on('update', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
      throttledSave.cancel()
    }
  }, [editor, enabled, throttledSave])

  // Save on page unload
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled, hasUnsavedChanges])

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    save: () => save(),
  }
}