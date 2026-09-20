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

Open the URL printed by Vite. No account or environment variables are needed.

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
- Browser state is local only. No user input, analytics, or personal data is
  collected by the app.

## Verification

```sh
npm run typecheck
npm test
npm run build
```

Deployment is a static Vite build on Vercel. The canonical domain is
`buildwheel.snackoverflowgeorge.com`; the default Vercel project host redirects
to it. There are no server-side variables or content sync jobs.

For feedback, use the [Snack Overflow George Instagram page](https://www.instagram.com/snackoverflowgeorge/).

See [DESIGN.md](DESIGN.md) for the visual and interaction contract.
