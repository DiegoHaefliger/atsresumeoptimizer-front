import { useState } from "react";
import { apiPutJson, errorMessage } from "../api/client";
import type { CoverLetter } from "../api/types";
import { formatDateTime } from "../lib/processLabels";
import { useCopyFeedback } from "../lib/useCopyFeedback";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { BusyLabel } from "./BusyLabel";
import { StateMessage } from "./StateMessage";

type CoverLetterItemProps = {
	path: string;
	letter: CoverLetter;
	resumeLabel: string | null;
	open: boolean;
	onSaved: (letter: CoverLetter) => void;
};

export function CoverLetterItem({ path, letter, resumeLabel, open, onSaved }: CoverLetterItemProps) {
	const [draft, setDraft] = useState(letter.content);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { copied, copy } = useCopyFeedback();
	const dirty = draft !== letter.content;

	async function save() {
		setSaving(true);
		setError(null);
		try {
			onSaved(await apiPutJson<CoverLetter>(`${path}/${letter.id}`, { content: draft }));
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar a apresentação."));
		} finally {
			setSaving(false);
		}
	}

	return (
		<details className="assistant-history-item" open={open}>
			<summary>
				<strong>{formatDateTime(letter.createdAt)}</strong>
				{resumeLabel && <span className="assistant-history-meta">{resumeLabel}</span>}
				{letter.updatedAt !== letter.createdAt && <span className="assistant-history-meta">editada</span>}
			</summary>
			<div className="assistant-history-body">
				<AutoGrowTextarea
					className="cover-letter-text"
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					aria-label="Texto da apresentação"
					maxLength={10000}
				/>
				{error && <StateMessage variant="error" layout="inline" message={error} />}
				<div className="form-actions">
					{dirty && (
						<button type="button" onClick={save} disabled={saving || !draft.trim()} aria-busy={saving}>
							<BusyLabel busy={saving} busyText="Salvando...">
								Salvar alterações
							</BusyLabel>
						</button>
					)}
					<button type="button" className="btn-secondary" onClick={() => copy(draft)} disabled={!draft.trim()}>
						{copied ? "Copiado" : "Copiar texto"}
					</button>
				</div>
			</div>
		</details>
	);
}
