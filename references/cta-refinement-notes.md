# CTA Refinement Implementation Notes

## Sign In Button (matches top-right corner in PortalLayout lines 378-392)
- Solid blue `#0074F4`, hover `#0060d4`
- `px-3 py-1.5`, `rounded-lg`, `text-sm font-medium`
- White text, no outline/border

## Accelerator Changes Needed:
1. **Locked cards blur**: Lines 455-479 only use `opacity: 0.55`. Need to add CSS blur filter (e.g., `filter: blur(4px)`) and pointer-events-none to make content truly unreadable.
2. **Hero CTA state logic** (lines 303-331):
   - `reason === "unauthenticated"`: Show "Become a WAVV Accelerator Member" (ORANGE, not blue) + "Sign In" (solid blue like top-right)
   - `reason === "no_access"`: Show only "Upgrade Your Plan" (orange)
   - `hasAccess === true`: Show nothing
3. **UpgradeCTA component** (lines 167-211): The unauthenticated branch uses blue gradient — change to orange. The Sign In button should match the top-right style (solid blue #0074F4).
4. **Sticky bar** (lines 693-710): Change copy to "Available on Quarterly and Annual Plans" (informational only). Remove the UpgradeCTA button from sticky bar.
5. **Partnership section** (lines 536-568): WAVV side has only logo (no h3 title), POD side has logo + h3 "Prospecting On Demand". Add h3 title to WAVV side to match alignment.

## Partners Changes Needed:
1. **Hero CTA state logic** (lines 302-328):
   - `reason === "unauthenticated"`: Show "Become a WAVV Partner" (blue) + "Sign In" (solid blue like top-right)
   - `reason === "no_access"`: Hide aggressive CTAs (no "Become a Partner" staring at them)
   - `hasAccess === true`: Show nothing
2. **Bottom CTA** (lines 447-493): Only show for unauthenticated users. Hide for signed-in-not-approved (too aggressive).
3. **Sticky bar** (lines 495-514): Change `fixed` to `sticky`. Only show for unauthenticated. Hide for signed-in-not-approved.
4. **Pop-up** (lines 518-554): Already correct — fires once for no_access, has Apply Now + Close.
