# DSP Assignment Portal

A fully client-side Next.js site:

- **Assignments 2, 3, 4**: view/download the question sheet and the worked answer PDF.
- **Assignment 1 (Voice Compression)**: upload or record a voice note; it is compressed to
  64 / 32 / 8 / 2 kbps entirely in the browser and packaged into a ready-to-submit zip
  (four WAVs + `VoiceCom.m` + `quantize_audio.m` + a waveform figure + README). No audio ever
  leaves the device, and no PDF is produced for this one.

The `quantize_audio.m` helper is randomly chosen from four functionally-identical variants, so no
two downloads ship an identical file.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy

It is a **static export** (`output: "export"`), so it hosts anywhere.

- **Vercel:** `npm i -g vercel` then `vercel` (or push to GitHub and import the repo). Zero config.
- **Any static host / GitHub Pages / Netlify:** `npm run build` then serve the generated `out/`
  folder.

## SEO / social preview

`app/layout.js` sets the OpenGraph + Twitter tags and points at `public/og-image.png`
(1200×630). After deploying, change the `SITE` constant near the top of `app/layout.js` to your
real URL so the preview image resolves absolutely. The favicon is `app/icon.svg`.

## Swapping PDFs

The PDFs live in `public/pdfs/` (`asg2-question.pdf`, `asg2-answer.pdf`, …). Replace any file
in place to update what the site serves. The assignment titles/blurbs are in `app/page.js`.
