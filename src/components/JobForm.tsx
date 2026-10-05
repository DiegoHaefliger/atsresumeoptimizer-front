import { useState, type FormEvent } from "react";
import { errorMessage } from "../api/client";
import type { ContractType, WorkModel } from "../api/types";
import type { JobDraft } from "../lib/jobDraft";
import { CONTRACT_TYPE_LABELS, SENIORITY_OPTIONS, WORK_MODEL_LABELS } from "../lib/jobLabels";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { ProgressSteps } from "./ProgressSteps";
import { StateMessage } from "./StateMessage";

type JobFormProps = {
	initial: JobDraft;
	submitLabel: string;
	onSave: (draft: JobDraft) => Promise<void>;
};

export function JobForm({ initial, submitLabel, onSave }: JobFormProps) {
	const [draft, setDraft] = useState<JobDraft>(initial);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function update<K extends keyof JobDraft>(field: K, value: JobDraft[K]) {
		setDraft((current) => ({ ...current, [field]: value }));
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!draft.text.trim()) {
			setError("Cola o texto da vaga.");
			return;
		}
		setError(null);
		setSaving(true);
		try {
			await onSave(draft);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar a vaga. Tenta de novo."));
			setSaving(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="panel panel-body form form-narrow">
			<label>
				Título
				<input
					value={draft.title}
					onChange={(event) => update("title", event.target.value)}
					placeholder="Ex.: Desenvolvedor Java"
					maxLength={255}
					disabled={saving}
				/>
			</label>
			<label>
				Descrição da vaga
				<AutoGrowTextarea
					value={draft.text}
					onChange={(event) => update("text", event.target.value)}
					rows={12}
					placeholder="Cole aqui o texto completo do anúncio"
					disabled={saving}
				/>
			</label>
			<label>
				Benefícios
				<AutoGrowTextarea
					value={draft.benefits}
					onChange={(event) => update("benefits", event.target.value)}
					rows={3}
					placeholder="Um por linha ou separados por vírgula. Ex.: Vale-refeição, Plano de saúde"
					disabled={saving}
				/>
			</label>
			<fieldset className="job-details" disabled={saving}>
				<legend>Dados da vaga (opcional, cruzados com suas preferências)</legend>
				<label>
					Empresa
					<input
						value={draft.company}
						onChange={(event) => update("company", event.target.value)}
						placeholder="Ex.: Acme"
						maxLength={255}
					/>
				</label>
				<div className="form-row form-row-3">
					<label>
						Senioridade
						<select value={draft.seniority} onChange={(event) => update("seniority", event.target.value)}>
							<option value="">Não informado</option>
							{SENIORITY_OPTIONS.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>
					<label>
						Tipo de contrato
						<select
							value={draft.contractType}
							onChange={(event) => update("contractType", event.target.value as ContractType | "")}
						>
							<option value="">Não informado</option>
							{(Object.keys(CONTRACT_TYPE_LABELS) as ContractType[]).map((type) => (
								<option key={type} value={type}>
									{CONTRACT_TYPE_LABELS[type]}
								</option>
							))}
						</select>
					</label>
					<label>
						Modelo
						<select
							value={draft.workModel}
							onChange={(event) => update("workModel", event.target.value as WorkModel | "")}
						>
							<option value="">Não informado</option>
							{(Object.keys(WORK_MODEL_LABELS) as WorkModel[]).map((model) => (
								<option key={model} value={model}>
									{WORK_MODEL_LABELS[model]}
								</option>
							))}
						</select>
					</label>
				</div>
				<label>
					Link da vaga
					<input
						type="url"
						value={draft.sourceUrl}
						onChange={(event) => update("sourceUrl", event.target.value)}
						placeholder="https://..."
						maxLength={1000}
					/>
				</label>
				<label>
					Link da entrevista
					<input
						type="url"
						value={draft.interviewUrl}
						onChange={(event) => update("interviewUrl", event.target.value)}
						placeholder="https://meet.google.com/..."
						maxLength={1000}
					/>
				</label>
				<label>
					Remuneração (R$ por mês)
					<input
						type="number"
						inputMode="decimal"
						min={0}
						step="0.01"
						value={draft.salary}
						onChange={(event) => update("salary", event.target.value)}
						placeholder="Ex.: 8000"
					/>
				</label>
			</fieldset>

			{saving && (
				<ProgressSteps title="Lendo a vaga" hint="A IA está extraindo título, requisitos e condições. Leva alguns segundos." />
			)}
			{error && <StateMessage variant="error" layout="inline" message={error} />}

			<button type="submit" disabled={saving} className="btn-block" aria-busy={saving}>
				{submitLabel}
			</button>
		</form>
	);
}
