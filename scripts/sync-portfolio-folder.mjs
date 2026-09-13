#!/usr/bin/env node
// Turns the photos in public/media/portfolio/ into src/content/portfolio.json.
// Not meant to be run by hand — "Update Website.bat" in that same folder
// calls this with the right paths already filled in.
//
// What it reads: public/media/portfolio/info.txt — plain "KEY: value" lines:
//   TAGLINE: A selection of the best work.
//   ALT-TEXT: OSW Media portfolio
//
// What it writes: src/content/portfolio.json — the single portfolio page,
// not a per-event collection, so there's no title/date/venue like albums
// have, just a tagline and the item list.
//
// Safe to run again any time — re-scans and rewrites the item list each
// time, but keeps any hand-added alt/classes on a photo already listed
// (matched by filename), and never touches "clip" items (those need a
// Cloudflare Stream ID, added by hand).

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v"]);

function getFlag(name) {
	const i = process.argv.indexOf(`--${name}`);
	return i === -1 ? undefined : process.argv[i + 1];
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
		console.error("Usage: node sync-portfolio-folder.mjs --root <projectRoot> --folder <portfolioFolder>");
		process.exit(1);
	}
	const root = path.resolve(rootArg);
	const folder = path.resolve(folderArg);

	const info = parseInfoFile(path.join(folder, "info.txt"));

	const entries = readdirSync(folder, { withFileTypes: true }).filter((e) => e.isFile());
	const imageFiles = entries
		.map((e) => e.name)
		.filter((name) => IMAGE_EXTS.has(path.extname(name).toLowerCase()))
		.sort(naturalCompare);
	const videoFiles = entries.map((e) => e.name).filter((name) => VIDEO_EXTS.has(path.extname(name).toLowerCase()));

	const contentDir = path.join(root, "src", "content");
	mkdirSync(contentDir, { recursive: true });
	const jsonPath = path.join(contentDir, "portfolio.json");

	let existing = {};
	if (existsSync(jsonPath)) existing = JSON.parse(readFileSync(jsonPath, "utf8"));

	const existingBySrc = new Map();
	for (const item of existing.items ?? []) {
		if (item.type === "photo" && item.src) existingBySrc.set(item.src, item);
	}

	const tagline = info.tagline ?? existing.tagline ?? "A selection of the best work.";
	const alt = info.alttext ?? existing.items?.find((i) => i.alt)?.alt ?? "Portfolio photo";

	const photoItems = imageFiles.map((filename) => {
		const src = `/media/portfolio/${encodeURIComponent(filename)}`;
		const prior = existingBySrc.get(src);
		return {
			type: "photo",
			src,
			alt: prior?.alt ?? alt,
			...(prior?.classes ? { classes: prior.classes } : {}),
		};
	});

	const clipItems = (existing.items ?? []).filter((item) => item.type === "clip");

	const seenSrcs = new Set(imageFiles.map((filename) => `/media/portfolio/${encodeURIComponent(filename)}`));
	const missing = [...existingBySrc.keys()].filter((src) => !seenSrcs.has(src));

	const portfolio = { tagline, items: [...photoItems, ...clipItems] };
	writeFileSync(jsonPath, `${JSON.stringify(portfolio, null, "\t")}\n`);

	console.log(`Done! Portfolio updated (${photoItems.length} photo(s), ${clipItems.length} clip(s) kept).`);
	console.log(`Saved to: src/content/portfolio.json`);
	if (missing.length > 0) {
		console.log(`\nNote: ${missing.length} photo(s) were on the portfolio before but are no longer in this folder — removed from the site:`);
		for (const src of missing) console.log(`  - ${src}`);
	}
	if (videoFiles.length > 0) {
		console.log(
			`\nNote: ${videoFiles.length} video file(s) found (${videoFiles.join(", ")}) — video clips aren't handled automatically yet, ask Claude to add them once they're uploaded to Cloudflare Stream.`,
		);
	}
}

main();
