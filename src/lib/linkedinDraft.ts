export const SECTION_KEYS = [
	"headline",
	"about",
	"experiences",
	"educations",
	"skills",
	"certifications",
	"languages",
	"projects",
	"publications",
	"recommendations",
	"featured",
	"recentActivity",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export type DraftProfile = Partial<Record<SectionKey, unknown>> & Record<string, unknown>;
export type LinkedInDraft = { profile: DraftProfile; updatedAt: number };
export type ReaderCapture = { page?: string; profile?: DraftProfile };

export const DRAFT_SECTION_LABELS: Record<SectionKey, string> = {
	headline: "Título",
	about: "Sobre",
	experiences: "Experiência",
	educations: "Formação",
	skills: "Competências",
	certifications: "Certificações",
	languages: "Idiomas",
	projects: "Projetos",
	publications: "Livros e artigos publicados",
	recommendations: "Recomendações",
	featured: "Em destaque",
	recentActivity: "Posts e atividade",
};

const DETAIL_PAGES: Partial<Record<SectionKey, string>> = {
	experiences: "experience",
	educations: "education",
	skills: "skills",
	certifications: "certifications",
	languages: "languages",
	projects: "projects",
	publications: "publications",
	recommendations: "recommendations",
};

const STORAGE_KEY = "linkedin-bookmarklet-draft";
const MAX_AGE_MS = 30 * 60 * 1000;

function hasValue(value: unknown): boolean {
	return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== "";
}

export function emptyDraft(): LinkedInDraft {
	return { profile: {}, updatedAt: 0 };
}

export function mergeCapture(draft: LinkedInDraft, capture: ReaderCapture, now = Date.now()): LinkedInDraft {
	const profile: DraftProfile = { ...draft.profile };
	for (const [key, value] of Object.entries(capture.profile ?? {})) {
		if (hasValue(value)) {
			profile[key] = value;
		}
	}
	return { profile, updatedAt: now };
}

export function capturedSections(draft: LinkedInDraft): SectionKey[] {
	return SECTION_KEYS.filter((key) => hasValue(draft.profile[key]));
}

export function missingSections(draft: LinkedInDraft): SectionKey[] {
	return SECTION_KEYS.filter((key) => !hasValue(draft.profile[key]));
}

export function detailUrl(profileUrl: unknown, key: SectionKey): string | null {
	const page = DETAIL_PAGES[key];
	if (!page || typeof profileUrl !== "string" || !/^https:\/\/([a-z]+\.)?linkedin\.com\/in\//.test(profileUrl)) {
		return null;
	}
	return `${profileUrl.replace(/\/+$/, "")}/details/${page}/`;
}

export function parseFragment(hash: string): ReaderCapture | null {
	const encoded = hash.replace(/^#/, "");
	if (!encoded) {
		return null;
	}
	try {
		const json = decodeURIComponent(escape(atob(encoded)));
		const parsed: unknown = JSON.parse(json);
		if (parsed && typeof parsed === "object" && "profile" in parsed) {
			return parsed as ReaderCapture;
		}
		return null;
	} catch {
		return null;
	}
}

export function loadDraft(now = Date.now()): LinkedInDraft {
	try {
		const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as LinkedInDraft | null;
		return stored && now - stored.updatedAt < MAX_AGE_MS ? stored : emptyDraft();
	} catch {
		return emptyDraft();
	}
}

export function saveDraft(draft: LinkedInDraft | null) {
	try {
		if (draft === null) {
			window.localStorage.removeItem(STORAGE_KEY);
		} else {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
		}
	} catch {
		return;
	}
}
