// Leonida Platinum — the hand-in program for gta6-trophy-guide-01 (Node 22, stdlib only).
//
// What it does, in three steps:
//   1. Copies this repo's app/ (the offline guide: index.html, app.js, style.css,
//      data/trophies.json) into the output directory.
//   2. Copies screenshots/ (the 4 captures of the running app) alongside it.
//   3. Writes /output/dossier.json with buildDossier from vendor/makefun-frontend.ts,
//      the kit's dossier library, unchanged. The scorer rebuilds the dossier with
//      its own copy of that library and requires the two to match byte for byte.
//
// Run it locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.
// The run must be deterministic: the same repo writes the same bytes every time.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The caps are the bounty's own gate limits: the text cap shapes the dossier's
// bytes, the rest refuse an entry the scorer would refuse anyway (at most 4
// screenshots of 256 KiB, app/ at most 993 entries and 48 MiB).
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
