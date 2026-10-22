import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import { htmlToMarkup, markupToHtml } from "../lib/noteMarkup";

type RichTextFieldProps = {
	label: string;
	value: string;
	onChange: (markup: string) => void;
	lists?: boolean;
	inline?: boolean;
	separator?: boolean;
	placeholder?: string;
	rows?: number;
};

type Command = "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList" | "insertHorizontalRule";

const BUTTONS: { command: Command; label: string; title: string; className: string; toggle: boolean; list?: boolean; inline?: boolean }[] = [
	{ command: "bold", label: "B", title: "Negrito (Ctrl+B)", className: "rich-text-button-bold", toggle: true, inline: true },
	{ command: "italic", label: "I", title: "Itálico (Ctrl+I)", className: "rich-text-button-italic", toggle: true, inline: true },
	{ command: "underline", label: "U", title: "Sublinhado (Ctrl+U)", className: "rich-text-button-underline", toggle: true, inline: true },
	{ command: "insertUnorderedList", label: "•", title: "Lista com marcadores", className: "", toggle: true, list: true },
	{ command: "insertOrderedList", label: "1.", title: "Lista numerada", className: "", toggle: true, list: true },
	{ command: "insertHorizontalRule", label: "―", title: "Separador", className: "", toggle: false },
];

const LINE_HEIGHT_EM = 1.6;

export function RichTextField({ label, value, onChange, lists = true, inline = true, separator = false, placeholder, rows }: RichTextFieldProps) {
	const ref = useRef<HTMLDivElement>(null);
	const emitted = useRef(value);
	const [active, setActive] = useState<Set<Command>>(new Set());
	const [empty, setEmpty] = useState(value === "");

	useEffect(() => {
		if (ref.current && (value !== emitted.current || ref.current.childNodes.length === 0)) {
			emitted.current = value;
			ref.current.innerHTML = markupToHtml(value, separator);
			setEmpty(value === "");
		}
	}, [value, separator]);

	useEffect(() => {
		function refresh() {
			const inside = ref.current?.contains(document.getSelection()?.anchorNode ?? null);
			setActive(new Set(inside ? BUTTONS.filter((button) => button.toggle && document.queryCommandState(button.command)).map((button) => button.command) : []));
		}
		document.addEventListener("selectionchange", refresh);
		return () => document.removeEventListener("selectionchange", refresh);
	}, []);

	function handleInput() {
		const element = ref.current;
		if (!element) {
			return;
		}
		if (element.textContent === "" && !element.querySelector("li")) {
			element.innerHTML = "";
		}
		setEmpty(element.textContent === "" && !element.querySelector("li"));
		emitted.current = htmlToMarkup(element);
		onChange(emitted.current);
	}

	function insertSeparator() {
		const selection = document.getSelection();
		let list: Node | null = selection?.anchorNode ?? null;
		while (list && list.parentNode !== ref.current) {
			list = list.parentNode;
		}
		if (selection && list instanceof HTMLElement && (list.tagName === "UL" || list.tagName === "OL")) {
			const line = document.createElement("div");
			line.append(document.createElement("br"));
			const item = (selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode?.parentElement)?.closest("li");
			list.after(document.createElement("hr"), line);
			if (item && !item.textContent) {
				item.remove();
				if (list.children.length === 0) {
					list.remove();
				}
			}
			selection.collapse(line, 0);
		} else {
			document.execCommand("insertHorizontalRule");
		}
	}

	function run(command: Command) {
		ref.current?.focus();
		if (command === "insertHorizontalRule") {
			insertSeparator();
		} else {
			document.execCommand(command);
		}
		handleInput();
	}

	function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
		event.preventDefault();
		document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
	}

	return (
		<div className="rich-text-field">
			<div className="rich-text-toolbar" role="toolbar" aria-label={`Formatação de ${label}`}>
				{BUTTONS.filter((button) => (lists || !button.list) && (inline || !button.inline) && (separator || button.command !== "insertHorizontalRule")).map((button) => (
					<button
						key={button.command}
						type="button"
						className={`btn-icon rich-text-button ${button.className} ${active.has(button.command) ? "rich-text-button-on" : ""}`.trim()}
						title={button.title}
						aria-label={button.title}
						aria-pressed={button.toggle ? active.has(button.command) : undefined}
						onMouseDown={(event) => event.preventDefault()}
						onClick={() => run(button.command)}
					>
						{button.label}
					</button>
				))}
			</div>
			<div
				ref={ref}
				className="rich-note-editor"
				role="textbox"
				aria-multiline="true"
				aria-label={label}
				contentEditable
				suppressContentEditableWarning
				data-placeholder={empty ? placeholder : undefined}
				style={rows ? { minHeight: `${rows * LINE_HEIGHT_EM}em` } : undefined}
				onInput={handleInput}
				onPaste={handlePaste}
			/>
		</div>
	);
}
