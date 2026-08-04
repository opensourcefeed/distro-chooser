# Distro Chooser

An interactive Linux distribution chooser / quiz built with Astro. Help users find the perfect Linux distro based on their preferences, use case, and experience level.

## 🧰 Stack

| Technology | Purpose |
|-----------|---------|
| [Astro](https://astro.build) v7 | Static site generation and routing |
| [TypeScript](https://www.typescriptlang.org/) | Type safety (strict mode) |
| [Tailwind CSS](https://tailwindcss.com) v4 | Utility-first CSS framework |
| [pnpm](https://pnpm.io) | Fast, disk-efficient package manager |

## 🚀 Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── astro.svg
│   ├── components/
│   │   └── Welcome.astro
│   ├── data/
│   │   └── .gitkeep
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   └── .gitkeep
│   ├── pages/
│   │   └── index.astro
│   ├── schemas/
│   │   └── .gitkeep
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── .gitignore
```

## 🧞 Commands

| Command | Action |
|---------|--------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start local dev server at `localhost:4321` |
| `pnpm build` | Build production site to `./dist/` |
| `pnpm preview` | Preview production build locally |

## 🌐 Deployment

The site is configured to deploy at:
- **Base path:** `/distro-chooser/`
- **Production site:** `https://www.opensourcefeed.org`