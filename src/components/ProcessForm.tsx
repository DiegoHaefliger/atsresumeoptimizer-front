import { useState, type FormEvent } from "react";
import { errorMessage } from "../api/client";
import type { SelectionStage } from "../api/types";
import type { ProcessDraft } from "../lib/processDraft";
import { STAGE_LABELS, STAGES } from "../lib/processLabels";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { StateMessage } from "./StateMessage";

type ProcessFormProps = {
	initial: ProcessDraft;
	submitLabel: string;
	chooseStage: boolean;
	onSave: (draft: ProcessDraft) => Promise<void>;
	onCancel?: () => void;
};

export function ProcessForm({ initial, submitLabel, chooseStage, onSave, onCancel }: ProcessFormProps) {
	const [draft, setDraft] = useState<ProcessDraft>(initial);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function update<K extends keyof ProcessDraft>(field: K, value: ProcessDraft[K]) {
		setDraft((current) => ({ ...current, [field]: value }));
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setSaving(true);
		try {
			await onSave(draft);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar o processo. Tenta de novo."));
			setSaving(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="panel panel-body form form-narrow">
			<fieldset className="job-details" disabled={saving}>
				<div className="form-row">
					<label>
						Link do processo seletivo
						<input
							type="url"
							value={draft.processUrl}
							onChange={(event) => update("processUrl", event.target.value)}
							placeholder="https://..."
							maxLength={1000}
						/>
					</label>
				</div>
				<div className="form-row form-row-3">
					{chooseStage && (
						<label>
							Etapa inicial
							<select value={draft.stage} onChange={(event) => update("stage", event.target.value as SelectionStage)}>
								{STAGES.map((stage) => (
									<option key={stage} value={stage}>
										{STAGE_LABELS[stage]}
									</option>
								))}
							</select>
						</label>
					)}
					<label>
						Data da candidatura
						<input type="date" value={draft.appliedOn} onChange={(event) => update("appliedOn", event.target.value)} />
					</label>
				</div>
				<div className="form-row form-row-3">
					<label>
						Contato (recrutador)
						<input
							value={draft.contactName}
							onChange={(event) => update("contactName", event.target.value)}
							maxLength={255}
						/>
					</label>
					<label>
						E-mail do contato
						<input
							type="email"
							value={draft.contactEmail}
							onChange={(event) => update("contactEmail", event.target.value)}
							maxLength={255}
						/>
					</label>
					<label>
						Telefone do contato
						<input
							type="tel"
							value={draft.contactPhone}
							onChange={(event) => update("contactPhone", event.target.value)}
							maxLength={30}
						/>
					</label>
				</div>
				<div className="form-row">
					<label>
						Remuneração (R$ por mês)
						<input
							type="number"
							inputMode="decimal"
							min={0}
							step="0.01"
							value={draft.salary}
							onChange={(event) => update("salary", event.target.value)}
						/>
					</label>
				</div>
				<label>
					Observações
					<AutoGrowTextarea
						value={draft.notes}
						onChange={(event) => update("notes", event.target.value)}
						rows={4}
						maxLength={5000}
					/>
				</label>
			</fieldset>
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			<button type="submit" disabled={saving} className="btn-block" aria-busy={saving}>
				{submitLabel}
			</button>
			{onCancel && (
				<button type="button" className="btn-secondary btn-block" onClick={onCancel} disabled={saving}>
					Cancelar
				</button>
			)}
		</form>
	);
}
