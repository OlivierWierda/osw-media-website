import { ui, defaultLang, type Lang, type UiKey } from "./ui";

export function useTranslations(lang: string | undefined) {
	const resolved: Lang = lang && lang in ui ? (lang as Lang) : defaultLang;
	return function t(key: UiKey, vars?: Record<string, string>) {
		let value: string = ui[resolved][key] ?? ui[defaultLang][key];
		if (vars) {
			for (const [name, replacement] of Object.entries(vars)) {
				value = value.replace(`{${name}}`, replacement);
			}
		}
		return value;
	};
}
