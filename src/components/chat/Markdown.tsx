import { Fragment, type ReactNode } from "react";

const INLINE_PATTERN = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g;
const HEADING = /^(#{1,4})\s+(.*)$/;
const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const FENCE = /^```(\w*)\s*$/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_DIVIDER = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const LINK = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/;

function inline(text: string, keyPrefix: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	let last = 0;
	let index = 0;
	for (const match of text.matchAll(INLINE_PATTERN)) {
		const start = match.index ?? 0;
		if (start > last) {
			nodes.push(text.slice(last, start));
		}
		const token = match[0];
		const key = `${keyPrefix}-${index++}`;
		if (match[1]) {
			nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
		} else if (match[2]) {
			nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
		} else if (match[3]) {
			nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
		} else {
			const link = LINK.exec(token);
			nodes.push(
				link ? (
					<a key={key} href={link[2]} target="_blank" rel="noopener noreferrer">
						{link[1]}
					</a>
				) : (
					token
				),
			);
		}
		last = start + token.length;
	}
	if (last < text.length) {
		nodes.push(text.slice(last));
	}
	return nodes;
}

function lines(text: string, keyPrefix: string): ReactNode[] {
	return text.split("\n").flatMap((line, index) => [index > 0 ? <br key={`${keyPrefix}-br-${index}`} /> : null, ...inline(line, `${keyPrefix}-${index}`)]);
}

function cells(row: string): string[] {
	return row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

export function Markdown({ text }: { text: string }) {
	const source = text.replace(/\r\n/g, "\n").split("\n");
	const blocks: ReactNode[] = [];
	let cursor = 0;

	while (cursor < source.length) {
		const line = source[cursor];
		const key = `b${cursor}`;

		if (line.trim() === "") {
			cursor++;
			continue;
		}

		const fence = FENCE.exec(line);
		if (fence) {
			const code: string[] = [];
			cursor++;
			while (cursor < source.length && !FENCE.test(source[cursor])) {
				code.push(source[cursor++]);
			}
			cursor++;
			blocks.push(
				<pre key={key}>
					<code>{code.join("\n")}</code>
				</pre>,
			);
			continue;
		}

		const heading = HEADING.exec(line);
		if (heading) {
			const Tag = `h${Math.min(heading[1].length + 2, 6)}` as "h3" | "h4" | "h5" | "h6";
			blocks.push(<Tag key={key}>{inline(heading[2], key)}</Tag>);
			cursor++;
			continue;
		}

		if (BULLET.test(line) || NUMBERED.test(line)) {
			const ordered = NUMBERED.test(line) && !BULLET.test(line);
			const pattern = ordered ? NUMBERED : BULLET;
			const items: ReactNode[] = [];
			while (cursor < source.length && pattern.test(source[cursor])) {
				const item = pattern.exec(source[cursor])?.[1] ?? "";
				items.push(<li key={`${key}-${cursor}`}>{inline(item, `${key}-${cursor}`)}</li>);
				cursor++;
			}
			blocks.push(ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>);
			continue;
		}

		if (QUOTE.test(line)) {
			const quoted: string[] = [];
			while (cursor < source.length && QUOTE.test(source[cursor])) {
				quoted.push(QUOTE.exec(source[cursor])?.[1] ?? "");
				cursor++;
			}
			blocks.push(<blockquote key={key}>{lines(quoted.join("\n"), key)}</blockquote>);
			continue;
		}

		if (TABLE_ROW.test(line) && TABLE_DIVIDER.test(source[cursor + 1] ?? "")) {
			const header = cells(line);
			cursor += 2;
			const rows: string[][] = [];
			while (cursor < source.length && TABLE_ROW.test(source[cursor])) {
				rows.push(cells(source[cursor++]));
			}
			blocks.push(
				<div key={key} className="chat-table-scroll">
					<table>
						<thead>
							<tr>
								{header.map((cell, column) => (
									<th key={column}>{inline(cell, `${key}-h${column}`)}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.map((row, rowIndex) => (
								<tr key={rowIndex}>
									{row.map((cell, column) => (
										<td key={column}>{inline(cell, `${key}-${rowIndex}-${column}`)}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>,
			);
			continue;
		}

		const paragraph: string[] = [];
		while (
			cursor < source.length &&
			source[cursor].trim() !== "" &&
			!FENCE.test(source[cursor]) &&
			!HEADING.test(source[cursor]) &&
			!BULLET.test(source[cursor]) &&
			!NUMBERED.test(source[cursor]) &&
			!QUOTE.test(source[cursor])
		) {
			paragraph.push(source[cursor++]);
		}
		blocks.push(<p key={key}>{lines(paragraph.join("\n"), key)}</p>);
	}

	return (
		<div className="chat-markdown">
			{blocks.map((block, index) => (
				<Fragment key={index}>{block}</Fragment>
			))}
		</div>
	);
}
