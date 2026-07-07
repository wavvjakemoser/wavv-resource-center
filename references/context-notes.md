# Context Notes

## POD Logo
- Uploaded: `/manus-storage/pod_logo_d9f904c3.webp`
- Source: https://prospectingondemand.com/

## Chrome Extension
- Real URL: https://chromewebstore.google.com/detail/wavv-power-dialer/ldaokgmcclbfnhfmhmhpiekfpgdmcpfi

## Hero Heights
- All pages standardized to minHeight: "280px" (Academy, Webinars, GuidesAndDocs, Accelerator)

## Partner Page Gating Logic
- Same pattern as Accelerator
- Unlocked for: approved employees (any role) + partner_manager role
- Locked for: everyone else
- CTA: "Apply Now" (links to wavv.com/partners) or "Sign In" (for unauthenticated)
- Existing Partners page already exists with marketing content — needs gating layer added on top
- Existing page links to wavv.com/partner-program for applications
- Existing page links to wavv.firstpromoter.com/login for existing partners

## Current Task
- Remove W mark from clock: DONE
- Shrink clock: DONE
- Standardize heroes: DONE
- Partner page: needs gating layer (usePartnerAccess hook + preview toggle + PartnerHub unlocked view)
