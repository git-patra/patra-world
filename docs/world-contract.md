# Prototype renderer contract

New prototype only. The old patra-portfolio repository must not be modified.

`src/world.js` exports `createWorld(canvas, { stations, onNear, onSelect, onMove })`.
Each station has `{ id, name, type, x, y, color }`; positions use a 17x17 isometric grid with playable coordinates 1 through 15. List:
arcade (4,4), chat (10,3), fintech (13,6), coffee (4,10), erp (9,12), pos (13,11), jajaneun (2,7).
Player starts (8,8). Each building occupies its tile; arrival on adjacent walkable tile. Create art and walkable landscape around coordinates.

Return API:
- `travelTo(id)` pathfind/walk to station; calls onSelect(id) after arrival.
- `move(dx,dy)` initiate one neighboring grid step for keyboard/dpad; sensible screen directions mapped internally if appropriate.
- `interact()` calls onSelect(nearestId) if within interaction range.
- `setPaused(bool)` pauses input while modal open, do not advance destinations while modal open.
- `setMotion(bool)` respects reduced motion, disable ambient movement and simplify travel.
- `reset()` move player to start, clear route.
- `destroy()` cleanup listeners, resize observer, rAF.

Callbacks:
`onNear(stationIdOrNull)` only when proximity changes.
`onMove({x,y,walking})` for displayed coordinates, avoid excessive calls.
`onSelect(id)` open detail drawer.

Canvas handles pointer taps: tapping building navigates there and opens detail; tapping ground walks there. Cursor appropriate, resize/DPR support.
Canvas2D custom 2.5D isometric art: dark autumn miniature village with violet/amber buildings, windows, stepped floating island, cobblestone paths, orange trees, ghost/hooded character with readable walking animation, pumpkins, lanterns. A rich scene with strong silhouettes, not just icons on tiles. World centered with transparent background so CSS gives navy atmospheric gradients. Keep island away from canvas edges using fit-to-view camera; caller canvas spans center between HUD/sidebar on desktop. Camera can fit entire scene on mobile and touch tap buildings.

All work original procedural art. No imported remote content. Accessible equivalent actions are implemented outside canvas by parent. No network, wagering or combat.
