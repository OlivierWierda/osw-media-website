// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	i18n: {
		defaultLocale: "en",
		locales: ["en", "nl"],
		routing: {
			// English stays un-prefixed at "/" (the default); Dutch lives
			// under "/nl/". No auto-detection/redirect — always defaults to
			// English, the visitor picks Dutch explicitly via the nav buttons.
			prefixDefaultLocale: false,
		},
	},
});
