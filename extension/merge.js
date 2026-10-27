const PROFILE_SECTIONS = [
	'headline',
	'about',
	'experiences',
	'educations',
	'skills',
	'certifications',
	'languages',
	'projects',
	'publications',
	'recommendations',
	'featured',
	'recentActivity',
]

export const SECTION_LABELS = {
	headline: 'Título',
	about: 'Sobre',
	experiences: 'Experiência',
	educations: 'Formação',
	skills: 'Competências',
	certifications: 'Certificações',
	languages: 'Idiomas',
	projects: 'Projetos',
	publications: 'Livros e artigos publicados',
	recommendations: 'Recomendações',
	featured: 'Em destaque',
	recentActivity: 'Posts e atividade',
	photo: 'Foto',
	banner: 'Banner',
}

function hasValue(value) {
	return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== ''
}

export function emptyDraft() {
	return { profile: {}, photoUrl: null, bannerUrl: null }
}

export function mergeCapture(draft, capture) {
	const profile = { ...draft.profile }
	for (const [key, value] of Object.entries(capture.profile)) {
		if (hasValue(value)) {
			profile[key] = value
		}
	}
	return {
		profile,
		photoUrl: capture.photoUrl || draft.photoUrl,
		bannerUrl: capture.bannerUrl || draft.bannerUrl,
	}
}

export function capturedSections(draft) {
	const sections = PROFILE_SECTIONS.filter((key) => hasValue(draft.profile[key]))
	return [...sections, ...(draft.photoUrl ? ['photo'] : []), ...(draft.bannerUrl ? ['banner'] : [])]
}

export function missingSections(draft) {
	const captured = new Set(capturedSections(draft))
	return [...PROFILE_SECTIONS, 'photo', 'banner'].filter((key) => !captured.has(key))
}
