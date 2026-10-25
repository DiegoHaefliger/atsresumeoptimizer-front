import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { parseList } from "../lib/listText";
import { XIcon } from "./icons";

type TagInputProps = {
	label: string;
	tags?: ReactNode;
	placeholder: string;
	values: string[];
	onChange: (values: string[]) => void;
};

const COMMIT_KEYS = new Set(["Enter", ","]);

function merge(current: string[], incoming: string[]): string[] {
	const seen = new Set(current.map((value) => value.toLowerCase()));
	const added = incoming.filter((value) => {
		const key = value.toLowerCase();
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
	return added.length > 0 ? [...current, ...added] : current;
}

export function TagInput({ label, tags, placeholder, values, onChange }: TagInputProps) {
	const id = useId();
	const [draft, setDraft] = useState("");

	function commit() {
		const incoming = parseList(draft);
		if (incoming.length > 0) {
			onChange(merge(values, incoming));
		}
		setDraft("");
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (COMMIT_KEYS.has(event.key)) {
			event.preventDefault();
			commit();
		} else if (event.key === "Backspace" && draft === "" && values.length > 0) {
			onChange(values.slice(0, -1));
		}
	}

	return (
		<div className="tag-field">
			<label htmlFor={id} className="tag-field-label">
				{label}
				{tags}
			</label>
			<div className="tag-field-row">
				<div className="tag-input">
					{values.length > 0 && (
						<ul className="tag-list" aria-label={label}>
							{values.map((value) => (
								<li key={value} className="tag">
									<span>{value}</span>
									<button
										type="button"
										className="tag-remove"
										aria-label={`Remover ${value}`}
										title="Remover"
										onClick={() => onChange(values.filter((item) => item !== value))}
									>
										<XIcon />
									</button>
								</li>
							))}
						</ul>
					)}
					<input
						id={id}
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						onKeyDown={handleKeyDown}
						onBlur={commit}
						placeholder={values.length > 0 ? "Adicionar mais..." : placeholder}
					/>
				</div>
				<button type="button" className="btn-secondary" onClick={commit} disabled={!draft.trim()}>
					Adicionar
				</button>
			</div>
			<span className="field-hint">Digite e tecle Enter ou vírgula pra adicionar. O × remove.</span>
		</div>
	);
}
