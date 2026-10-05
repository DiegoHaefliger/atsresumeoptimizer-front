import type { OriginalSection } from "../api/types";
import { normalizedLabel, similarity } from "./textDiff";

const BULLET_START = /^[•‣◦●▪○*-]\s+|^\d+[.)]\s+/;
const LABELED_LINE = /^([^:,]{1,40}):\s*(.*)$/;
const SENTENCE_END = /[.!?]$/;
const INVISIBLE_CHARS = /\u200B|\u200C|\u200D|\uFEFF|\u2060/g;
const MIN_BULLET_SIMILARITY = 0.3;
const SUMMARY_TITLES = ["resumo", "perfil", "sobre", "summary", "objetivo"];

export type OriginalResume = {
	bullets: string[];
	labeledLines: Map<string, string>;
	sections: { title: string; text: string }[];
};

function cleanLine(line: string): string {
	return line.replace(INVISIBLE_CHARS, "").trim();
}

export function parseOriginal(sections: OriginalSection[]): OriginalResume {
	const bullets: string[] = [];
	const labeledLines = new Map<string, string>();
	const parsed = sections.map((section) => ({ title: section.title ?? "", text: section.text ?? "" }));

	for (const section of parsed) {
		let current: string | null = null;
		let label: string | null = null;
		const flush = () => {
			if (current !== null) {
				bullets.push(current);
				current = null;
			}
		};
		for (const raw of section.text.split("\n")) {
			const line = cleanLine(raw);
			if (!line) {
				continue;
			}
			if (BULLET_START.test(line)) {
				flush();
				current = line.replace(BULLET_START, "");
				continue;
			}
			if (current !== null && !SENTENCE_END.test(current)) {
				current += ` ${line}`;
				continue;
			}
			flush();
			const labeled = LABELED_LINE.exec(line);
			if (labeled) {
				label = normalizedLabel(labeled[1]);
				labeledLines.set(label, labeled[2]);
			} else if (label !== null) {
				labeledLines.set(label, `${labeledLines.get(label)} ${line}`);
			}
		}
		flush();
	}
	return { bullets, labeledLines, sections: parsed };
}

export const EMPTY_ORIGINAL = parseOriginal([]);

export function closestOriginalBullet(original: OriginalResume, text: string): string | null {
	let best: string | null = null;
	let bestScore = MIN_BULLET_SIMILARITY;
	for (const candidate of original.bullets) {
		const score = similarity(candidate, text);
		if (score >= bestScore) {
			best = candidate;
			bestScore = score;
		}
	}
	return best;
}

export function originalSectionText(original: OriginalResume, title: string, isSummary: boolean): string | null {
	const wanted = normalizedLabel(title);
	const match =
		original.sections.find((section) => normalizedLabel(section.title) === wanted) ??
		(isSummary
			? original.sections.find((section) =>
					SUMMARY_TITLES.some((candidate) => normalizedLabel(section.title).includes(candidate)),
				)
			: undefined);
	return match ? match.text.replace(/\s+/g, " ").trim() : null;
}
