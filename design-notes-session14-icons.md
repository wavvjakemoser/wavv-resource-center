# Existing Accelerator Icons (v2)

These are already generated and stored but NOT matching Academy style:
- acc-icon-live-v2.png: Phone with wifi signals (light blue on white bg) - flat sticker style
- acc-icon-training-v2.png: Laptop with graduation cap (dark blue/cyan on gray bg) - flat sticker style  
- acc-icon-recordings-v2.png: Play button with rewind circle and clock marks (white/green on gray bg) - flat sticker style

## What Academy tiles ACTUALLY look like:
Looking at the Academy page code, the thumbnails are:
- academy-compass-final-v2 (blue compass)
- academy-gear-final-v2 (cyan gear/crosshair)
- academy-target-final-v2 (green target)

These are rendered as FULL BACKGROUND images on the tile with:
- backgroundSize: "100% auto"
- backgroundPosition: "center center"
- opacity: 0.85
- Dark gradient overlay on left

## What Jake wants:
- NOT the "too AI" full-scene images currently used
- Match the Academy style: simple iconic symbol with radiating lines on dark/black background
- The icon should be on the right side, with lines coming off it, fading to black on left
- Left side of tile should be black (for text)

## Plan:
Generate 3 new icons on BLACK background (not gray/white) with:
1. Headphones (blue #0074F4) - for Live Call Events
2. Book/laptop (cyan #00A9E2) - for Product Training  
3. Play button (green #67C728) - for Previous Recordings

Style: clean geometric symbol, subtle radiating circuit/tech lines, on pure black background
Format: 1920x640 (wide banner aspect ratio to fill the tile properly)
