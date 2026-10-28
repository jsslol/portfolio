# Jared Schneider — Portfolio

Plain HTML, CSS and JavaScript. No build step, no framework, no dependencies.

## Folder layout

```
portfolio/
├── index.html              ← every section's content lives here
├── css/styles.css          ← colors, fonts and layout (tokens at the top)
├── js/main.js              ← reel, video autoplay, modals, skills filter
├── assets/
│   ├── video/loops/<id>.mp4   ← 8 s silent 720p loops (reel + cards), aim for under 2 MB
│   ├── video/full/<id>.mp4    ← full clip with sound (opens in the "Full clip" player)
│   ├── posters/<id>.jpg       ← first frame shown before a video loads
│   └── img/                   ← logos, screenshots, headshot, favicon
└── README.md
```

One project = one `<id>` used for all three video/poster files (e.g. `tanks`).

## Run it locally

```
cd portfolio
python3 -m http.server 8000
```
Then open http://localhost:8000. Opening index.html straight from the file system also works, but video seeking behaves better through a server.

## Add or swap a project

1. Export the clip, then make web versions with ffmpeg:
   ```
   # 8-second silent loop starting at 0:05
   ffmpeg -ss 5 -t 8 -i raw.mp4 -an -vf "scale=1280:-2,fps=30" -c:v libx264 -preset veryfast -crf 27 -pix_fmt yuv420p -movflags +faststart assets/video/loops/ID.mp4
   # full clip with audio
   ffmpeg -i raw.mp4 -vf "scale=1280:-2" -c:v libx264 -preset veryfast -crf 25 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart assets/video/full/ID.mp4
   # poster frame at 0:07
   ffmpeg -ss 7 -i raw.mp4 -frames:v 1 -vf "scale=1280:-2" -q:v 4 assets/posters/ID.jpg
   ```
2. Copy an `<article class="card">` block in index.html and update the text, tags and `data-skills`.
3. Add the project to the `REEL` list at the top of js/main.js if it should appear in the hero.

`data-skills` on a card controls which skill chips highlight it. Valid keys are the `data-skill` values on the chips in the Skills section.

## Placeholders to fill in

Search the code for `TODO`, `DRAFT` and `class="todo"` (links shown at half opacity).

## Deploy (free options)

- **GitHub Pages**: push this folder to a repo named `<username>.github.io`.
- **Netlify / Cloudflare Pages**: drag the folder onto the dashboard.
- Point a custom domain (e.g. jaredschneider.dev) at it from the host's settings.
