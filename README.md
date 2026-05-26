## Luke Zhang's Personal Site

`edluke.github.io` is a React + Three.js personal site built around the "random asian dude 3000" globe experience.

Live site: https://edluke.github.io/

## Local Development

```sh
npm start
```

Before pushing, verify locally:

```sh
CI=true npm test -- --watchAll=false
npm run build
```

## Icons

The favicon and app icons are generated from `src/assets/profile-pic.jpg`:

- `public/favicon.ico`
- `public/logo192.png`
- `public/logo512.png`

Regenerate them after changing the profile image:

```sh
magick src/assets/profile-pic.jpg -resize 192x192 public/logo192.png
magick src/assets/profile-pic.jpg -resize 512x512 public/logo512.png
magick src/assets/profile-pic.jpg -define icon:auto-resize=64,48,32,16 public/favicon.ico
```

## Deploy

This repo deploys to GitHub Pages with GitHub Actions.

1. Push changes to `master`.
2. In GitHub, open `Settings` -> `Pages`.
3. Set `Build and deployment` -> `Source` to `GitHub Actions`.
4. Wait for the `Deploy to GitHub Pages` workflow to finish.
5. Open `https://edluke.github.io/`.

## Credit

Originally forked and referenced from:

https://dev.to/oswaldodiaz/my-personal-page-with-react-4jkn
