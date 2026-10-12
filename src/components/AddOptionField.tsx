import { useId, useState, type KeyboardEvent } from "react";

type AddOptionFieldProps = {
	label: string;
	placeholder: string;
	onAdd: (value: string) => void;
};

export function AddOptionField({ label, placeholder, onAdd }: AddOptionFieldProps) {
	const id = useId();
	const [draft, setDraft] = useState("");

	function add() {
		const value = draft.trim();
		if (value) {
			onAdd(value);
		}
		setDraft("");
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter") {
			event.preventDefault();
			add();
		}
	}

	return (
		<div className="tag-field">
			<label htmlFor={id} className="tag-field-label">
				{label}
			</label>
			<div className="tag-field-row">
				<input
					id={id}
					className="add-option-input"
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
				/>
				<button type="button" className="btn-secondary" onClick={add} disabled={!draft.trim()}>
					Adicionar
				</button>
			</div>
			<span className="field-hint">O benefício entra marcado na lista acima.</span>
		</div>
	);
}
