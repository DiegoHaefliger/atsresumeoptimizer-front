import { useState } from "react";
import { useParams } from "react-router-dom";
import { apiPostJson, apiPutJson } from "../api/client";
import { BackLink } from "../components/BackLink";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { JobCode } from "../components/JobCode";
import { JobCostDialog } from "../components/JobCostDialog";
import { MoveStageDialog } from "../components/MoveStageDialog";
import { ProcessForm } from "../components/ProcessForm";
import { ProcessHistory } from "../components/ProcessHistory";
import { ScheduleDialog } from "../components/ScheduleDialog";
import { Skeleton } from "../components/Skeleton";
import { StageBadge } from "../components/StageBadge";
import { StateMessage } from "../components/StateMessage";
import { CoinsIcon, ExternalLinkIcon, PencilIcon, TrashIcon } from "../components/icons";
import { draftFromProcess, EMPTY_PROCESS, processRequest, type ProcessDraft } from "../lib/processDraft";
import { formatDate, formatDateTime, STAGE_LABELS } from "../lib/processLabels";
import { PROCESSES_PATH } from "../lib/processPath";
import { createSchedule } from "../lib/scheduleApi";
import { emptyScheduleDraft, type ScheduleDraft } from "../lib/scheduleDraft";
import { useJobs } from "../lib/useJobs";
import { useProcesses } from "../lib/useProcesses";

export function JobProcessPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const { jobs, failed: jobsFailed } = useJobs();
	const { processes, failed: processesFailed, reload, moveStage, remove } = useProcesses();
	const [editing, setEditing] = useState(false);
	const [moving, setMoving] = useState(false);
	const [scheduling, setScheduling] = useState(false);
	const [costOpen, setCostOpen] = useState(false);
	const [historyVersion, setHistoryVersion] = useState(0);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const job = jobs?.find((candidate) => candidate.id === jobId) ?? null;
	const process = processes?.find((candidate) => candidate.jobPostingId === jobId) ?? null;

	const nextStep = process?.nextSchedule
		? `${formatDateTime(process.nextSchedule.scheduledAt)} - ${STAGE_LABELS[process.nextSchedule.stage]}`
		: process?.nextStepOn
			? formatDate(process.nextStepOn)
			: null;

	async function create(draft: ProcessDraft) {
		await apiPostJson(PROCESSES_PATH, processRequest(draft));
		reload();
	}

	async function update(draft: ProcessDraft) {
		await apiPutJson(`${PROCESSES_PATH}/${process?.id}`, processRequest(draft));
		reload();
		setEditing(false);
	}

	async function schedule(draft: ScheduleDraft) {
		await createSchedule(process?.id ?? "", draft);
		setHistoryVersion((version) => version + 1);
		reload();
	}

	async function confirmDelete(processId: string) {
		setDeleting(true);
		await remove(processId);
		setDeleting(false);
		setConfirmingDelete(false);
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Processo seletivo</span>
					<h1>{job ? <><JobCode code={job.code} /> {job.title ?? "Vaga sem título"}</> : "Processo seletivo"}</h1>
					{job?.company && <p className="page-subtitle">{job.company}</p>}
				</div>
				<div className="page-header-actions">
					{job && (
						<button type="button" className="page-back" aria-label="Custo de IA" title="Custo de IA" onClick={() => setCostOpen(true)}>
							<CoinsIcon />
						</button>
					)}
					<BackLink fallback="/jobs" />
				</div>
			</header>

			{jobsFailed || processesFailed || (jobs !== null && !job) ? (
				<StateMessage
					variant="error"
					layout="page"
					message="Não deu pra carregar essa vaga."
					action={{ label: "Voltar pras vagas", to: "/jobs" }}
				/>
			) : !job || processes === null ? (
				<div className="form form-narrow" role="status" aria-busy="true">
					<span className="sr-only">Carregando processo...</span>
					<Skeleton width="100%" height={240} radius="var(--radius-lg)" />
				</div>
			) : !process ? (
				<>
					<p className="page-subtitle">Essa vaga ainda não tem processo seletivo. Cadastre pra acompanhar as etapas.</p>
					<ProcessForm
						initial={{ ...EMPTY_PROCESS, jobPostingId: job.id, processUrl: job.interviewUrl ?? "" }}
						submitLabel="Cadastrar processo"
						chooseStage
						onSave={create}
					/>
				</>
			) : editing ? (
				<ProcessForm
					initial={draftFromProcess(process)}
					submitLabel="Salvar alterações"
					chooseStage={false}
					onSave={update}
					onCancel={() => setEditing(false)}
				/>
			) : (
				<div className="process-layout">
					<section className="panel panel-body process-toolbar" aria-label="Situação do processo">
						<div className="process-toolbar-status">
							<StageBadge stage={process.stage} />
							<span className="process-toolbar-next">
								{nextStep ? (
									<>
										<small>Próxima etapa</small>
										<strong>{nextStep}</strong>
									</>
								) : (
									<small>Nenhuma próxima etapa agendada</small>
								)}
							</span>
						</div>
						<div className="process-detail-actions">
							<button type="button" className="process-action" onClick={() => setMoving(true)}>
								Mover etapa
							</button>
							<button type="button" className="process-action" onClick={() => setScheduling(true)}>
								Agendar
							</button>
							<button
								type="button"
								className="process-action process-action-icon"
								aria-label="Editar processo"
								title="Editar"
								onClick={() => setEditing(true)}
							>
								<PencilIcon />
							</button>
							<button
								type="button"
								className="process-action process-action-icon"
								aria-label="Excluir processo"
								title="Excluir"
								onClick={() => setConfirmingDelete(true)}
							>
								<TrashIcon />
							</button>
						</div>
					</section>
					<div className="process-columns">
						<section className="panel panel-body process-details" aria-labelledby="process-details-heading">
							<h2 id="process-details-heading" className="process-section-title">
								Detalhes
							</h2>
							<dl className="process-facts">
								{job.sourceUrl && (
									<Fact label="Link da vaga">
										<a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="link">
											Abrir <ExternalLinkIcon />
										</a>
									</Fact>
								)}
								{process.processUrl && (
									<Fact label="Link do processo seletivo">
										<a href={process.processUrl} target="_blank" rel="noopener noreferrer" className="link">
											Abrir <ExternalLinkIcon />
										</a>
									</Fact>
								)}
								{process.appliedOn && <Fact label="Candidatura">{formatDate(process.appliedOn)}</Fact>}
								{process.contactName && <Fact label="Contato">{process.contactName}</Fact>}
								{process.contactEmail && <Fact label="E-mail do contato">{process.contactEmail}</Fact>}
								{process.contactPhone && <Fact label="Telefone do contato">{process.contactPhone}</Fact>}
								{process.salary != null && <Fact label="Remuneração">R$ {process.salary.toLocaleString("pt-BR")}</Fact>}
								{process.notes && <Fact label="Observações">{process.notes}</Fact>}
							</dl>
						</section>
						<section className="panel panel-body process-timeline" aria-label="Histórico">
							<ProcessHistory
								key={`${process.updatedAt}:${historyVersion}`}
								processId={process.id}
								currentStage={process.stage}
								onScheduleChange={reload}
							/>
						</section>
					</div>
					<ConfirmDialog
						open={confirmingDelete}
						title="Excluir processo seletivo?"
						confirmLabel="Excluir processo"
						busy={deleting}
						onConfirm={() => confirmDelete(process.id)}
						onCancel={() => setConfirmingDelete(false)}
					>
						<p>O processo seletivo desta vaga e o histórico de etapas serão apagados. Não dá pra desfazer.</p>
					</ConfirmDialog>
					<MoveStageDialog process={moving ? process : null} onClose={() => setMoving(false)} onMove={moveStage} onHistoryChange={reload} />
					<ScheduleDialog
						title="Agendar etapa"
						initial={scheduling ? emptyScheduleDraft(process.stage) : null}
						onClose={() => setScheduling(false)}
						onSave={schedule}
					/>
				</div>
			)}

			{job && <JobCostDialog jobId={job.id} open={costOpen} onClose={() => setCostOpen(false)} />}
		</div>
	);
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="process-fact">
			<dt>{label}</dt>
			<dd>{children}</dd>
		</div>
	);
}
