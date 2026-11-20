# 05 — Reading Room

Independent source review of resources.html and stylesheet.css. Image produced with the built-in image generation tool; proposed design, not an implemented or interaction-tested page.

## Findings

- No visible page title or introductory explanation; visitors meet the first category immediately.
- Category headings are direct children of a ul, rather than separate semantic sections containing lists. There is no h1 or h2 hierarchy.
- Twenty links span seven topics without topic navigation or search, making return visits dependent on scanning.
- The stylesheet requests EB Garamond but this page imports Inter, so its intended serif is not reliably loaded.
- Navigation relies on a 300px desktop margin and horizontal scrolling on mobile; narrow screens need explicit verification.
- Authors, destinations and file formats are inconsistently identified; the two identically titled PhD PDFs need clear author and format labels.
- Hover reduces navigation opacity and there is no explicit focus-visible style.

## Proposal

An optional dark reading mode in warm charcoal, ivory and amber. Retain the personal navigation, promote a clear Resources title, introduce topic anchors, group graduate-school subtopics under a shared parent, and separate linked titles from author/format metadata. Rows should be generous clickable targets with visible keyboard focus; external-link and PDF indicators should have accessible labels. Keep a light-mode option. Collapse topic navigation into a select or horizontally wrapping anchors on mobile. Search is optional for this small collection; topic anchors provide the greatest immediate benefit.

The mockup presents an excerpt, not the complete resource inventory. New introduction and metadata are proposed editorial additions. Contrast and responsive behavior require measurement in implementation.

## Exact image prompt

Use case: ui-mockup. Create one high fidelity desktop website redesign screenshot, landscape 1536 by 1024, for Matt Zhang's actual personal website Resources page. Direction: a calm dark academic reading room, beautifully readable typographic resource library, warm charcoal #20221f background, warm off-white #eee9dc text, subdued amber #d5b276 highlights, thin low contrast dividers. No photography, no illustration, no fabricated stats or ratings, no glossy dashboard cards. Top full-width restrained header inside 1160px wide content area: left "😃 Matt Zhang", right "Blog" "Projects" "Resources" "Writing", Resources amber underline. Spacious page title "Resources" in large refined editorial serif; short subtitle "A personal library for studying, research, and thoughtful work." Below, a narrow left topic rail headed "BROWSE TOPICS" in small sans caps, topics "College study", "Graduate school", "Great work", "AI", "Cold emails", "Finding a job"; active College study amber with simple short line. Main content right column ~800px wide has a discreet search field "Search resources" and a small outlined sun icon theme toggle. Main typography elegant readable serif titles with sans author/domain metadata. Main section "Undergrad / College Study" with a small "01" amber preceding; rows separated by thin lines, clear external-link arrows right. Real rows: "Doing well in your courses" metadata "Andrej Karpathy · Essay"; "Exam study guide" metadata "Berkeley CS 61B · Guide"; "How to get good grades in Computer Science" metadata "Reddit · Discussion"; "How to Make the Most of Your Professor’s Office Hours" metadata "University of South Florida · Article"; "College tips, tricks and hacks" metadata "Matt Might · Essay". Next section visible "Graduate School" with rows "HOWTO: Get into grad school for STEM" metadata "Matt Might · Guide"; "Advice for applying to CS PhD" metadata "Justin Sherry · PDF"; "A Survival Guide to a PhD" metadata "Andrej Karpathy · Essay". Excellent contrast, large hit areas, perfectly aligned grid, breathing room without huge empty hero, understated scholarly elegance. View is flat screen capture with crisp legible real UI text, no device mockup or browser chrome.
