# How to Clear Telegram Cache for Link Previews

## The Problem
Telegram caches link previews aggressively. If you shared a link before the image metadata was fixed, Telegram will continue showing the old (broken) preview even after you've fixed the issue.

## Solution: Force Telegram to Re-Crawl

### Method 1: Use @WebpageBot ⭐ RECOMMENDED

1. Open Telegram
2. Search for `@WebpageBot` (official Telegram bot)
3. Start a chat with the bot
4. Send your URL: `https://write.tykea.dev/story/caterpillar`
5. The bot will:
   - Show you the current preview
   - Clear the cache
   - Show you the new preview with the image!

### Method 2: Add a Query Parameter

Share the link with a cache-busting parameter:
```
https://write.tykea.dev/story/caterpillar?v=2
```

The `?v=2` makes Telegram think it's a new URL and re-crawl it.

### Method 3: Edit and Re-send the Message

1. Edit your Telegram message with the link
2. Add a space or emoji
3. Telegram will re-crawl the link
4. Remove the space/emoji if you want

### Method 4: Share in a New Chat

The cache is per-URL but Telegram sometimes re-crawls if shared in a different chat or channel.

## Verification

After clearing the cache, the preview should show:
- ✅ Image preview (compressed from 6.7MB to ~450KB)
- ✅ Title: "Caterpillar"  
- ✅ Description: "Wounds That Shape"
- ✅ Site name: "TK Stories"

## Why This Happens

1. **First share**: Telegram crawls the URL and caches the preview
2. **You fix the metadata**: Your site now has correct OG images
3. **Telegram doesn't know**: It still serves the old cached version
4. **Solution**: Force Telegram to re-crawl using one of the methods above

## Technical Details

Current OG Image URL (after fix):
```
https://write.tykea.dev/_next/image?url=https%3A%2F%2Fbvoqwbaywqytmjxmzfzg.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fstory-assets%2Fstory-images%2F5e941e4a-0529-45f5-9b8e-384cd3d71cda-1764437055279.png&w=1200&q=75
```

- Original size: 6.7MB ❌
- Optimized size: 456KB ✅
- Format: PNG
- Dimensions: 1200x630 (optimal for social sharing)

## Other Stories Working

These stories show images correctly because they were shared AFTER the fix:
- ✅ "Stay or Sway"
- ✅ "This article will be suck but I'll publish it anyway"
- ✅ "Another month passed"

## Need Help?

If @WebpageBot doesn't work, contact Telegram support or wait 24-48 hours for the cache to expire naturally.
