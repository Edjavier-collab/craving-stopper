# Icon Generation Instructions

This app uses a custom SVG icon located at `/public/icon.svg`.

## To generate PNG icons for production:

### Option 1: Using online converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `/public/icon.svg`
3. Generate 192x192 PNG and save as `icon-192.png`
4. Generate 512x512 PNG and save as `icon-512.png`
5. Place both files in `/public/` folder

### Option 2: Using ImageMagick (if installed)
```bash
# Install ImageMagick first if not available
# On macOS: brew install imagemagick
# On Ubuntu: sudo apt-get install imagemagick

# Generate icons
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
```

### Option 3: Using Node.js (install sharp)
```bash
npm install --save-dev sharp
# Then run a script to convert SVG to PNG
```

## Temporary Fallback
For development, the app will fallback to `/vite.svg` if the PNG icons don't exist.