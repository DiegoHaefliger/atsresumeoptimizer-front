import { useState, type ClipboardEvent } from "react";
import type { TextSpan } from "../api/types";
import { linesToHtml, readLines } from "../lib/documentHtml";

type EditableBlockProps = {
	list?: boolean;
	label: string;
	lines: TextSpan[][];
	onChange: (lines: TextSpan[][]) => void;
};

export function EditableBlock({ list = false, label, lines, onChange }: EditableBlockProps) {
	const [initial] = useState(() => linesToHtml(lines, list ? "li" : "p"));

	function pastePlain(event: ClipboardEvent<HTMLElement>) {
		event.preventDefault();
		document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
	}

	const props = {
		className: "document-block",
		contentEditable: true,
		suppressContentEditableWarning: true,
		spellCheck: true,
		role: "textbox",
		"aria-multiline": true,
		"aria-label": label,
		"data-placeholder": label,
		onPaste: pastePlain,
		onInput: (event: { currentTarget: HTMLElement }) => onChange(readLines(event.currentTarget)),
		dangerouslySetInnerHTML: { __html: initial },
	};
	return list ? <ul {...props} /> : <div {...props} />;
}
