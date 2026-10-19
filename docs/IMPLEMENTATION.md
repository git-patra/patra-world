# Local implementation ledger — 2026-10-19

Plan: docs/PLAN.md. User approved local implementation, richer tenant content, visible experience, football penalty with four immutable corner zones (latest user correction). Existing repo `../patra-portfolio` is read-only.

Ruling: preserve original Canvas2D world and semantic DOM shell; use React/shadcn islands for the new interactive game. This implements the planned framework integration without replacing working world navigation.
Ruling: four fixed corner shooting zones override the reference's configurable 3/4/9 layouts. Preserve click-to-shoot, keeper blocking the same zone, save-ending rounds, and a five-goal completion target. No transaction mechanics.
Ruling: professional experience is visible in the first-screen sidebar and a full HTML section below the map, with direct links to detailed cases. This also provides content independent of canvas/JavaScript.

Tasks:
1. Enrich seven case studies using revised CV and supplied facts. Connect each to role/company/period.
2. Add persistent identity, experience summary, map explanation, complete chronology, and static project reading mode.
3. Add tested penalty state model, React/shadcn game, fixed four corner zones, motion and cleanup handling.
4. Verify responsive UI, keyboard, dialogs, game states, static build, and old-repo fingerprint. Record review and local-only handoff.

Pre-flight: shell controls open case dialogs; React island must unmount before content replacement and on dialog close. World input must pause for dialogs and below-map reading. Static case content must use the same data as the modal.

Completion:
- All four tasks implemented and verified locally. See VERIFICATION.md for checks and limitations.
- Fresh implementation review found no blocker; same-hash reading navigation and session-best persistence were corrected.
- The final production build is served locally on port 4176. The old repository fingerprint is unchanged.
