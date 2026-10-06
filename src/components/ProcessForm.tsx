import { useMemo, useState, type FormEvent } from "react";
import { errorMessage } from "../api/client";
import type { SelectionProcess, SelectionStage } from "../api/types";
import type { ProcessDraft } from "../lib/processDraft";
import { jobLabel } from "../lib/jobCode";
import { STAGE_LABELS, STAGES } from "../lib/processLabels";
import { useApiResource } from "../lib/useApiResource";
import { useJobs } from "../lib/useJobs";
import { PROCESSES_PATH } from "../lib/useProcesses";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { Link } from "react-router-dom";
import { StateMessage } from "./StateMessage";

type ProcessFormProps = {
	initial: ProcessDraft;
	currentJob?: { id: string; label: string };
	submitLabel: string;
	chooseStage: boolean;
	onSave: (draft: ProcessDraft) => Promise<void>;
};

export function ProcessForm({ initial, currentJob, submitLabel, chooseStage, onSave }: ProcessFormProps) {
	const { jobs: allJobs, failed: jobsFailed } = useJobs();
	const { data: processes, failed: processesFailed } = useApiResource<SelectionProcess[]>(PROCESSES_PATH);
	const jobs = useMemo(() => {
		if (allJobs === null || processes === null) {
			return null;
		}
		const withProcess = new Set(processes.map((process) => process.jobPostingId));
		return allJobs.filter((job) => job.id === currentJob?.id || !withProcess.has(job.id));
	}, [allJobs, processes, currentJob?.id]);
	const [draft, setDraft] = useState<ProcessDraft>(initial);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function update<K extends keyof ProcessDraft>(field: K, value: ProcessDraft[K]) {
		setDraft((current) => ({ ...current, [field]: value }));
	}

	function selectJob(jobPostingId: string) {
		const interviewUrlOf = (id: string) => jobs?.find((job) => job.id === id)?.interviewUrl ?? "";
		setDraft((current) => {
			const untouched = current.processUrl === "" || current.processUrl === interviewUrlOf(current.jobPostingId);
			return {
				...current,
				jobPostingId,
				processUrl: untouched ? interviewUrlOf(jobPostingId) : current.processUrl,
			};
		});
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!draft.jobPostingId) {
			setError("Escolhe uma vaga cadastrada.");
			return;
		}
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
				<label>
					Vaga
					<select
						value={draft.jobPostingId}
						onChange={(event) => selectJob(event.target.value)}
						required
						disabled={saving || (jobs?.length ?? 0) === 0}
					>
						<option value="">{jobs === null ? "Carregando vagas..." : "Escolha uma vaga cadastrada"}</option>
						{currentJob && !jobs?.some((job) => job.id === currentJob.id) && (
							<option value={currentJob.id}>{currentJob.label}</option>
						)}
						{jobs?.map((job) => (
							<option key={job.id} value={job.id}>
								{jobLabel(job.code, job.title, job.company)}
							</option>
						))}
					</select>
					{jobs?.length === 0 && (
						<span className="field-hint">
							{allJobs?.length ? "Todas as vagas cadastradas já têm processo. " : "Nenhuma vaga cadastrada. "}
							<Link to="/jobs/new" className="link">
								Cadastre uma vaga
							</Link>{" "}
							para criar um novo processo.
						</span>
					)}
					{(jobsFailed || processesFailed) && <span className="field-hint">Não deu pra carregar as vagas.</span>}
				</label>
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
					<label>
						Data da próxima etapa
						<input type="date" value={draft.nextStepOn} onChange={(event) => update("nextStepOn", event.target.value)} />
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
			<button type="submit" disabled={saving || !draft.jobPostingId} className="btn-block" aria-busy={saving}>
				{submitLabel}
			</button>
		</form>
	);
}
