import type { ProfileSection, SuggestionPriority } from "../api/linkedinTypes";
import type { BadgeTone } from "../components/Badge";

export const SECTION_LABELS: Record<ProfileSection, string> = {
	PHOTO: "Foto de perfil",
	BANNER: "Banner",
	HEADLINE: "Título",
	ABOUT: "Sobre",
	CUSTOM_URL: "URL personalizada",
	EXPERIENCE: "Experiência",
	EDUCATION: "Formação",
	SKILLS: "Competências",
	CERTIFICATIONS: "Certificações",
	LANGUAGES: "Idiomas",
	PROJECTS: "Projetos",
	PUBLICATIONS: "Livros e artigos publicados",
	RECOMMENDATIONS: "Recomendações",
	FEATURED: "Em destaque",
	ACTIVITY: "Posts e atividade",
};

export const PRIORITY_LABELS: Record<SuggestionPriority, string> = {
	HIGH: "Alta",
	MEDIUM: "Média",
	LOW: "Baixa",
};

export const PRIORITY_TONES: Record<SuggestionPriority, BadgeTone> = {
	HIGH: "error",
	MEDIUM: "warning",
	LOW: "neutral",
};

export function formatCapturedAt(iso: string): string {
	return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
