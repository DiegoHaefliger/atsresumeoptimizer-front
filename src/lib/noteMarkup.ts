import type { TextSpan } from "../api/types";
import { parseInline, serializeSpans } from "./richText";

const BULLET = /^- (.*)$/;
const NUMBERED = /^\d+\. (.*)$/;
const SEPARATOR = "---";
const NON_BREAKING_SPACE = / /g;

type Style = { bold: boolean; italic: boolean; underline: boolean };

function escapeHtml(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineHtml(text: string): string {
	return parseInline(text)
		.map((span) => {
			let html = escapeHtml(span.text ?? "");
			if (span.underline) html = `<u>${html}</u>`;
			if (span.italic) html = `<em>${html}</em>`;
			if (span.bold) html = `<strong>${html}</strong>`;
			return html;
		})
		.join("");
}

function listHtml(lines: string[], start: number, pattern: RegExp, tag: "ul" | "ol"): { html: string; next: number } {
	let html = `<${tag}>`;
	let index = start;
	while (index < lines.length && pattern.test(lines[index])) {
		html += `<li>${inlineHtml(pattern.exec(lines[index])?.[1] ?? "")}`;
		index++;
		if (tag === "ol" && index < lines.length && BULLET.test(lines[index])) {
			const nested = listHtml(lines, index, BULLET, "ul");
			html += nested.html;
			index = nested.next;
		}
		html += "</li>";
	}
	return { html: `${html}</${tag}>`, next: index };
}

export function markupToHtml(markup: string, separators = true): string {
	const lines = markup.split("\n");
	let html = "";
	let index = 0;
	while (index < lines.length) {
		const line = lines[index];
		if (NUMBERED.test(line)) {
			const list = listHtml(lines, index, NUMBERED, "ol");
			html += list.html;
			index = list.next;
		} else if (BULLET.test(line)) {
			const list = listHtml(lines, index, BULLET, "ul");
			html += list.html;
			index = list.next;
		} else if (separators && line === SEPARATOR) {
			html += "<hr>";
			index++;
		} else {
			html += `<div>${line ? inlineHtml(line) : "<br>"}</div>`;
			index++;
		}
	}
	return html;
}

function isList(node: Node): node is HTMLUListElement | HTMLOListElement {
	return node instanceof HTMLUListElement || node instanceof HTMLOListElement;
}

function styleOf(element: HTMLElement, inherited: Style): Style {
	const tag = element.tagName;
	const weight = element.style.fontWeight;
	return {
		bold: inherited.bold || tag === "B" || tag === "STRONG" || weight === "bold" || Number(weight) >= 600,
		italic: inherited.italic || tag === "I" || tag === "EM" || element.style.fontStyle === "italic",
		underline: inherited.underline || tag === "U" || element.style.textDecoration.includes("underline"),
	};
}

function collectSpans(nodes: Iterable<Node>, style: Style, spans: TextSpan[]): void {
	for (const node of nodes) {
		if (node instanceof Text) {
			spans.push({ text: (node.textContent ?? "").replace(NON_BREAKING_SPACE, " "), ...style });
		} else if (node instanceof HTMLElement && !isList(node)) {
			if (node.tagName === "BR") {
				spans.push({ text: "\n", ...style });
			} else {
				collectSpans(node.childNodes, styleOf(node, style), spans);
			}
		}
	}
}

function spanLines(spans: TextSpan[]): string[] {
	if (spans.at(-1)?.text === "\n") {
		spans = spans.slice(0, -1);
	}
	const lines: TextSpan[][] = [[]];
	for (const span of spans) {
		const parts = (span.text ?? "").split("\n");
		parts.forEach((part, position) => {
			if (position > 0) lines.push([]);
			lines[lines.length - 1].push({ ...span, text: part });
		});
	}
	return lines.map((line) => serializeSpans(line));
}

const PLAIN: Style = { bold: false, italic: false, underline: false };

function listMarkup(list: HTMLUListElement | HTMLOListElement, lines: string[]): void {
	const numbered = list.tagName === "OL";
	let position = 1;
	for (const item of Array.from(list.children)) {
		const spans: TextSpan[] = [];
		collectSpans(item.childNodes, PLAIN, spans);
		const [first, ...rest] = spanLines(spans);
		lines.push(`${numbered ? `${position}. ` : "- "}${first}`);
		lines.push(...rest);
		position++;
		for (const nested of Array.from(item.children).filter(isList)) {
			listMarkup(nested, lines);
		}
	}
}

function blockMarkup(nodes: Node[], lines: string[]): void {
	let loose: Node[] = [];
	const flush = () => {
		if (loose.length > 0) {
			const spans: TextSpan[] = [];
			collectSpans(loose, PLAIN, spans);
			lines.push(...spanLines(spans));
			loose = [];
		}
	};
	for (const node of nodes) {
		if (isList(node)) {
			flush();
			listMarkup(node, lines);
		} else if (node instanceof HTMLHRElement) {
			flush();
			lines.push(SEPARATOR);
		} else if (node instanceof HTMLElement && (node.tagName === "DIV" || node.tagName === "P")) {
			flush();
			const children = Array.from(node.childNodes);
			if (children.some((child) => isList(child) || child instanceof HTMLHRElement || (child instanceof HTMLElement && child.tagName === "DIV"))) {
				blockMarkup(children, lines);
			} else {
				const spans: TextSpan[] = [];
				collectSpans(children, PLAIN, spans);
				lines.push(...spanLines(spans));
			}
		} else {
			loose.push(node);
		}
	}
	flush();
}

export function htmlToMarkup(root: HTMLElement): string {
	const lines: string[] = [];
	blockMarkup(Array.from(root.childNodes), lines);
	return lines.join("\n");
}
