# Static deployment preparation

Status: local only. No SSH connection or server changes have been made.

1. Run `npm ci`, `npm run check`, `npm test`, and `npm run build`.
2. Preview `dist/` locally with `npm run preview`; verify CV, images, four-zone penalty, timeline, and direct project reading mode.
3. When deployment is requested, obtain the destination SSH alias/host, user, domain, and web directory.
4. Publish only the contents of `dist/`. Do not expose source, `.git`, `node_modules`, or documents.
5. The Vite base is relative (`./`), supporting root or directory hosting with a trailing slash. Configure directory requests to serve `index.html`. No API proxy or SPA route rewrite is needed; navigation uses fragment links.
6. Use a temporary release directory and retain the previous release for rollback; switch the web root only after checking the uploaded assets.

No backend, credentials, database, Instagram token, or financial service connection is required. Add the actual production canonical URL and social preview URL only when a domain has been selected. Avoid inventing a public deployment URL.
