# Benjamin Nie | Personal Portfolio

A personal portfolio with an interactive homepage, software projects, and experience in engineering, research, and teaching.

## Site overview

| Page | Route | Content |
| --- | --- | --- |
| Home | `/` | Colored circles that nudge each other aside as you move your cursor or touch and drag. The animation respects reduced-motion settings. |
| Experience | `/experience` | Roles in software engineering, computational research, student leadership, and teaching. |
| Projects | `/projects` | [Scute](https://github.com/benjamin-nie24/scute), a walking route planner for the University of Maryland campus. |
| About | `/about` | Education, technical skills, certification, and links to the résumé and GitHub profile. |

## Technology

Built with the Next.js App Router, React, TypeScript, and Tailwind CSS. The homepage uses an HTML canvas to draw and animate the circles.

## Local development

Requires Node.js 20.9 or later and npm. From the repository root, install the locked dependencies and start the development server.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000) in your browser.

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | Check TypeScript types. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build locally after building. |

