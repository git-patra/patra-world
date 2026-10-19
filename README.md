# Patra’s After Hours — interactive portfolio concept

A separate, playable exploration prototype for Anugrah Patra. Move a little ghost through an original isometric autumn village and discover seven places representing his work. The previous `../patra-portfolio` repository is preserved as the earlier option.

This repository contains the **plan and concept demonstration**, not a finished production release. Local only; no remote repository or deployment.

## Try locally

Node.js is required for the development server and packaging. No package installation is needed.

```sh
npm run dev
```

Open **http://127.0.0.1:4176/**. The old portfolio remains on port 4173.

- **WASD / arrow keys:** move the character.
- **Click/tap ground:** walk to a tile.
- **Click/tap a building or its marker:** walk there and open its project.
- **E / Explore button:** inspect a nearby building.
- **Project index:** open any project directly; no gameplay requirement.
- **Mobile D-pad:** press or hold to move.
- **Motion toggle:** disable ambient animation and make travel instant. Honors system reduced motion.
- **Escape / close:** return to the village.

## Included demonstration

Seven locations: Arcade (playable Rock Paper Scissors), Signal Station (local scripted chat), Card Vault (integration showcase), Coffee House (invoice concept), Operations Hub (ERP concept), Oren Market (product screenshot and link), Jajaneun Kitchen (curated Instagram images and links).

The revised CV and LinkedIn contact link are included. Invoice, finance, and ERP visuals are labeled illustrative. No messaging backend, live financial integration, wagering, payment, or account system is connected.

## Files and architecture

- `src/world.js` — original procedural Canvas 2D artwork and character controller.
- `src/world-math.js` — isometric projection and obstacle-aware routing.
- `src/data.js` — English project content.
- `src/app.js` — semantic DOM interface, native accessible dialogs, local demos.
- `src/styles.css` — responsive dark autumn UI.
- `public/assets/` — copied assets, revised CV, locally hosted fonts/licenses.
- [Design and implementation plan](docs/PLAN.md)
- [Content and provenance](docs/CONTENT.md)
- [Verification notes](docs/VERIFICATION.md)

## Checks and static build

```sh
npm run check
npm test
npm run build
node scripts/serve.mjs --dist
```

Stop the dev server before serving `dist` on the same port. `PORT=4177 node scripts/serve.mjs --dist` uses another port. Build copies browser files into `dist/`; hosting needs no backend. Production accessibility, content SEO, and device performance work are listed in the plan. React/shadcn integration is reserved for the production phase, after this exploration direction is chosen.

World art is generated from original vector geometry; the reference video is inspiration only and is not bundled. No external scripts or requests are made on page load. External destinations open only when their links are selected.
