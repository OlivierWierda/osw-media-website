#!/usr/bin/env node
// Turns one folder of photos into the site's album JSON. Not meant to be
// run by hand — the "Update Website.bat" file dropped into each album
// folder calls this with the right paths already filled in.
//
// What it reads: <album folder>/info.txt — plain "KEY: value" lines:
//   DATE: 11/09/2026
//   VENUE: TT-Circuit Assen
//   EVENT: ADAC Hansa Racing Day
//   ALT-TEXT: ADAC Hansa Racing Day TT-Circuit Assen 2026
//   SUMMARY: optional one-line description
//
// What it writes: src/content/albums/<slug>.json, where <slug> is the
// folder name turned into a URL-safe id. The album's on-site title is
// always the folder name itself, verbatim.
//
// Safe to run again any time (e.g. after adding more photos to the
// folder, or editing info.txt) — it re-scans and rewrites the item list
// each time, but keeps any race-class tags you've hand-added to a photo
// in the JSON (matched by filename), and never touches "clip" items
// (those need a Cloudflare Stream ID, added by hand).

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v"]);

function getFlag(name) {
	const i = process.argv.indexOf(`--${name}`);
	return i === -1 ? undefined : process.argv[i + 1];
}

function slugify(name) {
	return name
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

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

// "DD/MM/YYYY" (with or without a trailing comma) -> "YYYY-MM-DD".
// Passes through anything already in YYYY-MM-DD form.
function normalizeDate(raw) {
	const value = raw.trim();
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
	const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
	if (!match) return undefined;
	const [, day, month, year] = match;
	return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// Strips a trailing comma and surrounding quotes: `"value",` -> `value`
function cleanValue(raw) {
	return raw.trim().replace(/,\s*$/, "").replace(/^"(.*)"$/, "$1").trim();
}

function parseInfoFile(infoPath) {
	if (!existsSync(infoPath)) return {};
	const text = readFileSync(infoPath, "utf8");
	const fields = {};
	for (const line of text.split(/\r?\n/)) {
		const match = line.match(/^\s*([A-Za-z-]+)\s*:\s*(.*)$/);
		if (!match) continue;
		const key = match[1].toLowerCase().replace(/-/g, "");
		fields[key] = cleanValue(match[2]);
	}
	return fields;
}

function main() {
	const rootArg = getFlag("root");
	const folderArg = getFlag("folder");
	if (!rootArg || !folderArg) {
		console.error("Usage: node sync-album-folder.mjs --root <projectRoot> --folder <albumFolder>");
		process.exit(1);
	}
	// path.resolve also normalizes away any trailing slash and "\.." runs,
	// which matters here: a batch file's %~dp0 always ends in a backslash,
	// and a Windows quirk turns `"...\"` into a mangled argument when quoted.
	const root = path.resolve(rootArg);
	const folder = path.resolve(folderArg);

	const folderName = path.basename(folder);
	const slug = slugify(folderName);
	if (!slug) {
		console.error(`Couldn't derive a usable name from folder "${folderName}".`);
		process.exit(1);
	}

	const info = parseInfoFile(path.join(folder, "info.txt"));
	const date = info.date ? normalizeDate(info.date) : undefined;
	if (!date) {
		console.error(
			`info.txt is missing a valid DATE (expected DD/MM/YYYY) — add a line like "DATE: 11/09/2026" and run this again.`,
		);
		process.exit(1);
	}

	const entries = readdirSync(folder, { withFileTypes: true }).filter((e) => e.isFile());
	const imageFiles = entries
		.map((e) => e.name)
		.filter((name) => IMAGE_EXTS.has(path.extname(name).toLowerCase()))
		.sort(naturalCompare);
	const videoFiles = entries.map((e) => e.name).filter((name) => VIDEO_EXTS.has(path.extname(name).toLowerCase()));

	const albumsDir = path.join(root, "src", "content", "albums");
	mkdirSync(albumsDir, { recursive: true });
	const jsonPath = path.join(albumsDir, `${slug}.json`);

	let existing = {};
	if (existsSync(jsonPath)) existing = JSON.parse(readFileSync(jsonPath, "utf8"));

	const existingBySrc = new Map();
	for (const item of existing.items ?? []) {
		if (item.type === "photo" && item.src) existingBySrc.set(item.src, item);
	}

	const alt = info.alttext ?? existing.items?.find((i) => i.alt)?.alt ?? folderName;
	const encodedFolder = encodeURIComponent(folderName);

	const photoItems = imageFiles.map((filename) => {
		const src = `/media/albums/${encodedFolder}/${encodeURIComponent(filename)}`;
		const prior = existingBySrc.get(src);
		return {
			type: "photo",
			src,
			alt: prior?.alt ?? alt,
			...(prior?.classes ? { classes: prior.classes } : {}),
		};
	});

	const clipItems = (existing.items ?? []).filter((item) => item.type === "clip");

	const seenSrcs = new Set(
		imageFiles.map((filename) => `/media/albums/${encodedFolder}/${encodeURIComponent(filename)}`),
	);
	const missing = [...existingBySrc.keys()].filter((src) => !seenSrcs.has(src));

	const album = {
		title: folderName,
		date,
		...(info.venue ? { venue: info.venue } : {}),
		...(info.summary ? { summary: info.summary } : existing.summary ? { summary: existing.summary } : {}),
		items: [...photoItems, ...clipItems],
	};

	writeFileSync(jsonPath, `${JSON.stringify(album, null, "\t")}\n`);

	console.log(`Done! "${folderName}" is now on the site (${photoItems.length} photo(s), ${clipItems.length} clip(s) kept).`);
	console.log(`Saved to: src/content/albums/${slug}.json`);
	if (missing.length > 0) {
		console.log(`\nNote: ${missing.length} photo(s) were in the album before but are no longer in this folder — removed from the site:`);
		for (const src of missing) console.log(`  - ${src}`);
	}
	if (videoFiles.length > 0) {
		console.log(
			`\nNote: ${videoFiles.length} video file(s) found (${videoFiles.join(", ")}) — video clips aren't handled automatically yet, ask Claude to add them once they're uploaded to Cloudflare Stream.`,
		);
	}
}

main();
