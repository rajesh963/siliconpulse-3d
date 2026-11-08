# Deploy a permanent URL

The Serveo/localhost.run links are temporary tunnels. For a stable URL, build the
static app and deploy `dist/`.

## GitHub Pages

The repository includes `.github/workflows/deploy.yml`.

1. Push the repo to GitHub with the default branch `main`.
2. Repository → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push a commit (or run the workflow manually).
4. The workflow builds with the correct subpath (`/<repo>/`) and publishes.

The site is then at:

```
https://<user>.github.io/<repo>/
```

If the repository is named `<user>.github.io`, the workflow uses `/` as the base.

## Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Leave `VITE_BASE` unset (root).

`public/_redirects` is included for SPA fallback.

## Vercel

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Local static check

```bash
npm run build
npx serve dist
```

The app is frontend-only; uploaded diagrams and edits stay in the browser's
`localStorage`. For multi-user/private data you need a backend.
