import { useRef, type KeyboardEvent } from "react";
import {
	continueList,
	toggleList,
	toggleStyle,
	type InlineStyle,
	type ListKind,
	type TextEdit,
} from "../lib/richText";
import { AutoGrowTextarea } from "./AutoGrowTextarea";

type RichTextFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	lists?: boolean;
	rows?: number;
	placeholder?: string;
};

const STYLE_BUTTONS: { style: InlineStyle; label: string; title: string; key: string }[] = [
	{ style: "bold", label: "B", title: "Negrito (Ctrl+B)", key: "b" },
	{ style: "italic", label: "I", title: "Itálico (Ctrl+I)", key: "i" },
	{ style: "underline", label: "U", title: "Sublinhado (Ctrl+U)", key: "u" },
];

const LIST_BUTTONS: { kind: ListKind; label: string; title: string }[] = [
	{ kind: "bullet", label: "•", title: "Lista com marcadores" },
	{ kind: "numbered", label: "1.", title: "Lista numerada" },
];

export function RichTextField({ label, value, onChange, lists = true, rows, placeholder }: RichTextFieldProps) {
	const ref = useRef<HTMLTextAreaElement>(null);

	function apply(edit: TextEdit) {
		onChange(edit.value);
		requestAnimationFrame(() => {
			ref.current?.focus();
			ref.current?.setSelectionRange(edit.start, edit.end);
		});
	}

	function selection(): { start: number; end: number } {
		return { start: ref.current?.selectionStart ?? value.length, end: ref.current?.selectionEnd ?? value.length };
	}

	function applyStyle(style: InlineStyle) {
		const { start, end } = selection();
		apply(toggleStyle(value, start, end, style));
	}

	function applyList(kind: ListKind) {
		const { start, end } = selection();
		apply(toggleList(value, start, end, kind));
	}

	function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if (event.ctrlKey || event.metaKey) {
			const button = STYLE_BUTTONS.find((candidate) => candidate.key === event.key.toLowerCase());
			if (button) {
				event.preventDefault();
				applyStyle(button.style);
			}
			return;
		}
		if (lists && event.key === "Enter" && !event.shiftKey) {
			const { start, end } = selection();
			const edit = start === end ? continueList(value, start) : null;
			if (edit) {
				event.preventDefault();
				apply(edit);
			}
		}
	}

	return (
		<div className="rich-text-field">
			<div className="rich-text-toolbar" role="toolbar" aria-label={`Formatação de ${label}`}>
				{STYLE_BUTTONS.map((button) => (
					<button
						key={button.style}
						type="button"
						className={`btn-icon rich-text-button rich-text-button-${button.style}`}
						title={button.title}
						aria-label={button.title}
						onClick={() => applyStyle(button.style)}
					>
						{button.label}
					</button>
				))}
				{lists &&
					LIST_BUTTONS.map((button) => (
						<button
							key={button.kind}
							type="button"
							className="btn-icon rich-text-button"
							title={button.title}
							aria-label={button.title}
							onClick={() => applyList(button.kind)}
						>
							{button.label}
						</button>
					))}
			</div>
			<AutoGrowTextarea
				textareaRef={ref}
				aria-label={label}
				rows={rows}
				placeholder={placeholder}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onKeyDown={handleKeyDown}
			/>
		</div>
	);
}
