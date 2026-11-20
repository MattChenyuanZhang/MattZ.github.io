# 09 — Academic directory

Independent source review of resources.html and stylesheet.css; no live browser testing performed.

## Findings
- Useful real collection: 18 resources across seven topics, kept light and directly accessible.
- No visible page title or introduction; the first heading begins at h3. This weakens orientation and the heading outline.
- Headings are direct children of a ul, which should contain list items. Use separate sections with h2 headings and lists.
- Author treatment is inconsistent: some authors have separate homepage links, others share the resource link, and some entries omit attribution. Repeated identical PhD titles need author-first scanning.
- Two local PDFs and archived links have no format/source indication. Readers cannot anticipate the destination.
- No contents links; reaching later categories requires scanning the whole page.
- CSS requests EB Garamond but resources.html loads Inter; the intended serif is not loaded here.
- Mobile navigation explicitly prevents wrapping and allows horizontal scrolling; the later links can fall outside the initial view.

## Proposal
Keep the personable Matt Zhang navigation. Add a modest Resources heading and one-line description, followed by an in-page contents index. Use navy-and-white academic styling and bibliography-like author-first entries, with understated PDF labels and underlined titles. Two balanced desktop columns improve overview; collapse into a single reading column on mobile with wrapping navigation. Keep all original destinations and resources in implementation; the mockup depicts a viewport selection rather than replacement content. No elaborate imagery or oversized hero is needed.

## Image
09-academic.png — built-in image_gen, one generation. Visual concept only; labels are proposed UI and generated text needs verification before implementation.

## Prompt
Use case: ui-mockup. Create ONE high fidelity desktop website redesign mockup, 1536x1024 landscape. A restrained academic reading directory for Matt Zhang, traditional university navy and white, elegant small serif typography, clean precise readable real text. Flat website screenshot, no browser frame. Center content about 1000px wide. Header top: 😃 Matt Zhang at left; Blog Projects Resources Writing at right with Resources underlined. Thin navy divider, no shadows. Title 'Resources' in 34px serif, beneath 'A personal collection of advice, essays, and useful guides.' Compact pale blue contents strip below, title 'CONTENTS' and wrapped text links 'College study · Graduate school · Great work · AI · Cold emails · Finding a job'. Main bibliography layout uses two columns, generous central gutter, restrained 24px navy section titles and slim horizontal rules. Left column section 'College study' with author-first entries: 'Andrej Karpathy' in bold small sans, then underlined navy title 'Doing well in your courses'; 'CS 61B' / 'Exam study guide'; 'Matt Might' / 'College tips, tricks and hacks'; 'University of South Florida' / 'Making the most of office hours'. Then 'Graduate school' entries 'Matt Might' / 'Get into grad school for STEM'; 'Justin Sherry' / 'Advice for applying to CS PhD' and small outlined PDF tag; 'Mor Harchol-Balter' / 'Advice for applying to CS PhD' and PDF; 'Andrej Karpathy' / 'A Survival Guide to a PhD'. Right column section 'Great work' entries 'Paul Graham' / 'How to Do Great Work'; 'Richard Hamming' / 'You and Your Research'; 'Eric S. Raymond' / 'Become a Hacker'; then smaller section 'AI' / 'The Machines Are Fine'; 'Cold emails' / 'How to Write Cold Emails to Well-Known People' / 'Tips and Tactics for Emailing Enterprise Buyers'; 'Finding a job' / 'UMich’s Recruiting Playbook'. Compact 17px reading typography. White background, ink navy headings, gray author text, subtle fine gray rules, no cards, no illustrations, no giant hero, no gradients, no search or fabricated counts. A scholarly personal website that feels credible and usable. Show whole composition cleanly with breathing room.
