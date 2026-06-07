# DevToolKit

**DevToolKit** is a modern collection of **22 free online browser tools** for developers, designers, creators, job seekers, image optimization, SEO work, and CS2 FACEIT profile lookup.

Live Website: https://devtoolkit-tools.vercel.app/

---

## Overview

DevToolKit helps users complete daily web tasks faster from one clean toolbox. It includes developer utilities, design generators, image tools, utility tools, AI-powered CV generation, and FACEIT CS2 player lookup.

The project is built with:

- HTML
- CSS
- JavaScript
- Vercel Serverless API Routes
- Gemini API integration
- FACEIT Data API integration

---

## Featured Tools

### AI CV Maker

Create professional ATS-friendly resumes with:

- AI summary generation
- AI skill suggestions
- AI bullet point improvement
- Multiple CV templates
- Live CV preview
- HTML export
- PDF download
- No login required

### FaceitFinder

Search public CS2 FACEIT player information, including:

- Player nickname
- Country
- FACEIT skill level
- FACEIT ELO
- Region
- Match count
- Win rate
- K/D ratio
- Recent matches
- Optional AI summary

---

## Tool List

### AI / Developer / Gaming Tools

1. AI CV Maker
2. FaceitFinder
3. JSON Formatter
4. Regex Tester
5. URL Encoder / Decoder
6. Markdown Previewer
7. Meta Tags Generator
8. CSS Minifier / Beautifier
9. HTML Entity Encoder / Decoder

### Design Tools

10. Gradient Generator
11. Color Palette Generator
12. Box Shadow Generator
13. Glassmorphism Generator
14. CSS Clamp Generator

### Image Tools

15. Image Converter
16. Image Compressor
17. Image Resizer
18. Favicon Generator

### Utility Tools

19. QR Code Generator
20. Password Generator
21. Text Case Converter
22. Lorem Ipsum Generator

---

## Project Structure

```txt
devtoolkit/
├── api/
│   ├── faceitfinder.js
│   ├── generate-cv.js
│   └── generate-field.js
│
├── assets/
│   ├── icons/
│   │   └── favicon.ico
│   │
│   └── images/
│       ├── favicon.png
│       ├── og-image.png
│       └── screenshot.png
│
├── components/
│   ├── header.html
│   └── footer.html
│
├── css/
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── components.js
│   ├── main.js
│   ├── helpers.js
│   ├── storage.js
│   ├── json-formatter.js
│   ├── gradient-generator.js
│   ├── color-palette.js
│   ├── box-shadow.js
│   ├── qr-generator.js
│   ├── password-generator.js
│   ├── markdown-preview.js
│   ├── meta-tags.js
│   ├── regex-tester.js
│   ├── url-tools.js
│   ├── image-converter.js
│   ├── image-compressor.js
│   ├── image-resizer.js
│   ├── favicon-generator.js
│   ├── text-case.js
│   ├── lorem-generator.js
│   ├── css-minifier.js
│   ├── html-entities.js
│   ├── faceitfinder.js
│   └── ai-cv-maker.js
│
├── pages/
│   ├── ai-cv-maker.html
│   ├── faceitfinder.html
│   ├── json-formatter.html
│   ├── gradient-generator.html
│   ├── color-palette.html
│   ├── box-shadow.html
│   ├── qr-generator.html
│   ├── password-generator.html
│   ├── markdown-preview.html
│   ├── meta-tags.html
│   ├── regex-tester.html
│   ├── url-tools.html
│   ├── image-converter.html
│   ├── image-compressor.html
│   ├── image-resizer.html
│   ├── favicon-generator.html
│   ├── text-case.html
│   ├── lorem-generator.html
│   ├── css-minifier.html
│   ├── html-entities.html
│   ├── glassmorphism-generator.html
│   └── css-clamp.html
│
├── index.html
├── sitemap.xml
├── robots.txt
├── LICENSE
├── README.md
└── .gitignore