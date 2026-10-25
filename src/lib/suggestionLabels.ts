const SOURCE_LABELS: Record<string, string> = {
	LINKEDIN: "LinkedIn",
	LINKEDIN_POST: "Postagem do LinkedIn",
	GUPY: "Gupy",
	PROGRAMATHOR: "Programathor",
	INFOJOBS: "InfoJobs",
	VAGAS: "Vagas.com",
	REMOTAR: "Remotar",
};

const LINK_LABELS: Record<string, string> = {
	LINKEDIN: "Abrir no LinkedIn",
	LINKEDIN_POST: "Abrir postagem",
	GUPY: "Abrir na Gupy",
	PROGRAMATHOR: "Abrir na Programathor",
	INFOJOBS: "Abrir no InfoJobs",
	VAGAS: "Abrir no Vagas.com",
	REMOTAR: "Abrir no Remotar",
};

export function sourceLabel(source: string | undefined): string {
	return (source && SOURCE_LABELS[source]) || "Vaga";
}

export function openLinkLabel(source: string | undefined): string {
	return (source && LINK_LABELS[source]) || "Abrir vaga";
}

const SITE_PATTERNS: { host: RegExp; label: string }[] = [
	{ host: /(^|\.)linkedin\.com$/, label: "LinkedIn" },
	{ host: /(^|\.)gupy\.io$/, label: "Gupy" },
	{ host: /(^|\.)programathor\.com\.br$/, label: "Programathor" },
	{ host: /(^|\.)infojobs\.com\.br$/, label: "InfoJobs" },
	{ host: /(^|\.)vagas\.com\.br$/, label: "Vagas.com" },
	{ host: /(^|\.)remotar\.com\.br$/, label: "Remotar" },
];

const LINKEDIN_POST_PATH = /^\/(posts|feed\/update|pulse)\//;

export function siteLabel(url: string | undefined): string | null {
	if (!url) {
		return null;
	}
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return null;
	}
	const site = SITE_PATTERNS.find((pattern) => pattern.host.test(parsed.hostname));
	if (!site) {
		return null;
	}
	return site.label === "LinkedIn" && LINKEDIN_POST_PATH.test(parsed.pathname) ? "Postagem do LinkedIn" : site.label;
}
