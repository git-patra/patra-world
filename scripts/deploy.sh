#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# One-time server prerequisite: mount /opt/apps/patra-world:/srv/patra-world:ro
# into Caddy and add deploy/Caddyfile. Subsequent releases need no reload.
if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo 'Commit tracked changes before deploying.' >&2; exit 1
fi
npm run check
npm test
npm run build
release="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)"
archive="$(mktemp -t patra-world)"
trap 'rm -f "$archive"' EXIT
COPYFILE_DISABLE=1 tar -czf "$archive" -C dist .
checksum="$(shasum -a 256 "$archive" | awk '{print $1}')"
ssh idhost-vps 'mkdir -p /opt/apps/patra-world/releases /opt/apps/patra-world/uploads'
scp "$archive" "idhost-vps:/opt/apps/patra-world/uploads/$release.tar.gz"
ssh idhost-vps bash -s -- "$release" "$checksum" <<'REMOTE'
set -euo pipefail
release="$1"; checksum="$2"; app=/opt/apps/patra-world
cd "$app"
printf '%s  %s\n' "$checksum" "uploads/$release.tar.gz" | sha256sum -c -
mkdir "releases/$release"
tar -xzf "uploads/$release.tar.gz" -C "releases/$release"
test -s "releases/$release/index.html"
find "releases/$release" -type d -exec chmod 755 {} +
find "releases/$release" -type f -exec chmod 644 {} +
previous="$(readlink current || true)"
ln -s "releases/$release" "current-$release"
mv -Tf "current-$release" current
printf '%s\n' "$previous" > previous-release
printf '%s\n' "$release" > deployed-release
printf 'Activated %s (previous: %s)\n' "$release" "${previous:-none}"
REMOTE
printf 'Release uploaded. Verify https://patraworld.site and its assets.\n'
