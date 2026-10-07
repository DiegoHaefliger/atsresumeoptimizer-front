import { useEffect, useState } from "react";
import { apiGetOptional, apiPostJson, apiPutJson, errorMessage } from "../api/client";
import type { CoverLetterResponse } from "../api/types";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { BusyLabel } from "./BusyLabel";
import { ConfirmDialog } from "./ConfirmDialog";
import { StateMessage } from "./StateMessage";

type CoverLetterPanelProps = {
	analysisId: string;
	beforeGenerate: () => Promise<unknown>;
};

const COPIED_FEEDBACK_MS = 2000;

export function CoverLetterPanel({ analysisId, beforeGenerate }: CoverLetterPanelProps) {
	const path = `/api/v1/analyses/${analysisId}/cover-letter`;
	const [saved, setSaved] = useState<CoverLetterResponse | null>(null);
	const [draft, setDraft] = useState("");
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [saving, setSaving] = useState(false);
	const [copied, setCopied] = useState(false);
	const [confirmingRegenerate, setConfirmingRegenerate] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const dirty = saved !== null && draft !== (saved.content ?? "");

	useEffect(() => {
		apiGetOptional<CoverLetterResponse>(path)
			.then(show)
			.catch((err) => setError(errorMessage(err, "Não deu pra carregar a apresentação.")))
			.finally(() => setLoading(false));
	}, [path]);

	useEffect(() => {
		if (!copied) {
			return;
		}
		const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
		return () => clearTimeout(timer);
	}, [copied]);

	function show(letter: CoverLetterResponse | null) {
		setSaved(letter);
		setDraft(letter?.content ?? "");
	}

	async function generate() {
		setConfirmingRegenerate(false);
		setGenerating(true);
		setError(null);
		try {
			await beforeGenerate();
			show(await apiPostJson<CoverLetterResponse>(path, {}));
		} catch (err) {
			setError(errorMessage(err, "Não deu pra gerar a apresentação agora."));
		} finally {
			setGenerating(false);
		}
	}

	async function save() {
		setSaving(true);
		setError(null);
		try {
			show(await apiPutJson<CoverLetterResponse>(path, { content: draft }));
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar a apresentação."));
		} finally {
			setSaving(false);
		}
	}

	async function copy() {
		await navigator.clipboard.writeText(draft);
		setCopied(true);
	}

	if (loading) {
		return null;
	}

	return (
		<section className="cover-letter">
			<h2>Apresentação para a vaga</h2>
			<p className="field-hint">
				Opcional. Para candidaturas que pedem uma carta ou um "fale sobre você": a IA liga o que a vaga pede às suas
				experiências do currículo adaptado, sem inventar nada. Fica salva junto da vaga.
			</p>

			{error && <StateMessage variant="error" layout="inline" message={error} />}

			{saved === null ? (
				<button type="button" className="btn-secondary" onClick={generate} disabled={generating} aria-busy={generating}>
					<BusyLabel busy={generating} busyText="Escrevendo...">
						Gerar apresentação
					</BusyLabel>
				</button>
			) : (
				<>
					<AutoGrowTextarea
						className="cover-letter-text"
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						aria-label="Texto da apresentação"
						maxLength={10000}
						disabled={generating}
					/>
					<div className="form-actions">
						{dirty && (
							<button type="button" onClick={save} disabled={saving || !draft.trim()} aria-busy={saving}>
								<BusyLabel busy={saving} busyText="Salvando...">
									Salvar alterações
								</BusyLabel>
							</button>
						)}
						<button type="button" className="btn-secondary" onClick={copy} disabled={!draft.trim()}>
							{copied ? "Copiado" : "Copiar texto"}
						</button>
						<button
							type="button"
							className="btn-secondary"
							onClick={() => setConfirmingRegenerate(true)}
							disabled={generating || saving}
							aria-busy={generating}
						>
							<BusyLabel busy={generating} busyText="Escrevendo...">
								Gerar de novo
							</BusyLabel>
						</button>
					</div>
				</>
			)}

			<ConfirmDialog
				open={confirmingRegenerate}
				title="Gerar outra apresentação?"
				confirmLabel="Gerar de novo"
				onConfirm={generate}
				onCancel={() => setConfirmingRegenerate(false)}
			>
				<p>O texto atual da apresentação, incluindo o que você editou, será substituído.</p>
			</ConfirmDialog>
		</section>
	);
}
