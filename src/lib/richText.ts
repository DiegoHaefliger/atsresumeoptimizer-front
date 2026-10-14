import type { TextSpan } from "../api/types";

const BOLD = "**";
const UNDERLINE = "++";
const ITALIC = "*";

export type InlineStyle = "bold" | "italic" | "underline";

const STYLE_TOKENS: Record<InlineStyle, string> = { bold: BOLD, italic: ITALIC, underline: UNDERLINE };

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
