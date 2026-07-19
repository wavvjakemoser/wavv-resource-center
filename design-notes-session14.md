# Session 14 Design Notes

## Tile Icon Requirements
- Current AI-generated banner images are "too AI" - need to be replaced
- Must match Academy tile style: simple iconic symbol on right side with radiating lines, fading to black on left
- Academy examples: compass icon (blue), crosshair/gear icon (cyan), target icon (green)
- Each icon is a clean geometric symbol with subtle circuit/tech lines radiating from it
- Background is pure black, icon sits centered-right with ~0.85 opacity
- Dark gradient overlay on left ensures text legibility

## Three Icons Needed:
1. **Live Call Events** (blue #0074F4): Headphones icon (like WAVV logo headphones)
2. **Product Training** (cyan #00A9E2): Book/laptop/screen icon for learning
3. **Previous Recordings** (green #67C728): Play button icon

## Style Reference (from Academy tiles):
- backgroundSize: "100% auto"
- backgroundPosition: "center center"  
- opacity: 0.85
- Dark gradient overlay: linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)

## Current BANNER_ICONS in AcceleratorSession.tsx (lines ~370-381):
```
const BANNER_ICONS: Record<string, string> = {
  live: "/manus-storage/accel-live-call-banner_c2d1a8e7.png",
  training: "/manus-storage/accel-product-training-banner_f4e9b2c1.png",
  recordings: "/manus-storage/accel-recordings-banner_a7d3e5f9.png",
};
```

## Also completed this session:
- [x] Flip clock digits changed to white (#ffffff)
- [x] Removed "On-demand — start any session, any time" text from member view
- [ ] Still need to generate new tile icons
