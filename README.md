# Engineering Path

Free, structured courses on **System Design**, **Data Structures & Algorithms** and **AI Engineering**.
Built with [Astro](https://astro.build) + TypeScript. Fully static: no server or database needed.

## What's inside

- **3 courses, 429 lessons**, grouped into stages and parts, each with its own course page
- **Lesson pages** with a course sidebar, "on this page" outline, prerequisites, prev/next, and reading time
- **Diagrams** (950+ Mermaid diagrams render in the browser, light and dark)
- **Progress tracking** ("mark as complete", "continue where you left off") and **personal notes** per lesson, saved in the reader's browser, with a Markdown export at `/notes/`
- **Search** across all lessons (press `/`), powered by Pagefind
- **Code viewer** for the DSA solutions in Python, Java, C++ and Go
- **Newsletter** section, currently inactive
- Light/dark mode, mobile layout, attribution on every lesson

## Run it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:4321 (search only works after a build)
npm run build      # builds to dist/ and creates the search index
npm run preview    # serves the built site, including search
```

## Deploy

The site builds to plain static files in `dist/`. Any static host works. Settings for all of them:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 20+

Good free options: **Cloudflare Pages**, **Netlify** or **Vercel**. Push this folder to a GitHub repo, import it in the host's dashboard, and enter the settings above.

When you have a domain, set `site` in `astro.config.mjs` to it.

## Where to change things

| What | Where |
| --- | --- |
| Site name, author, description | `src/lib/site.ts` |
| Course titles, taglines, stage groupings, part summaries | `src/lib/handbooks.ts` |
| Colors, fonts, spacing | `src/styles/global.css` (tokens at the top) |
| Home page | `src/pages/index.astro` |
| Course landing page | `src/pages/[handbook]/index.astro` |
| Lesson page | `src/pages/[handbook]/[...slug].astro` |
| Newsletter | `src/components/Newsletter.astro` |

### Turning on the newsletter

Pick a provider (Buttondown, ConvertKit/Kit, MailerLite, Beehiiv…), copy its form endpoint, then in
`src/components/Newsletter.astro` set `NEWSLETTER_ENABLED = true` and `NEWSLETTER_ACTION` to the endpoint.

## Updating the course content

The lessons come from the open-source [Engineering Handbook](https://github.com/handbook-academy/engineering-handbook).
To pull in the latest version:

```bash
git clone --depth 1 https://github.com/handbook-academy/engineering-handbook.git ../engineering-handbook
npm run import-content -- ../engineering-handbook
npm run build
```

The import also runs `scripts/remove-em-dashes.mjs`, so newly imported lessons don't bring em dashes back.

Lessons rewritten for this site live in `src/data/rewrites/`, using the same paths as `src/data/handbooks/`. The import copies them over the handbook originals, so edit a rewritten lesson there and in `src/data/handbooks/`, or re-run the import. Add `rewritten: true` to the lesson's frontmatter so its credit line says it was rewritten.

If the handbook adds a new part (folder), the build stops with a message telling you which folder to add to a
stage in `src/lib/handbooks.ts`.

## License

- **Lesson content** (`src/data/handbooks/`, `public/files/`) is adapted from The Engineering Handbook by Handbook
  Academy and contributors, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
  (full text in `CONTENT-LICENSE.txt`). The adapted content on this site is shared under the same license.
  Keep the attribution on lesson pages, in the footer and on `/license/`.
- **Site code, design and branding** are © Ridwan.
