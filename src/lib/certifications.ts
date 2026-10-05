import type { TextSpan } from "../api/types";

export type Certification = { name: string; institution: string; year: string };

const NAME_SEPARATOR = " — ";
const YEAR_SEPARATOR = " | ";
const YEAR_PATTERN = /^\d{4}$/;

export function parseCertification(line: string): Certification {
	const yearAt = line.lastIndexOf(YEAR_SEPARATOR);
	if (yearAt >= 0 && YEAR_PATTERN.test(line.slice(yearAt + YEAR_SEPARATOR.length).trim())) {
		return { ...splitNameAndInstitution(line.slice(0, yearAt)), year: line.slice(yearAt + YEAR_SEPARATOR.length).trim() };
	}
	const parts = line.split(NAME_SEPARATOR).map((part) => part.trim());
	if (parts.length >= 2 && YEAR_PATTERN.test(parts[parts.length - 1])) {
		return { ...splitNameAndInstitution(parts.slice(0, -1).join(NAME_SEPARATOR)), year: parts[parts.length - 1] };
	}
	return { ...splitNameAndInstitution(line), year: "" };
}

function splitNameAndInstitution(text: string): Pick<Certification, "name" | "institution"> {
	const separatorAt = text.indexOf(NAME_SEPARATOR);
	return separatorAt < 0
		? { name: text.trim(), institution: "" }
		: { name: text.slice(0, separatorAt).trim(), institution: text.slice(separatorAt + NAME_SEPARATOR.length).trim() };
}

export function formatCertification({ name, institution, year }: Certification): string {
	return certificationSpans({ name, institution, year })
		.map((span) => span.text ?? "")
		.join("");
}

function certificationSpans({ name, institution, year }: Certification): TextSpan[] {
	const title = [name, institution].map((part) => part.trim()).filter(Boolean).join(NAME_SEPARATOR);
	const spans: TextSpan[] = [];
	if (title) {
		spans.push({ text: title, bold: true });
	}
	if (year.trim()) {
		spans.push({ text: title ? `${YEAR_SEPARATOR}${year.trim()}` : year.trim(), bold: false });
	}
	return spans.length > 0 ? spans : [{ text: "", bold: false }];
}

export function certificationsFromLines(lines: TextSpan[][]): Certification[] {
	return lines.map((spans) => parseCertification(spans.map((span) => span.text ?? "").join("")));
}

export function certificationsToLines(items: Certification[]): TextSpan[][] {
	return items.map(certificationSpans);
}

export function formatCertificationLine(line: TextSpan[]): TextSpan[] {
	if (line.some((span) => span.bold) || line.every((span) => !(span.text ?? "").trim())) {
		return line;
	}
	const [formatted] = certificationsToLines([parseCertification(line.map((span) => span.text ?? "").join(""))]);
	return formatted;
}
