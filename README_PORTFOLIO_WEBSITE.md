# My Portfolio Website

## 🧾 Description

A futuristic, cyberpunk-themed portfolio website inspired by Cyberpunk 2077 — bold, neon, and immersive. Built with React (v19.1.0), Tailwind CSS (v4.1.5), Framer Motion, and React Three Fiber, it showcases your developer persona, projects, and MDX-powered blogs. Initialized with Vite. Designed for a possible shift to a dedicated server later.

## 🧱 Developer & Designer Principles

### As a Professional Developer:

1.  Keep modules small, testable, and maintainable
2.  Avoid unnecessary features (YAGNI)
3.  Follow best practices for clean, scalable code
4.  Respect TypeScript and React standards
5.  Write simple, legible functions
6.  Integrate solid error handling and logging
7.  Comment and document clearly

### As a UI/UX Designer:

1.  Use a consistent cyberpunk visual system
2.  Apply neon palettes (pink, blue, purple)
3.  Ensure accessibility through contrast and clarity
4.  Use Tailwind with custom variables
5.  Make responsive, fluid layouts
6.  Prioritize user experience and feedback loops
7.  Conduct usability checks regularly

## 🗂 Project Structure

```
.
├── client/                 # Frontend
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── components/
│       ├── hooks/          # Custom hooks (e.g., use-toast)
│       ├── lib/            # Utilities (e.g., queryClient)
│       └── pages/          # Page-level views (e.g., not-found.tsx)
│
├── components.json         # For automated component registration
├── drizzle.config.ts       # DB or ORM config (if applicable)
├── package.json
├── postcss.config.js
│
├── server/                 # Backend logic
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
│
├── shared/                 # Shared logic or types
│   └── schema.ts
│
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 🛠 Tooling & Libraries

- **Package Manager**: bun (`bun add`)
- **CSS Framework**: Tailwind CSS v4.1.5
- **UI Components**: MUI-style custom components in `/ui`
- **Animation**: Framer Motion
- **3D**: React Three Fiber
- **Icons**: lucide-react
- **Content**: MDX (markdown + JSX)

## 🔮 Visual & Thematic Direction

Inspired by Cyberpunk 2077, the design blends:

- Glowing hover effects and glitch transitions
- Neon RGB color palette (hot pink, cyber blue, electric purple)
- Futuristic fonts: Orbitron or Share Tech Mono
- 3D and parallax effects via React Three Fiber
- HUD-style components, dark backgrounds, glassmorphism overlays

## 🛣 Roadmap

1.  **🔧 Initialization**
    - Vite setup with React + TS
    - Tailwind, Framer Motion, Fiber, MDX
2.  **🎨 Styling & Theme**
    - Define global neon palette
    - Build dark-mode first components
    - Integrate fonts & animations
3.  **📄 Pages**
    - Home — animated synthwave intro
    - About — personal timeline, skills
    - Projects — image sliders + case studies
    - Blog — MDX-powered with theme
    - Contact — retro-futuristic form + links
4.  **🌐 Interactivity**
    - Add 3D models/effects using React Three Fiber
    - Smooth page transitions with Framer Motion
    - Accessibility refinements
5.  **📚 Blogging**
    - Render blog content from `/blogs` (MDX)
    - Add tags, TOC, metadata parsing
6.  **�� Deployment**
    - SSL, domain, favicon
7.  **🔮 Enhancements**
    - Headless CMS (Sanity/Contentlayer)
    - Protected content + basic auth
    - Performance tuning for 3D & animations
