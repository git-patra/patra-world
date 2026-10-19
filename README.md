# Patra’s After Hours

Anugrah Patra’s static portfolio: an explorable isometric world, a visible professional timeline, seven detailed work stories, and a playable Football Penalty game. Dark autumn/Halloween theme. English content.

Local only. The original `../patra-portfolio` repository remains the earlier option and is not modified by this project.

## Local development

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4176/**. Vite + React + Tailwind + shadcn/ui; Canvas2D renders the original world art. The older portfolio uses a separate port, 4173.

## Explore

- **WASD / arrows:** move. **Click/tap ground or a building:** walk there.
- **E / Explore:** open the nearby work story.
- **Explore my work sidebar:** walks the character to the selected tenant and opens its story on arrival.
- **Project index:** open any case directly. Mobile includes a D-pad.
- **About & experience:** read the complete 2018–present chronology and project contributions below the map.
- **Motion:** disables ambient animation and uses instant world travel. Also honors reduced motion.
- **Escape / close:** leave a project dialog.

Each case identifies the company/product, role, period, context, concrete contributions, technologies, and an illustrative workflow. Financial/ERP/invoice concepts are labeled sample data. Oren POS and Jajaneun use attributed existing imagery. LinkedIn is the main contact; the revised CV is included.

## Football Penalty

Exactly **four fixed zones**, arranged in a 2×2 goal: top left, top right, bottom left, bottom right. Clicking a zone starts an animated wind-up, leg swing, ball flight, and goalkeeper dive. The keeper chooses a zone; a different zone scores, a matching zone is saved and ends the round. Five consecutive goals wins. No zone settings, wagering, backend, or transactions. Inputs lock during the shot. Restart sits above the pitch and is always available, including during a shot; the best score survives reopening the game during the page visit.

The game uses React and the local shadcn Button component. The world and content shell remain independently maintainable. Timers and the React root are cleaned up when dialogs close or change.

## Verify and package

```sh
npm run check
npm test
npm run build
npm run preview
```

Stop dev before previewing on the same port. Deployable files are in `dist/`; a server only needs static-file hosting. No runtime Node server or database is required. The full profile, timeline, and expandable project stories are emitted as HTML by the Vite build, so reading mode works without JavaScript.

## Source map

- `src/world.js`, `src/world-math.js`: original procedural world and navigation.
- `src/data.js`: shared career and project content.
- `src/content-html.js`: static profile, chronology, and case reading mode.
- `src/app.js`: map UI, dialogs, local chat, and lifecycle management.
- `src/penalty.js`: pure game transitions, fixed zones, and terminal-round rules.
- `src/components/PenaltyGame.jsx`: football presentation and controls.
- `src/components/ui/button.jsx`: shadcn/ui source component.
- `src/styles.css`, `src/experience.css`, `src/penalty.css`, `src/ui.css`: presentation and Tailwind theme.
- `public/assets/`: revised CV, attributed project images, partner marks, fonts/licenses.

[Plan](docs/PLAN.md) · [Implementation record](docs/IMPLEMENTATION.md) · [Content provenance](docs/CONTENT.md) · [Verification](docs/VERIFICATION.md) · [Static hosting](docs/DEPLOYMENT.md)

The reference game was used to understand click-to-shoot and keeper/streak behavior. All football artwork is newly drawn SVG/CSS. No remote scripts run on page load; external links open only when selected. No GitHub repository or deployment has been created.
