#!/usr/bin/env node
// Regenerates an album's content JSON (src/content/albums/<slug>.json) from
// whatever image files are sitting in public/media/albums/<slug>/.
//
// Usage:
//   node scripts/build-album-json.mjs <slug> [options]
//
// Options (only needed the first time / to change metadata):
//   --title "Silverstone GT Cup"
//   --date 2026-05-10
//   --venue "Silverstone Circuit"
//   --summary "Single-day accredited paddock coverage."
//
// What it does:
//   - Scans public/media/albums/<slug>/ for image files (jpg/jpeg/png/webp/avif),
//     natural-sorted by filename (so "shot-2.jpg" comes before "shot-10.jpg").
//   - Writes one { type: "photo", src, alt } item per image, in that order.
//   - If a JSON file already exists for this slug, re-running the script:
//       - keeps existing title/date/venue/summary unless overridden by a flag
//       - keeps each photo's existing `alt` and `classes` (matched by src),
//         so re-tagging race classes survives a re-run
//       - keeps any existing `clip` items untouched (clips use a Cloudflare
//         Stream streamId, not a file in this folder, so they're managed by
//         hand — see CLAUDE.md, Stream isn't wired up yet)
//       - warns about any photo that was in the JSON but is no longer in the
//         folder (in case a file got renamed/deleted by mistake)
//   - Also warns about video files (mp4/mov) sitting in the folder — those
//     need to be uploaded to Cloudflare Stream separately; this script
//     doesn't touch clip items.
//
// This only touches the `items` array's photo entries — it's safe to run
// repeatedly as you drop more exported photos into the folder.

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v"]);

function parseArgs(argv) {
	const [slug, ...rest] = argv;
	if (!slug || slug.startsWith("--")) {
		console.error("Usage: node scripts/build-album-json.mjs <slug> [--title ...] [--date ...] [--venue ...] [--summary ...]");
		process.exit(1);
	}
	const flags = {};
	for (let i = 0; i < rest.length; i += 2) {
		const key = rest[i]?.replace(/^--/, "");
		const value = rest[i + 1];
		if (!key || value === undefined) {
			console.error(`Malformed flag near "${rest[i]}"`);
			process.exit(1);
		}
		flags[key] = value;
	}
	return { slug, flags };
}

// Natural sort: "shot-2.jpg" before "shot-10.jpg", not after.
function naturalCompare(a, b) {
	const chunk = (s) => s.split(/(\d+)/).map((part) => (/^\d+$/.test(part) ? Number(part) : part));
	const ca = chunk(a);
	const cb = chunk(b);
	for (let i = 0; i < Math.max(ca.length, cb.length); i++) {
		const x = ca[i] ?? "";
		const y = cb[i] ?? "";
		if (x === y) continue;
		if (typeof x === "number" && typeof y === "number") return x - y;
		return String(x).localeCompare(String(y));
	}
	return 0;
}

function humanizeAlt(filename, title) {
	const base = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
	return title ? `${title} — ${base}` : base;
}

function main() {
	const { slug, flags } = parseArgs(process.argv.slice(2));

	const mediaDir = path.join(ROOT, "public", "media", "albums", slug);
	const jsonPath = path.join(ROOT, "src", "content", "albums", `${slug}.json`);

	if (!existsSync(mediaDir)) {
		console.error(`No such folder: public/media/albums/${slug}/ — create it first and drop photos in.`);
		process.exit(1);
	}

	const entries = readdirSync(mediaDir, { withFileTypes: true }).filter((e) => e.isFile());
	const imageFiles = entries
		.map((e) => e.name)
		.filter((name) => IMAGE_EXTS.has(path.extname(name).toLowerCase()))
		.sort(naturalCompare);
	const videoFiles = entries
		.map((e) => e.name)
		.filter((name) => VIDEO_EXTS.has(path.extname(name).toLowerCase()));

	let existing = {};
	if (existsSync(jsonPath)) {
		existing = JSON.parse(readFileSync(jsonPath, "utf8"));
	}

	const title = flags.title ?? existing.title ?? slug;
	const date = flags.date ?? existing.date;
	const venue = flags.venue ?? existing.venue;
	const summary = flags.summary ?? existing.summary;

	if (!date) {
		console.error("No date set — pass --date YYYY-MM-DD (required by the content schema).");
		process.exit(1);
	}

	// Match existing photo items by src so hand-added alt/classes survive a re-run.
	const existingBySrc = new Map();
	for (const item of existing.items ?? []) {
		if (item.type === "photo" && item.src) existingBySrc.set(item.src, item);
	}

	const photoItems = imageFiles.map((filename) => {
		const src = `/media/albums/${slug}/${filename}`;
		const prior = existingBySrc.get(src);
		return {
			type: "photo",
			src,
			alt: prior?.alt ?? humanizeAlt(filename, title),
			...(prior?.classes ? { classes: prior.classes } : {}),
		};
	});

	// Keep any existing clip items untouched — they're not file-backed.
	const clipItems = (existing.items ?? []).filter((item) => item.type === "clip");

	const seenSrcs = new Set(imageFiles.map((f) => `/media/albums/${slug}/${f}`));
	for (const src of existingBySrc.keys()) {
		if (!seenSrcs.has(src)) {
			console.warn(`⚠ Was in ${slug}.json but no longer found in the folder: ${src}`);
		}
	}
	if (videoFiles.length > 0) {
		console.warn(
			`⚠ ${videoFiles.length} video file(s) found in public/media/albums/${slug}/ — these need to be uploaded to Cloudflare Stream and added as "clip" items by hand (streamId), this script only handles photos: ${videoFiles.join(", ")}`,
		);
	}

	const album = {
		title,
		date,
		...(venue ? { venue } : {}),
		...(summary ? { summary } : {}),
		items: [...photoItems, ...clipItems],
	};

	writeFileSync(jsonPath, `${JSON.stringify(album, null, "\t")}\n`);
	console.log(`✓ Wrote ${photoItems.length} photo item(s) + kept ${clipItems.length} clip item(s) → src/content/albums/${slug}.json`);
}

main();
