import { createElement, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { escapeHtml, readPlain } from "../lib/documentHtml";

type EditableLineProps = {
	as?: "p" | "h2" | "h3" | "span";
	className?: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
};

export function EditableLine({ as = "p", className, label, value, onChange }: EditableLineProps) {
	const [initial] = useState(value);

	function blockEnter(event: KeyboardEvent<HTMLElement>) {
		if (event.key === "Enter") {
			event.preventDefault();
		}
	}

	function pastePlain(event: ClipboardEvent<HTMLElement>) {
		event.preventDefault();
		document.execCommand("insertText", false, event.clipboardData.getData("text/plain").replace(/\s*\n+\s*/g, " "));
	}

	return createElement(as, {
		className: `document-line ${className ?? ""}`.trim(),
		contentEditable: true,
		suppressContentEditableWarning: true,
		spellCheck: true,
		role: "textbox",
		"aria-label": label,
		"data-placeholder": label,
		onKeyDown: blockEnter,
		onPaste: pastePlain,
		onInput: (event: { currentTarget: HTMLElement }) => onChange(readPlain(event.currentTarget)),
		dangerouslySetInnerHTML: { __html: escapeHtml(initial) },
	});
}
