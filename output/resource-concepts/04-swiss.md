# 04 — Swiss typographic index

Independent source review of resources.html and stylesheet.css.

## Findings
- No visible page-level heading or introduction: the page starts at a third-level category heading.
- Headings are direct children of a ul rather than list items, and heading levels start at h3; fix the document structure.
- The page loads Inter but the stylesheet requests EB Garamond without loading it, making typography dependent on installed fonts.
- Eighteen links across seven topics have no category jumps, resource format labels, or consistent author treatment. Two CS PhD documents share the same title, so author metadata is especially useful.
- The navigation uses a 300px margin and changes to horizontal scrolling on mobile; verify narrow widths and use a responsive layout.
- Source contains extensive commented-out duplicate page content, increasing maintenance friction.

## Proposal
A strict typographic index with a real h1, short purpose statement, numbered topic jumps, and compact ruled rows. Use one wide title column with a stable author/format column, retaining every existing resource. White, black, and vermilion make navigation and active state clear. On mobile, stack metadata beneath titles and turn the topic index into wrapping links. No cards or stock artwork: the writing is the visual identity.

## Scope and validation
Source review only; no claim that external links were all tested. Root verified the live page and local PDFs. This image is a visual proposal, not implemented UI. Generated with the built-in image_gen tool.

## Prompt
High fidelity desktop Matt Zhang Resources page, Swiss International Typographic Style, pure white, black Helvetica/Arial, fine rules, disciplined grid, one vermilion accent, no cards or shadows. Preserve the Matt Zhang / Blog / Projects / Resources / Writing navigation. Large Resources heading, personal learning/research collection description, 18 links / 07 topics, numbered category jump index. Seven numbered category bands, compact ruled text rows, consistent author and WEB/PDF/ESSAY/GUIDE metadata. Include all eighteen actual resource titles from resources.html; keep the two Advice for applying to CS PhD rows distinguishable by author. Academic, exact, calm, readable. Flat screenshot without browser chrome.
