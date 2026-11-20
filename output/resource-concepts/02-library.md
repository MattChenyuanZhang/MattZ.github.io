# Concept 02 — Research Library

## Source review
Reviewed resources.html and stylesheet.css without changing live source. This is a source-based evaluation, not a claim of browser or link testing.

- Useful topical grouping exists, but the page has no visible title or introduction and no h1. Visitors must infer its purpose from navigation.
- h3 headings are direct children of the ul rather than section headings outside lists. Use main, section, h1/h2 and semantic lists.
- Navigation is a div; active status is visual only. Use nav and aria-current.
- Every resource competes visually as a blue text link. Separate the title from quieter source metadata and short curator annotations so readers can choose deliberately.
- No topic anchors or search are provided; a library index would make revisiting a topic easier.
- The page requests Inter but body CSS specifies EB Garamond, which this page does not load. The intended typography is ambiguous.
- Visited links have the same appearance as unvisited links, so readers cannot distinguish previous destinations through color.
- The mobile navigation explicitly uses nowrap and horizontal scrolling. A wrapping navigation or compact menu would make all destinations visible.
- The two CS PhD advice links share the same title; keep author context inside each accessible link name and label PDF destinations.
- The source contains a large commented legacy page block, adding maintenance noise.

## Proposal
A white and cobalt research library with a persistent topic index, prominent Resources heading, compact searchable rows and concise editorial descriptions. Retain the real Matt Zhang navigation and existing resource titles. Keep source attribution visually subordinate and external/PDF indicators explicit. On mobile, convert the topic index to a labeled topic selector, stack metadata, and preserve a visible keyboard focus state. Search and annotations shown are proposed functionality/copy, not existing features.

## Deliverable
02-library.png — one generated desktop concept, built-in image_gen, ui-mockup.

## Generation prompt
Use case: ui-mockup
Asset type: high fidelity desktop website redesign proposal, flat screenshot 1536 by 1100, not a photograph.
Primary request: Design Matt Zhang's personal website Resources page as a modern research library. Extremely polished restrained Swiss sans-serif interface, generous white space, white background, near-black text, vivid cobalt blue accents, faint gray dividing lines. No cards, no gradients, no decorative hero illustration.
Composition: full browser viewport without browser chrome. Wide masthead at top: left "😃 Matt Zhang"; right navigation "Blog", "Projects", "Resources", "Writing" with Resources cobalt and underline. Content begins with small cobalt eyebrow "A PERSONAL LIBRARY", large confident heading "Resources", one-line introduction "Useful reading on learning, research, and doing meaningful work."
Below header: two-column layout, left 230px topic index with heading "BROWSE BY TOPIC" and links "All resources" active cobalt filled pale blue, "Undergrad / College Study", "Grad School", "Computer Science PhD", "Doing Great Work", "AI", "Cold Emails", "Finding a Job". Right large content column with refined search field "Search titles, authors, or topics", magnifier, subtle keyboard shortcut "/".
Main list heading "Undergrad / College Study", then elegant compact rows separated with faint rules; each has blue linked title, small gray author/source and one-line descriptive annotation, far-right external-arrow icon. Exact titles: "Doing well in your courses", author "Andrej Karpathy", annotation "Practical advice for making the most of your classes."; "Exam study guide", source "UC Berkeley CS 61B", annotation "A structured approach to preparing for technical exams."; "How to get good grades in Computer Science", source "r/csMajors", annotation "Study habits and strategies from fellow CS students."; "How to Make the Most of Your Professor's Office Hours", source "University of South Florida", annotation "Ask better questions and use office hours well."; "College tips, tricks and hacks", author "Matt Might", annotation "Small changes that make college work better."
Second visible section "Grad School" with row "HOWTO: Get into grad school for STEM", author "Matt Might". A slim rightmost metadata column can show "Article", "Guide", "Discussion" in subtle gray, no invented numbers or ratings. All typography clear and realistically sized, coherent vertical rhythm. Tiny bottom left sidebar note "Collected by Matt Zhang". Screenshot must look ready to implement, sober academic taste, high text accuracy.

