import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// An album is one event, or one day of a multi-day event (e.g.
// "Spa 24H — Day 1", "Spa 24H — Day 2" as separate album entries).
// Each album holds a single mixed gallery of photos + video clips.
const albums = defineCollection({
	loader: glob({ pattern: "**/*.json", base: "./src/content/albums" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		venue: z.string().optional(),
		summary: z.string().optional(),
		items: z.array(
			z.object({
				type: z.enum(["photo", "clip"]),
				// Photo: path to the watermarked image (src/assets or public).
				// Left empty for placeholder items until real assets exist.
				src: z.string().optional(),
				// Clip: Cloudflare Stream video UID. Left empty -> placeholder.
				streamId: z.string().optional(),
				alt: z.string().optional(),
				// Race class tags (e.g. "GT3", "TCR"), set by the site owner per
				// item. Not surfaced as a filter yet — the schema just carries it
				// so a class/tag pill filter can be added later without a
				// content migration.
				classes: z.array(z.string()).optional(),
			}),
		),
	}),
});

export const collections = { albums };
