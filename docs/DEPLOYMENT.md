# Production deployment

- Domain: https://patraworld.site (www redirects to apex).
- SSH: `ssh idhost-vps`, user bonbon, IP 203.145.35.187.
- Static Vite output served directly by existing Caddy. No portfolio application container, Node runtime, database, or GitHub Actions credentials.
- App directory: `/opt/apps/patra-world`. Caddy mount: `/opt/apps/patra-world:/srv/patra-world:ro`.
- Shared infrastructure: `/opt/apps/_infra/caddy/docker-compose.yml` and `Caddyfile`.

## Update

Commit changes, then run `./scripts/deploy.sh` from a machine with the existing SSH alias. It checks/tests/builds locally, uploads a checksummed archive, and switches the `current` symlink atomically. Only build output is uploaded. No Caddy restart is needed for subsequent releases.

Layout: `releases/<timestamp>-<commit>/`, `current`, `previous-release`, `deployed-release`, `uploads/`, `backups/`. Old releases are retained for rollback; cleanup is manual.

After uploading, verify the HTTPS page, its JS/CSS, images, CV, and www redirect. Review deployment logs before declaring a release healthy.

## Rollback content

Read `/opt/apps/patra-world/previous-release`, verify the referenced release exists, create a temporary symlink to it, and atomically rename that symlink over `current`. This requires no service restart. Do not delete the current or previous release before verifying the replacement.

## One-time Caddy setup

Backup host Compose/Caddyfile, mounted Caddyfile, live JSON configuration and container IDs. Validate a candidate configuration with the extra read-only mount and the two blocks in `deploy/Caddyfile`. Recreate only the caddy service with `--no-deps --pull never`; retain existing image, networks, ports and named volumes. Never run shared `compose down`.

Preserve all existing routes, including any difference between active and on-disk configuration. Validate existing site responses before and after. Setup backups are under `backups/`; `setup-backup` records the backup directory. If setup fails, restore the backed-up Compose and known working Caddy configuration, then recreate only caddy.
