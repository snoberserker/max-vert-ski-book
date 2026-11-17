# The Long Season: A Field Guide to Skiing

A free illustrated web book published by DidThey LLC / MAX VERT™.

Read it at **https://playmaxvert.com/skiing/**. The first edition has 14 chapters and approximately 11,000 words, with individual chapter URLs, a glossary, season planner, and a continuous print edition.

## Editorial proposal

The promise: help recreational skiers understand the sport and build a winter that fits their body, budget, calendar, and curiosity. The audience includes first-season adults, returning skiers, regular recreational skiers, and trip organizers. The voice is direct, welcoming, and interested in skiing as a lifelong practice.

The five-part arc moves from history and industry to a personal season, trip logistics, mountain judgment, and the future of the sport. Chapters work as a book and as individual answers to actual search questions. They connect naturally to the site's snow desk and journal.

This is a first-edition short web book, not an exhaustively reported history or a clinical training manual. It includes inline primary sources, dated business figures, explicitly illustrative budgets, health boundaries, and transparent AI-assistance disclosure. See the final chapter for scope and corrections.

## Work locally

Work on `working`. Use `main` only for explicitly requested releases.

```sh
npm ci
npm run build
npm test
```

Canonical sources: `book.json`, `chapters/*.md`, `assets/`, and `scripts/`. Generated `dist/` is ignored. No remote fonts, runtime framework, or paid reading gate. JavaScript adds filtering, device-only bookmarks, and worksheet calculations; chapter content and navigation are static HTML.

## Publish through max-vert-web

Clone this repository beside `max-vert-web` in the meta workspace. From max-vert-web:

```sh
npm run sync:book
```

The sync builds and tests the book, copies output into `public/skiing/`, updates only book URLs in the existing sitemap, and records the source commit. Commit the generated output in max-vert-web, then use its established Firebase Hosting deployment. No separate domain or hosting account is needed. A fresh web checkout can deploy committed book output without this sibling.

The book repository contains no game code or credentials. Do not edit the generated web copy directly. To retire a page, add an explicit redirect in the web hosting config rather than silently removing its permanent URL.

## Search and discovery

The index, 14 chapters, and planner are indexable, with unique titles/descriptions and canonical URLs. Book/Chapter/Breadcrumb JSON-LD describe the editorial hierarchy. The print copy is `noindex,follow` to avoid competing with the chapter pages. Site navigation and the homepage link to the book. These are discoverability foundations, not a promise of rankings or immediate indexing.

## Future editorial expansion

Add sourced interviews, deeper international history, original mountain reporting, and professionally reviewed training material when available. Keep first-person reporting and professional review claims out until that work actually exists. Recheck industry releases and external links when updating an edition. Never manufacture expertise or pad landing pages with interchangeable resort copy.

All original text and illustration © 2026 DidThey LLC. All rights reserved. Referenced organizations and linked sources retain their own rights.
