# Build Wheel

Draw from sixteen things George genuinely wants to build. One minute to
explain the idea; seven days to ship a real version.

Planned site: https://buildwheel.snackoverflowgeorge.com/

The first screen is a restrained text-based draw in Snack Overflow's Night
Signal palette. Every public spin selects a topic with unbiased browser
cryptographic randomness within the chosen category. A soft synthesized tick plays during the
draw and a short cue marks the result; sound can be muted. After a result, a
one-minute speech countdown opens with a distinct end alarm. The result has a
stable share URL, and someone opening it can see the same idea and spin for
their own.

## Local development

```sh
npm install
npm run dev
```

Open the URL printed by Vite. The wheel and leaderboard work without credentials.
The submission API requires Vercel Functions (`vercel dev`) plus the server-only
`GITHUB_TOKEN` described below; Vite alone does not run the API endpoint.

## Data and routes

- `src/topics.ts` is the public-safe launch list: 16 published topics with
  stable IDs and slugs. Reserve topics are not on the wheel.
- `/?idea=<slug>` opens an exact shared result.
- Old `mode=curated` query parameters are removed; they cannot influence a draw.
- An unlisted filming URL for the first video lands on a pinned topic without
  a separate on-screen mode label. It is not linked in the public UI or sitemap.
  An unlisted URL is not access control.
- Local preview builds may load an optional `creator-series.json` placed next
  to the built `index.html`. Each record supplies an unlisted `creator` take;
  the public draw still uses only `src/topics.ts`. Production builds do not
  include a creator catalog by default.
- `npm run sync:readmes` fetches the current public README from each curated
  GitHub repository into `public/readmes/`. Detail pages display these
  source-attributed excerpts, refreshed when this script is run. Run it before
  publishing leaderboard changes; the GitHub README remains the full source.
- The leaderboard's “Submit a harness” form asks for a public GitHub repo,
  short description, and optional contact. Its Vercel Function sends a private
  issue to `georgewangyu/audience-private-intake`. No project is added
  automatically. The form does not accept images.
- Browser state is local only. The submission sends only the entered fields to
  the server-side issue creator; no analytics are collected by the app.

## Verification

```sh
npm run typecheck
npm test
npm run build
```

To refresh repository documentation first:

```sh
npm run sync:readmes
```

The sync uses GitHub's public API. Optionally set `GITHUB_TOKEN` for a higher
API rate limit; the token is never bundled into the site.

Deployment is a Vite build plus one Vercel Function. The canonical domain is
`buildwheel.snackoverflowgeorge.com`; the default Vercel project host redirects
to it. Set `GITHUB_TOKEN` as a server-side Vercel environment variable for
preview and production. Use a fine-grained GitHub token scoped only to
`georgewangyu/audience-private-intake` with Issues read/write permission.
Publish a Vercel WAF rule limiting `POST /api/submit-harness` by IP (for
example, three requests per ten minutes), then set the server-only
`SUBMISSION_RATE_LIMIT_READY=1`. The endpoint refuses to create issues until
both controls are configured. Vercel may charge for rate-limit usage above its
included allowance; review pricing before enabling the rule.
The endpoint creates private issues labeled `source-repo:build-wheel`,
`type:submit-harness`, `status:needs-triage`, and `visibility:private`; the
source is also in the title and body. Without the token, submissions fail
closed with an unavailable message. Do not use a broad personal CLI token.

There is no automatic README refresh job. Run `npm run sync:readmes` when
updating the board or before a release, then commit the generated snapshots.

For general feedback, use the [Snack Overflow George Instagram page](https://www.instagram.com/snackoverflowgeorge/).

See [DESIGN.md](DESIGN.md) for the visual and interaction contract.
