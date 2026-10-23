import type { TextSpan } from "../api/types";

const BLOCK_TAGS = new Set(["P", "DIV", "LI", "UL", "OL"]);
const BOLD_WEIGHT_MIN = 600;

type Style = { bold: boolean; italic: boolean; underline: boolean };

export function escapeHtml(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function spansToHtml(spans: TextSpan[]): string {
	return spans
		.map((span) => {
			let html = escapeHtml(span.text ?? "");
			if (!html) {
				return "";
			}
			if (span.underline) {
				html = `<u>${html}</u>`;
			}
			if (span.italic) {
				html = `<em>${html}</em>`;
			}
			if (span.bold) {
				html = `<strong>${html}</strong>`;
			}
			return html;
		})
		.join("");
}

export function linesToHtml(lines: TextSpan[][], tag: "p" | "li"): string {
	const rows = lines.length > 0 ? lines : [[]];
	return rows.map((line) => `<${tag}>${spansToHtml(line) || "<br>"}</${tag}>`).join("");
}

function styleOf(element: HTMLElement, inherited: Style): Style {
	const tag = element.tagName;
	const weight = element.style.fontWeight;
	return {
		bold: inherited.bold || tag === "B" || tag === "STRONG" || weight === "bold" || Number(weight) >= BOLD_WEIGHT_MIN,
		italic: inherited.italic || tag === "I" || tag === "EM" || element.style.fontStyle === "italic",
		underline: inherited.underline || tag === "U" || element.style.textDecorationLine.includes("underline"),
	};
}

function collectSpans(node: Node, style: Style, spans: TextSpan[]) {
	if (node.nodeType === Node.TEXT_NODE) {
		const text = (node.textContent ?? "").replace(/ /g, " ");
		if (text) {
			spans.push({ text, ...style });
		}
		return;
	}
	if (node instanceof HTMLElement && node.tagName !== "BR") {
		const next = styleOf(node, style);
		node.childNodes.forEach((child) => collectSpans(child, next, spans));
	}
}

function hasBlockChild(element: HTMLElement): boolean {
	return Array.from(element.children).some((child) => BLOCK_TAGS.has(child.tagName));
}

function collectLines(container: Node, lines: TextSpan[][]) {
	const inlineRun: Node[] = [];
	const flushRun = () => {
		if (inlineRun.length > 0) {
			const spans: TextSpan[] = [];
			inlineRun.forEach((node) => collectSpans(node, { bold: false, italic: false, underline: false }, spans));
			lines.push(spans);
			inlineRun.length = 0;
		}
	};
	container.childNodes.forEach((child) => {
		if (child instanceof HTMLElement && BLOCK_TAGS.has(child.tagName)) {
			flushRun();
			if (hasBlockChild(child)) {
				collectLines(child, lines);
			} else {
				const spans: TextSpan[] = [];
				collectSpans(child, { bold: false, italic: false, underline: false }, spans);
				lines.push(spans);
			}
		} else {
			inlineRun.push(child);
		}
	});
	flushRun();
}

function hasText(spans: TextSpan[]): boolean {
	return spans.some((span) => (span.text ?? "").trim() !== "");
}

export function readLines(container: HTMLElement): TextSpan[][] {
	const lines: TextSpan[][] = [];
	collectLines(container, lines);
	return lines.filter(hasText);
}

export function readPlain(element: HTMLElement): string {
	return (element.innerText ?? element.textContent ?? "").replace(/ /g, " ").replace(/\s*\n+\s*/g, " ").trim();
}
