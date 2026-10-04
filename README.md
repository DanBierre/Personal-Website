# Personal Website

My portfolio site. I'm Dan, based in Auckland and heading to Japan. I build websites and AI agent workflows, and I edit video.

The design is called Ensō, after the brush circle from Zen ink painting. It's paper and sumi ink, with one ink line running down the page and a stop for each section. The ensō around my photo is drawn fresh by code every time the page loads, so it never looks machine-made.

## What's on it

- **Hero**: who I am, plus live clocks for Auckland and Tokyo
- **Work**: Shoji, a desktop planner I'm building for people who work from home (coming soon)
- **About**: background, what I'm up to these days, and my Japanese study
- **Contact**: email, with a copy button for people on webmail

The whole site works in English and Japanese. Hit the toggle and the text blurs across. It has light and dark modes too.

## How it's built

Kept it simple on purpose: plain HTML, CSS and JavaScript. No framework, no build step, nothing to install.

- `index.html` holds all the content, with both languages stored on each element
- `style.css` holds the design tokens, layout and both themes
- `script.js` draws the ensō and runs the clocks, the theme and language switches, and the fade-ins

It also respects reduced motion if you've got that turned on.

## Run it locally

```bash
npx --yes http-server . -p 5500 -c-1
```

Then open http://localhost:5500. Opening `index.html` directly works too.

## Security

It's a static site with no forms, no cookies and no tracking. A Content-Security-Policy only lets in the site's own files and Google Fonts. See [SECURITY.md](SECURITY.md) if you spot something.

## Get in touch

Got something interesting to build? Let's talk: bierredan@gmail.com
