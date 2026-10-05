import { parseInline, serializeSpans } from "./richText";
import type { KeyValueLine, ResumeSection, StructuredResume, TextSpan } from "../api/types";

type SectionPreset = Pick<ResumeSection, "title" | "semanticType" | "kind">;

export const SECTION_PRESETS: SectionPreset[] = [
	{ title: "Objetivo", semanticType: "OTHER", kind: "PARAGRAPH" },
	{ title: "Resumo profissional", semanticType: "SUMMARY", kind: "PARAGRAPH" },
	{ title: "Experiência profissional", semanticType: "EXPERIENCE", kind: "ENTRIES" },
	{ title: "Formação acadêmica", semanticType: "EDUCATION", kind: "ENTRIES" },
	{ title: "Competências técnicas", semanticType: "SKILLS", kind: "KEY_VALUE" },
	{ title: "Projetos", semanticType: "PROJECTS", kind: "ENTRIES" },
	{ title: "Certificações", semanticType: "CERTIFICATIONS", kind: "RICH_LINES" },
	{ title: "Idiomas", semanticType: "LANGUAGES", kind: "KEY_VALUE" },
	{ title: "Outras informações", semanticType: "OTHER", kind: "RICH_LINES" },
];

const STARTER_SECTIONS = ["SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS", "LANGUAGES"];

export function emptySection(preset: SectionPreset): ResumeSection {
	return { ...preset, paragraph: "", keyValues: [], richLines: [], entries: [] };
}

export function starterResume(): StructuredResume {
	return {
		name: "",
		headline: "",
		sections: SECTION_PRESETS.filter((preset) => STARTER_SECTIONS.includes(preset.semanticType ?? "")).map(emptySection),
		removedSkills: [],
	};
}

export function plainText(spans: TextSpan[]): string {
	return spans.map((span) => span.text ?? "").join("");
}

const KEY_VALUE_SEPARATOR = ":";

function linesKeepingBreaks(text: string): string[] {
	const lines = text.split("\n").map((line) => line.trim());
	const first = lines.findIndex((line) => line.length > 0);
	if (first < 0) {
		return [];
	}
	const last = lines.length - 1 - [...lines].reverse().findIndex((line) => line.length > 0);
	return lines.slice(first, last + 1);
}

export function spansToMarkup(spans: TextSpan[]): string {
	return serializeSpans(spans);
}

export function markupToSpans(line: string): TextSpan[] {
	return parseInline(line);
}

export function richLinesToText(lines: TextSpan[][]): string {
	return lines.map(spansToMarkup).join("\n");
}

export function textToRichLines(text: string): TextSpan[][] {
	return linesKeepingBreaks(text).map(markupToSpans);
}

export function keyValuesToText(lines: KeyValueLine[]): string {
	return lines
		.map((line) => (line.label ? `${line.label}${KEY_VALUE_SEPARATOR} ${line.value ?? ""}` : (line.value ?? "")))
		.join("\n");
}

export function textToKeyValues(text: string): KeyValueLine[] {
	return linesKeepingBreaks(text).map((line) => {
		const separator = line.indexOf(KEY_VALUE_SEPARATOR);
		return separator < 0
			? { label: "", value: line }
			: { label: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
	});
}
