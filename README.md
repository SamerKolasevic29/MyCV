
<p align="center">
<img src="assets/MainMaterial/headImage.jpg" width="400">
</p>
Personal portfolio and CV of Samer Kolasević: a fast, static, bilingual (EN / BS) site built with plain HTML, CSS and JavaScript. No frameworks, no build step.

Live at **https://samer.kolasevic.com**

## File structure

```
├── assets                  # All static content
│   ├── js                  # Local libraries (marked.js)
│   ├── Articles            # Markdown articles, PDFs, articles.json
│   ├── Documents           # Downloadable documents (Europass CV)
│   ├── Icons               # Favicon, section and social icons
│   └── MainMaterial        # Project screenshots, videos and photos
├── CNAME                   # Custom domain record
├── article.html            # Standalone article reader (used on phones)
├── articles-core.js        # Shared Markdown helpers
├── article.js              # Logic for article.html
├── index.html              # Page markup and all content (EN/BS via data attributes)
├── robots.txt              # Crawler rules
├── scripts
│   └── build-articles.sh   # Builds assets/Articles/articles.json from front matter
├── script.js               # Language switcher, sliders, navbar, PDF viewer
├── sitemap.xml             # Sitemap for search engines
└── style.css               # All styling, responsive layout
```

## Hosting pipeline

Self-hosted on a homelab: Ubuntu Server running Nginx, exposed to the internet through a Cloudflare Tunnel at `samer.kolasevic.com`.

## Writing articles

Articles are plain Markdown files in `assets/Articles/`, one per language: `my-post.en.md` and `my-post.bs.md`. Each file starts with a front matter block:

```
---
title: My post
date: 2026-11-01
tag: Article
description: One-line summary shown in the list
---
```

Put images in `assets/Articles/images/` and reference them as `![Alt](images/pic.png)`.

Then regenerate the index and deploy:

```bash
bash scripts/build-articles.sh
```

On desktop an article opens in the canvas next to the list, on phones in its own tab (`article.html?a=my-post`). PDF articles still work as before.

## Coming next

- Better mobile layout polish
