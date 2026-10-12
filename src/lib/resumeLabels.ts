import type { ResumeSummary, ResumeVersionSummary } from "../api/types";

const ADAPTED_TITLE_SEPARATOR = " · adaptado para ";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function formatDate(value?: string): string {
	return value ? dateFormat.format(new Date(value)) : "";
}

export function versionLabel(version: ResumeVersionSummary): string {
	return [`Versão ${version.number}`, formatDate(version.createdAt)].filter(Boolean).join(" · ");
}

export function resumeMeta(resume: ResumeSummary): string {
	const versions = resume.versions ?? [];
	const count = `${versions.length} ${versions.length === 1 ? "versão" : "versões"}`;
	return `${count} · última em ${formatDate(versions[0]?.createdAt)}`;
}

export function splitByOrigin(resumes: ResumeSummary[]): { base: ResumeSummary[]; adapted: ResumeSummary[] } {
	return {
		base: resumes.filter((resume) => resume.origin !== "ADAPTED"),
		adapted: resumes.filter((resume) => resume.origin === "ADAPTED"),
	};
}

export function adaptedBaseTitle(title: string | undefined): string {
	return (title ?? "Currículo").split(ADAPTED_TITLE_SEPARATOR)[0];
}

export function generatedMeta(resume: ResumeSummary): string {
	const versions = resume.versions ?? [];
	const extra = versions.length > 1 ? ` · ${versions.length} versões` : "";
	return `Gerado em ${formatDate(resume.createdAt ?? versions[0]?.createdAt)}${extra}`;
}
