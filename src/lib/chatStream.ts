import type { ChatMessageResponse } from "../api/types";

export type ChatStreamEvent =
	| { type: "user"; message: ChatMessageResponse }
	| { type: "token"; text: string }
	| { type: "tool"; label: string }
	| { type: "notice"; message: string }
	| { type: "done"; message: ChatMessageResponse }
	| { type: "error"; message: string };

const BLOCK_SEPARATOR = /\r?\n\r?\n/;
const LINE_SEPARATOR = /\r?\n/;

function parseBlock(block: string): ChatStreamEvent | null {
	let name = "message";
	const data: string[] = [];
	for (const line of block.split(LINE_SEPARATOR)) {
		if (line.startsWith("event:")) {
			name = line.slice("event:".length).trim();
		} else if (line.startsWith("data:")) {
			data.push(line.slice("data:".length).replace(/^ /, ""));
		}
	}
	if (data.length === 0) {
		return null;
	}
	const payload = JSON.parse(data.join("\n"));
	switch (name) {
		case "user":
			return { type: "user", message: payload };
		case "token":
			return { type: "token", text: payload.text ?? "" };
		case "tool":
			return { type: "tool", label: payload.label ?? "" };
		case "notice":
			return { type: "notice", message: payload.message ?? "" };
		case "done":
			return { type: "done", message: payload };
		case "error":
			return { type: "error", message: payload.message ?? "" };
		default:
			return null;
	}
}

export async function* readChatStream(response: Response): AsyncGenerator<ChatStreamEvent> {
	if (!response.body) {
		return;
	}
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	try {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			buffer += decoder.decode(value, { stream: true });
			const blocks = buffer.split(BLOCK_SEPARATOR);
			buffer = blocks.pop() ?? "";
			for (const block of blocks) {
				const event = parseBlock(block);
				if (event) {
					yield event;
				}
			}
		}
		buffer += decoder.decode();
		const last = buffer.trim() ? parseBlock(buffer) : null;
		if (last) {
			yield last;
		}
	} finally {
		reader.cancel().catch(() => undefined);
	}
}
