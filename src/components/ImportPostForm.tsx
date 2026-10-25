import { useState, type FormEvent } from "react";
import { ApiError, apiPostJson, errorMessage } from "../api/client";
import type { ImportPostRequest, JobSuggestion } from "../api/types";
import { BusyLabel } from "./BusyLabel";
import { StateMessage } from "./StateMessage";

type ImportPostFormProps = {
	onImported: (suggestion: JobSuggestion) => void;
	onCancel: () => void;
};

const UNPROCESSABLE = 422;

export function ImportPostForm({ onImported, onCancel }: ImportPostFormProps) {
	const [url, setUrl] = useState("");
	const [text, setText] = useState("");
	const [needsText, setNeedsText] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function submit(event: FormEvent) {
		event.preventDefault();
		setSaving(true);
		setError(null);
		const body: ImportPostRequest = { url: url.trim(), text: text.trim() || undefined };
		try {
			onImported(await apiPostJson<JobSuggestion>("/api/v1/job-suggestions/import", body));
		} catch (err) {
			setNeedsText(needsText || (err instanceof ApiError && err.status === UNPROCESSABLE));
			setError(errorMessage(err, "Não deu pra importar a postagem. Tenta de novo."));
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="panel import-post-form" onSubmit={submit}>
			<div className="panel-header">
				<h2>Importar postagem</h2>
				<p>
					Cole o link de uma postagem de vaga do LinkedIn. O sistema tenta ler o texto sem login; se não
					conseguir, cole o texto dela.
				</p>
			</div>
			<div className="panel-body">
				<label>
					Link da postagem
					<input
						type="url"
						required
						value={url}
						placeholder="https://www.linkedin.com/posts/..."
						onChange={(event) => setUrl(event.target.value)}
					/>
				</label>
				<label>
					Texto da postagem{needsText ? "" : " (opcional)"}
					<textarea
						rows={needsText ? 8 : 3}
						required={needsText}
						value={text}
						maxLength={20000}
						onChange={(event) => setText(event.target.value)}
					/>
				</label>
				{error && <StateMessage variant="error" layout="inline" message={error} />}
				<div className="form-actions">
					<button type="button" className="btn-secondary" disabled={saving} onClick={onCancel}>
						Cancelar
					</button>
					<button type="submit" disabled={saving} aria-busy={saving}>
						<BusyLabel busy={saving} busyText="Importando...">Importar</BusyLabel>
					</button>
				</div>
			</div>
		</form>
	);
}
