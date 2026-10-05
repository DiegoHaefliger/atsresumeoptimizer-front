export type DiffPart = { kind: "same" | "added" | "removed"; text: string };

const TOKEN = /\s+|[^\s]+/g;
const MIN_WORD_LENGTH = 3;

function tokenize(text: string): string[] {
	return text.match(TOKEN) ?? [];
}

function comparable(token: string): string {
	return token.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function diffWords(before: string, after: string): DiffPart[] {
	const left = tokenize(before);
	const right = tokenize(after);
	const lengths: number[][] = Array.from({ length: left.length + 1 }, () => new Array(right.length + 1).fill(0));
	for (let i = left.length - 1; i >= 0; i--) {
		for (let j = right.length - 1; j >= 0; j--) {
			lengths[i][j] =
				comparable(left[i]) === comparable(right[j])
					? lengths[i + 1][j + 1] + 1
					: Math.max(lengths[i + 1][j], lengths[i][j + 1]);
		}
	}

	const parts: DiffPart[] = [];
	const push = (kind: DiffPart["kind"], text: string) => {
		const last = parts[parts.length - 1];
		if (last && last.kind === kind) {
			last.text += text;
		} else {
			parts.push({ kind, text });
		}
	};
	let i = 0;
	let j = 0;
	while (i < left.length && j < right.length) {
		if (comparable(left[i]) === comparable(right[j])) {
			push("same", right[j]);
			i++;
			j++;
		} else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
			push("removed", left[i++]);
		} else {
			push("added", right[j++]);
		}
	}
	left.slice(i).forEach((token) => push("removed", token));
	right.slice(j).forEach((token) => push("added", token));
	return parts;
}

export function hasChanges(parts: DiffPart[]): boolean {
	return parts.some((part) => part.kind !== "same" && part.text.trim() !== "");
}

function words(text: string): Set<string> {
	return new Set(
		comparable(text)
			.split(/[^\p{L}\p{N}]+/u)
			.filter((word) => word.length >= MIN_WORD_LENGTH),
	);
}

export function similarity(left: string, right: string): number {
	const a = words(left);
	const b = words(right);
	if (a.size === 0 || b.size === 0) {
		return 0;
	}
	let shared = 0;
	a.forEach((word) => {
		if (b.has(word)) {
			shared++;
		}
	});
	return shared / (a.size + b.size - shared);
}

export function normalizedLabel(text: string): string {
	return comparable(text).replace(/[\s:–-]+$/, "").trim();
}
