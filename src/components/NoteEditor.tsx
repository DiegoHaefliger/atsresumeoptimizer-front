import { useState } from "react";
import { errorMessage } from "../api/client";
import type { NoteText } from "../api/types";
import { SpinnerIcon } from "./icons";
import { formatDateTime } from "../lib/processLabels";
import { RichTextField } from "./RichTextField";
import { StateMessage } from "./StateMessage";

export const NOTE_MAX_LENGTH = 20000;

type NoteEditorProps = {
	label: string;
	initial: NoteText;
	placeholder?: string;
	rows?: number;
	onSave: (content: string) => Promise<NoteText>;
};

export function NoteEditor({ label, initial, placeholder, rows = 10, onSave }: NoteEditorProps) {
	const [content, setContent] = useState(initial.content);
	const [saved, setSaved] = useState(initial);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const dirty = content !== saved.content;
	const tooLong = content.length > NOTE_MAX_LENGTH;

	async function save() {
		setError(null);
		setSaving(true);
		try {
			setSaved(await onSave(content));
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar a nota. Tenta de novo."));
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="note-editor">
			<RichTextField label={label} value={content} onChange={setContent} rows={rows} placeholder={placeholder} separator />
			{tooLong && <StateMessage variant="error" layout="inline" message={`A nota passa de ${NOTE_MAX_LENGTH} caracteres.`} />}
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			<div className="note-editor-footer">
				<span className="field-hint">
					{dirty ? "Alterações não salvas" : saved.updatedAt ? `Salva em ${formatDateTime(saved.updatedAt)}` : ""}
				</span>
				<button type="button" onClick={save} disabled={saving || !dirty || tooLong} aria-busy={saving}>
					{saving && <SpinnerIcon />} Salvar nota
				</button>
			</div>
		</div>
	);
}
