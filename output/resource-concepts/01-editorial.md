# 01 — Editorial reading room

Source review of resources.html and stylesheet.css; no site edits.

Findings:
- The rendered page has no h1, introduction, main landmark or semantic nav. All section h3 elements are direct children of ul, which is invalid list structure and makes the hierarchy less useful to assistive technology.
- Seven topic groups have no jump navigation, so later categories require scanning the whole page.
- Resource titles are mixed with author links, and PDF links do not identify their file format.
- Resources loads Inter but body asks for EB Garamond without importing it; actual typography depends on installed fonts.
- Visited links have the same styling as new links. Navigation hover reduces opacity to .4, weakening readability.
- Mobile nav deliberately stays on one horizontally scrolling line; a wrapping or collapsible treatment would expose all destinations.

Proposal:
Warm ivory paper, bookish serif, blue underlined links, a quiet page title, left-hand topic index, semantic category sections, restrained numbered headings, source metadata and PDF labels. Preserve the personal academic feeling and all original content. Add one-sentence annotations only after owner review: descriptions in the concept are illustrative, not verified summaries. Collapse the topic index into a compact jump menu on mobile; use visible keyboard focus and aria-current on Resources.

Generated using built-in image_gen; exactly one image. Image inspected: requested title/nav, ivory/blue palette, readable list hierarchy and topic index are present. This is a visual proposal, not an implemented or interaction-tested interface.

## Prompt

Use case: ui-mockup. Create exactly one high fidelity desktop screenshot of a redesigned personal academic website Resources page for Matt Zhang. Restrained editorial library aesthetic, warm ivory background #faf8f2, black charcoal typography, beautiful bookish serif headings and body, muted navy blue underlined resource links, thin rules. Browser viewport composition 1440x1100, no browser chrome, no perspective, real flat website design. Header at top with Matt Zhang on left, Blog Projects Resources Writing on right, active Resources underlined. Generous margins, center content max 1000px. Large serif title Resources, subtitle A growing collection of things worth reading. Under that a fine divider. Two-column layout: narrow left anchored table of contents with uppercase small label ON THIS PAGE and categories College study, Graduate school, Doing great work, AI, Cold emails, Finding a job. Main wide column displays editorial list of links with brief one-line contextual descriptions in smaller dark grey. No cards, no stock images, no gradients, no big decorative graphics. Main heading College & study with 01 in left margin; blue links Doing well in your courses / Andrej Karpathy, Exam study guide / Berkeley CS 61B, College tips, tricks and hacks / Matt Might. Second heading Graduate school with 02, blue links HOWTO: Get into grad school for STEM / Matt Might, Advice for applying to CS PhD / Justine Sherry with small PDF label, A Survival Guide to a PhD / Andrej Karpathy. Third section Doing great work with 03, blue links How to do Great Work / Paul Graham, You and Your Research / Richard Hamming. Crisp readable typography, subtle source metadata after each title, ample line height, extraordinary restrained web design. Small italic note in left sidebar: Collected over time. Shared in the hope they help. All text precisely spelled, aesthetically balanced, sophisticated personal not corporate.

