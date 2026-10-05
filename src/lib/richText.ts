import type { TextSpan } from "../api/types";

const BOLD = "**";
const UNDERLINE = "++";
const ITALIC = "*";

export type InlineStyle = "bold" | "italic" | "underline";
export type ListKind = "bullet" | "numbered";

const STYLE_TOKENS: Record<InlineStyle, string> = { bold: BOLD, italic: ITALIC, underline: UNDERLINE };
const LIST_MARKER = /^(- |\d+\. )/;
const BULLET_PREFIX = "- ";

export type TextEdit = { value: string; start: number; end: number };

function tokenAt(text: string, position: number): string | null {
	if (text.startsWith(BOLD, position)) {
		return BOLD;
	}
	if (text.startsWith(UNDERLINE, position)) {
		return UNDERLINE;
	}
	return text.startsWith(ITALIC, position) ? ITALIC : null;
}

function isSpace(character: string | undefined): boolean {
	return character === undefined || /\s/.test(character);
}

function canToggle(text: string, position: number, token: string, active: boolean): boolean {
	if (active) {
		return position > 0 && !isSpace(text[position - 1]);
	}
	const next = position + token.length;
	if (isSpace(text[next])) {
		return false;
	}
	for (let close = text.indexOf(token, next); close >= 0; close = text.indexOf(token, close + 1)) {
		if (close > next && !isSpace(text[close - 1])) {
			return true;
		}
	}
	return false;
}

export function parseInline(text: string): TextSpan[] {
	const spans: TextSpan[] = [];
	const active = { bold: false, italic: false, underline: false };
	let buffer = "";
	const flush = () => {
		if (buffer) {
			spans.push({ text: buffer, bold: active.bold, italic: active.italic, underline: active.underline });
			buffer = "";
		}
	};
	let position = 0;
	while (position < text.length) {
		const token = tokenAt(text, position);
		const style = (Object.keys(STYLE_TOKENS) as InlineStyle[]).find((key) => STYLE_TOKENS[key] === token);
		if (token && style && canToggle(text, position, token, active[style])) {
			flush();
			active[style] = !active[style];
			position += token.length;
			continue;
		}
		buffer += text[position];
		position++;
	}
	flush();
	return spans.length > 0 ? spans : [{ text: "", bold: false, italic: false, underline: false }];
}

const STYLE_ORDER: InlineStyle[] = ["bold", "italic", "underline"];

export function serializeSpans(spans: TextSpan[]): string {
	let output = "";
	const open: InlineStyle[] = [];

	const closeStyles = (styles: InlineStyle[]) => {
		const trailing = /\s*$/.exec(output)?.[0] ?? "";
		output = output.slice(0, output.length - trailing.length);
		for (const style of styles) {
			output += STYLE_TOKENS[style];
			open.splice(open.indexOf(style), 1);
		}
		output += trailing;
	};

	for (const span of spans) {
		const text = span.text ?? "";
		if (!text) {
			continue;
		}
		const wanted = STYLE_ORDER.filter((style) => span[style]);
		const stale = open.filter((style) => !wanted.includes(style)).reverse();
		const fresh = wanted.filter((style) => !open.includes(style));
		if (stale.length > 0) {
			closeStyles(stale);
		}
		const leading = /^\s*/.exec(text)?.[0] ?? "";
		output += leading;
		for (const style of fresh) {
			output += STYLE_TOKENS[style];
			open.push(style);
		}
		output += text.slice(leading.length);
	}
	closeStyles([...open].reverse());
	return output;
}

export function toggleStyle(value: string, start: number, end: number, style: InlineStyle): TextEdit {
	const token = STYLE_TOKENS[style];
	const selected = value.slice(start, end);
	const wrapped =
		value.slice(start - token.length, start) === token && value.slice(end, end + token.length) === token;
	if (wrapped) {
		return {
			value: value.slice(0, start - token.length) + selected + value.slice(end + token.length),
			start: start - token.length,
			end: end - token.length,
		};
	}
	if (selected.length > token.length * 2 && selected.startsWith(token) && selected.endsWith(token)) {
		const inner = selected.slice(token.length, selected.length - token.length);
		return { value: value.slice(0, start) + inner + value.slice(end), start, end: start + inner.length };
	}
	return {
		value: value.slice(0, start) + token + selected + token + value.slice(end),
		start: start + token.length,
		end: end + token.length,
	};
}

function lineBounds(value: string, start: number, end: number): { from: number; to: number } {
	const from = value.lastIndexOf("\n", start - 1) + 1;
	const lineEnd = value.indexOf("\n", end);
	return { from, to: lineEnd < 0 ? value.length : lineEnd };
}

function markerFor(kind: ListKind, index: number): string {
	return kind === "bullet" ? BULLET_PREFIX : `${index + 1}. `;
}

function kindOf(line: string): ListKind | null {
	const match = LIST_MARKER.exec(line);
	if (!match) {
		return null;
	}
	return match[1] === BULLET_PREFIX ? "bullet" : "numbered";
}

export function toggleList(value: string, start: number, end: number, kind: ListKind): TextEdit {
	const { from, to } = lineBounds(value, start, end);
	const lines = value.slice(from, to).split("\n");
	const nonBlank = lines.filter((line) => line.trim().length > 0);
	const allInKind = nonBlank.length > 0 && nonBlank.every((line) => kindOf(line) === kind);
	let item = 0;
	const next = lines.map((line) => {
		const stripped = line.replace(LIST_MARKER, "");
		if (allInKind || line.trim().length === 0) {
			return allInKind ? stripped : line;
		}
		return markerFor(kind, item++) + stripped;
	});
	const block = next.join("\n");
	return { value: value.slice(0, from) + block + value.slice(to), start: from, end: from + block.length };
}

export function continueList(value: string, caret: number): TextEdit | null {
	const lineStart = value.lastIndexOf("\n", caret - 1) + 1;
	const before = value.slice(lineStart, caret);
	const match = LIST_MARKER.exec(before);
	if (!match) {
		return null;
	}
	if (before.trim() === match[1].trim()) {
		const cleared = value.slice(0, lineStart) + value.slice(caret);
		return { value: cleared, start: lineStart, end: lineStart };
	}
	const number = /^(\d+)\. $/.exec(match[1]);
	const marker = number ? `${Number(number[1]) + 1}. ` : BULLET_PREFIX;
	const inserted = `\n${marker}`;
	const position = caret + inserted.length;
	return { value: value.slice(0, caret) + inserted + value.slice(caret), start: position, end: position };
}
