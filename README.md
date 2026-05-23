## Luke Zhang's Personal Website

forked and referenced from:

https://dev.to/oswaldodiaz/my-personal-page-with-react-4jkn

## Deploy

This repo deploys to GitHub Pages with GitHub Actions.

1. Push changes to `master`.
2. In GitHub, open `Settings` -> `Pages`.
3. Set `Build and deployment` -> `Source` to `GitHub Actions`.
4. Wait for the `Deploy to GitHub Pages` workflow to finish.
5. Open `https://edluke.github.io/`.

Before pushing, verify locally:

```sh
npm run build
CI=true npm test -- --watchAll=false
```
