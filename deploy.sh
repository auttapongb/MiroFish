#!/bin/bash
# MiroFish frontend deploy: build, purge stale bundles, copy to /var/www/mirofish/
set -e
cd /root/MiroFish/frontend

echo "=== building ==="
npm run build

echo "=== purging stale bundles ==="
# Remove all old index-*.js/css, keep only the ones referenced by the new index.html
KEEP=$(grep -oE 'index-[A-Za-z0-9_-]+\.(js|css)' dist/index.html | tr '\n' ' ')
for f in /var/www/mirofish/assets/index-*.js /var/www/mirofish/assets/index-*.css; do
  [ -f "$f" ] || continue
  base=$(basename "$f")
  case " $KEEP " in
    *" $base "*) : ;;  # keep
    *) rm -f "$f"; echo "  removed stale: $base" ;;
  esac
done

echo "=== copying dist ==="
cp dist/index.html /var/www/mirofish/index.html
mkdir -p /var/www/mirofish/assets
cp dist/assets/*.js dist/assets/*.css dist/assets/*.jpeg /var/www/mirofish/assets/ 2>/dev/null || true
mkdir -p /var/www/mirofish/examples
cp dist/examples/*.md /var/www/mirofish/examples/ 2>/dev/null || true

echo "=== done ==="
ls /var/www/mirofish/assets/
