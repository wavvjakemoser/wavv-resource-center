# Loom Embed Research Notes

## Key Finding: Loom `t=` parameter is BROKEN
- Jira bug LOOM-930 (filed 1 week ago, unresolved, Priority High): https://jira.atlassian.com/browse/LOOM-930
- The `t=` start-time parameter is silently ignored in embedded Loom videos
- Videos always play from 0:00 regardless of the `t` parameter
- No known workaround exists per Atlassian

## Loom Embed SDK
- https://dev.loom.com/docs/embed-sdk/api
- The SDK only provides oembed/linkReplace/textReplace methods
- NO player control API (no play/pause/seek/getCurrentTime)
- NO postMessage API for controlling embedded Loom players
- Cannot programmatically get or set playback position

## Conclusion
For Loom embeds, there is NO way to:
1. Resume from a specific time (t= param broken)
2. Track current playback position (no API)
3. Programmatically control the player (no SDK methods)

## Solution: Persistent iframe approach
The ONLY way to maintain playback continuity is to keep the SAME iframe alive
and just move it visually between the modal view and the floating PIP view.
This means:
- One iframe element, created when video starts
- Modal view = iframe positioned in a centered overlay
- Floating view = iframe positioned in bottom-right corner
- Transitions just change CSS positioning/sizing, never destroy the iframe
- Video never stops, never reloads
