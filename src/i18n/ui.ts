// All static site copy (nav, buttons, headings, the portfolio tagline).
// Content collection data — album titles, venues, summaries — is NOT
// translated here; that's real event data typed in once, in English, via
// info.txt/the JSON. Translating that per-item would mean maintaining two
// copies of every album description, which isn't worth it until there's a
// reason a Dutch-only description matters.
//
// NOTE for later: editing copy means finding the right dotted key in a
// TypeScript object — fine for a handful of strings, increasingly janky
// as the site grows. A cleaner setup would be a plain-text copy file per
// language (or one file with clearly separated EN/NL sections) that a
// non-developer can open and edit directly, with this file reduced to
// just mapping those entries onto the keys components ask for. Worth
// doing once this dictionary gets much bigger; not done now.
export const defaultLang = "en" as const;

export const languages = {
	en: "English",
	nl: "Nederlands",
} as const;

export const ui = {
	en: {
		"nav.portfolio": "Portfolio",
		"nav.albums": "Albums",
		"nav.contact": "Contact",
		"footer.text": "OSW's Photo Video",

		"home.eyebrow": "A-to-Z Motorsport Media Production & Content Creation",
		"home.title": "A different perspective, trackside.",
		"home.lede":
			"With a 30-year+ fascination for cars, and specifically motorsport, sim and RC racing, as a participant, fan, and coach, I am in a unique position to make the sport more accessible and appealing.",
		"home.cta.contact": "Contact",
		"home.cta.albums": "View albums",
		"home.about.subhead": "About",
		"home.about.p1":
			"As an avid simracer, I look at the track with a mixed perspective, as a driver, as an engineer, as a coach, and as a passionate fan.",
		"home.about.p2": "But real motorsport is not just seen or heard, it is an energy you can feel.",
		"home.about.p3":
			"The vision to share this with others, morphed into OSW's Photo Video, where I focus on bringing the atmosphere of the track, the cars, and the paddock to life.",
		"home.about.p4": "Capturing and sharing the passion, that's the goal.",

		"portfolio.title": "Portfolio",
		"portfolio.tagline": "A selection of the best work.",

		"albums.title": "Albums",
		"albums.intro": "One album per event, or per day for multi-day events.",
		"albums.photo": "photo",
		"albums.photos": "photos",
		"albums.clip": "clip",
		"albums.clips": "clips",

		"albumDetail.back": "← All albums",

		"gallery.all": "All",
		"gallery.photos": "Photos",
		"gallery.clips": "Video Clips",
		"gallery.contact": "Contact me",
		"gallery.view": "View",
		"gallery.orderSubject": "Order inquiry: {label}",
		"gallery.photoPlaceholder": "Photo {n}",
		"gallery.clipPlaceholder": "Video Clip {n}",
	},
	nl: {
		"nav.portfolio": "Portfolio",
		"nav.albums": "Albums",
		"nav.contact": "Contact",
		"footer.text": "OSW's Photo Video",

		"home.eyebrow": "Motorsport Media Productie & Contentcreatie van A tot Z",
		"home.title": "Een ander perspectief, trackside.",
		"home.lede":
			"Met een fascinatie voor auto's van meer dan 30 jaar, en specifiek voor motorsport, simracen en RC-racen, als deelnemer, fan en coach, sta ik in een unieke positie om de sport toegankelijker en aantrekkelijker te maken.",
		"home.cta.contact": "Contact",
		"home.cta.albums": "Bekijk albums",
		"home.about.subhead": "Over mij",
		"home.about.p1":
			"Als fervent simracer kijk ik met een gemengd perspectief naar de baan: als coureur, als engineer, als coach, en als gepassioneerde fan.",
		"home.about.p2": "Maar echte motorsport zie of hoor je niet alleen, het is een energie die je voelt.",
		"home.about.p3":
			"De visie om dit met anderen te delen, groeide uit tot OSW's Photo Video, waarbij ik me richt op het tot leven brengen van de sfeer van de baan, de auto's en de paddock.",
		"home.about.p4": "Die passie vastleggen en delen, dat is het doel.",

		"portfolio.title": "Portfolio",
		"portfolio.tagline": "Een selectie van het beste werk.",

		"albums.title": "Albums",
		"albums.intro": "Eén album per evenement, of per dag bij evenementen van meerdere dagen.",
		"albums.photo": "foto",
		"albums.photos": "foto's",
		"albums.clip": "clip",
		"albums.clips": "clips",

		"albumDetail.back": "← Alle albums",

		"gallery.all": "Alles",
		"gallery.photos": "Foto's",
		"gallery.clips": "Videoclips",
		"gallery.contact": "Neem contact op",
		"gallery.view": "Bekijk",
		"gallery.orderSubject": "Bestelaanvraag: {label}",
		"gallery.photoPlaceholder": "Foto {n}",
		"gallery.clipPlaceholder": "Videoclip {n}",
	},
} as const;

export type Lang = keyof typeof ui;
export type UiKey = keyof (typeof ui)[typeof defaultLang];
