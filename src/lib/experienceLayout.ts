import type { ResumeEntry, TextSpan } from "../api/types";
import { parseInline } from "./richText";
import { plainText } from "./resumeSections";

const COMPANY_LOCATION_SEPARATOR = /\s*\|\s*/;
const LIST_MARKER = /^(?:- |\d+\. )/;

export function experienceTitle(entry: ResumeEntry): { title: string; location: string } {
	const [company = "", ...locationParts] = (entry.subheading ?? "").trim().split(COMPANY_LOCATION_SEPARATOR);
	const role = (entry.heading ?? "").trim();
	const companyName = company.trim().toLocaleUpperCase("pt-BR");
	return {
		title: companyName && role ? `${companyName} — ${role}` : companyName || role,
		location: locationParts.join(" | ").trim(),
	};
}

export function experiencePeriod(entry: ResumeEntry): string {
	return (entry.period ?? "").trim().replace(" - ", " – ");
}

export function experienceBulletSpans(entry: ResumeEntry): TextSpan[][] {
	const contextLines = (entry.context ?? "")
		.split("\n")
		.map((line) => line.trim().replace(LIST_MARKER, ""))
		.filter(Boolean)
		.map(parseInline);
	return [...(entry.bullets ?? []), ...contextLines, ...(entry.results ?? [])].filter((line) => plainText(line).trim() !== "");
}

export function educationHeadline(entry: ResumeEntry): { title: string; period: string } {
	const course = (entry.heading ?? "").trim();
	const institution = (entry.subheading ?? "").trim();
	return { title: course && institution ? `${course} — ${institution}` : course || institution, period: experiencePeriod(entry) };
}
