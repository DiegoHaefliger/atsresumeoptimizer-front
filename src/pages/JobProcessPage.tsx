import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiPostJson, apiPutJson } from "../api/client";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { JobCode } from "../components/JobCode";
import { MoveStageDialog } from "../components/MoveStageDialog";
import { ProcessHistory } from "../components/ProcessHistory";
import { ProcessForm } from "../components/ProcessForm";
import { Skeleton } from "../components/Skeleton";
import { StageBadge } from "../components/StageBadge";
import { StateMessage } from "../components/StateMessage";
import { ArrowLeftIcon, ExternalLinkIcon, PencilIcon, TrashIcon } from "../components/icons";
import { draftFromProcess, EMPTY_PROCESS, processRequest, type ProcessDraft } from "../lib/processDraft";
import { formatDate } from "../lib/processLabels";
import { useJobs } from "../lib/useJobs";
import { PROCESSES_PATH, useProcesses } from "../lib/useProcesses";

export function JobProcessPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const { jobs, failed: jobsFailed } = useJobs();
	const { processes, failed: processesFailed, reload, moveStage, remove } = useProcesses();
	const [editing, setEditing] = useState(false);
	const [moving, setMoving] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const job = jobs?.find((candidate) => candidate.id === jobId) ?? null;
	const process = processes?.find((candidate) => candidate.jobPostingId === jobId) ?? null;

	async function create(draft: ProcessDraft) {
		await apiPostJson(PROCESSES_PATH, processRequest(draft));
		reload();
	}

	async function update(draft: ProcessDraft) {
		await apiPutJson(`${PROCESSES_PATH}/${process?.id}`, processRequest(draft));
		reload();
		setEditing(false);
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
				<Link to="/jobs" className="page-back">
					<ArrowLeftIcon /> Voltar
				</Link>
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
				<section className="panel panel-body process-detail">
					<div className="process-detail-top">
						<StageBadge stage={process.stage} />
						<div className="process-detail-actions">
							<button type="button" className="process-action" onClick={() => setMoving(true)}>
								Mover etapa
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
					</div>
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
						{process.nextStepOn && <Fact label="Próxima etapa">{formatDate(process.nextStepOn)}</Fact>}
						{process.contactName && <Fact label="Contato">{process.contactName}</Fact>}
						{process.contactEmail && <Fact label="E-mail do contato">{process.contactEmail}</Fact>}
						{process.salary != null && <Fact label="Remuneração">R$ {process.salary.toLocaleString("pt-BR")}</Fact>}
						{process.notes && <Fact label="Observações">{process.notes}</Fact>}
					</dl>
					<ProcessHistory key={process.updatedAt} processId={process.id} currentStage={process.stage} />
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
					<MoveStageDialog process={moving ? process : null} onClose={() => setMoving(false)} onMove={moveStage} />
				</section>
			)}
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
