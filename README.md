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

The site header and favicon use the Companion Signal mark, selected from the
JarvisAIGeorge logo exploration. The bundled SVG contains only public-safe
vector geometry and palette values; private design notes stay outside this repo.

## Local development

```sh
npm install
npm run dev
```

Open the URL printed by Vite. The wheel, leaderboard, and GitHub issue handoff
work without site credentials or a server-side function.

## Data and routes

- `src/topics.ts` is the public-safe launch list: 16 published topics with
  stable IDs and slugs. Reserve topics are not on the wheel.
- `/?idea=<slug>` opens an exact shared result.
- A public result can create a self-contained `/projects/share` page with the
  stable topic slug, project name, and public HTTPS project URL in its query.
  The page can be shared immediately without an account or database. It does
  not submit the project to a directory or leaderboard.
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
  short description, and optional public credit. It opens a prefilled issue in
  `georgewangyu/JarvisAIGeorge`. The visitor must sign in to GitHub and post it
  there; the issue is public. No project is added automatically. The form does
  not accept images.
- The featured Jarvis block links the public agent-harness and macOS desktop
  repositories as one product family. Both names and star pills open GitHub;
  only the harness remains part of the ranked field.
- Browser state is local only. The app has no submission API or analytics.

## Project flywheel

The minimal loop is: spin a public prompt, build something, add its name and
public URL, receive a branded project-page link, and share that page. Project
pages intentionally use transparent URL state rather than hidden persistence;
the app does not write visitor submissions to a database or directory. Builders
should use only public information because share URLs may appear in browser
history and ordinary hosting logs. Project pages identify themselves as
user-created and do not imply that Build Wheel reviewed the external link.

There is no project ranking yet. GitHub stars would privilege older projects
and exclude non-GitHub builds, while site-native voting would require abuse
controls and durable storage. Revisit ranking only after enough real project
pages exist to make comparison useful.

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

Deployment is a static Vite build. The canonical domain is
`buildwheel.snackoverflowgeorge.com`; the default Vercel project host redirects
to it. Harness suggestions are composed and posted through GitHub's own public
issue UI, so there is no submission credential or Vercel Function to configure.

There is no automatic README refresh job. Run `npm run sync:readmes` when
updating the board or before a release, then commit the generated snapshots.

For general feedback, use the [Snack Overflow George Instagram page](https://www.instagram.com/snackoverflowgeorge/).

See [DESIGN.md](DESIGN.md) for the visual and interaction contract.
