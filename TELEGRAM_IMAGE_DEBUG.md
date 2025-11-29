# Telegram Image Preview Debugging Guide

## Current Status
✅ Image URL: `https://bvoqwbaywqytmjxmzfzg.supabase.co/storage/v1/object/public/story-assets/story-images/5e941e4a-0529-45f5-9b8e-384cd3d71cda-1764005346332.png`
✅ Image is publicly accessible
✅ CORS headers are correct (`access-control-allow-origin: *`)
✅ Image size: 1200x630px (optimal for OG)
✅ Image type: PNG (6.7MB - **this might be too large!**)

## Possible Issues

### 1. Image File Size (MOST LIKELY)
**Problem:** Your image is 6.7MB, which is too large for Telegram's preview system.
**Solution:** Compress the image to under 5MB (preferably under 1MB)

### 2. Telegram Cache
**Problem:** Telegram caches previews aggressively
**Solution:** Clear cache using https://t.me/WebpageBot

## How to Fix

### Option 1: Compress Existing Images
```bash
# Use ImageMagick or similar
convert input.png -quality 85 -resize 1200x630 output.jpg
```

### Option 2: Auto-compress on Upload
Add image compression to your upload flow in the write page.

### Option 3: Use Next.js Image Optimization for OG
Serve a compressed version specifically for OG tags:
```typescript
const ogImageUrl = `${baseUrl}/_next/image?url=${encodeURIComponent(imageUrl)}&w=1200&q=75`
```

## Testing Steps

1. **Test with Telegram Bot:**
   - Go to https://t.me/WebpageBot
   - Send: `https://write.tykea.dev/story/caterpillar`
   - Bot will show preview and any errors

2. **Test with Facebook Debugger:**
   ```
   https://developers.facebook.com/tools/debug/
   ```
   Enter your URL and click "Scrape Again"

3. **Test with Open Graph Checker:**
   ```
   https://www.opengraph.xyz/
   https://www.bannerbear.com/tools/open-graph-checker/
   ```

4. **Check Meta Tags:**
   ```bash
   curl -s "https://write.tykea.dev/story/caterpillar" | grep -E 'og:image|twitter:image'
   ```

## Current Meta Tags (After Fix)

```html
<meta property="og:image" content="https://..." />
<meta property="og:image:secure_url" content="https://..." />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Caterpillar" />
<meta property="og:image:type" content="image/png" />
<meta property="og:type" content="article" />
<meta property="og:title" content="Caterpillar" />
<meta property="og:description" content="Wounds That Shape" />
<meta property="og:url" content="https://write.tykea.dev/story/caterpillar" />
<meta property="og:site_name" content="TK Stories" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://..." />
```

## Telegram Specific Requirements

1. ✅ Absolute URL (not relative)
2. ✅ HTTPS (secure)
3. ✅ Image dimensions at least 200x200px (ours is 1200x630)
4. ❌ **Image file size under 5MB** (ours is 6.7MB - FIX THIS!)
5. ✅ Publicly accessible (no auth)
6. ✅ Proper CORS headers
7. ✅ `og:title` present
8. ✅ `og:description` present
9. ✅ `og:image` present

## Quick Fix Commands

### Check image size on server:
```bash
curl -I "https://bvoqwbaywqytmjxmzfzg.supabase.co/storage/v1/object/public/story-assets/story-images/5e941e4a-0529-45f5-9b8e-384cd3d71cda-1764005346332.png" | grep content-length
```

### Use optimized image for OG tags:
Update `page.tsx` to serve compressed version for meta tags while keeping original for display.

## Recommendation

**IMPLEMENT IMAGE COMPRESSION ON UPLOAD**

Add this to your upload handler:
```typescript
import sharp from 'sharp'

// Compress image before upload
const compressedBuffer = await sharp(originalBuffer)
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 85 })
  .toBuffer()
```

This will ensure all future uploads are optimized for social sharing.
