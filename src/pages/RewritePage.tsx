import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiDownload, apiGet, apiPostJson, errorMessage } from "../api/client";
import type {
	AnalysisReportView,
	EditedDocumentsView,
	ResumeContact,
	ResumeTemplate,
	RewriteResultView,
	StructuredResume,
} from "../api/types";
import { Badge } from "../components/Badge";
import { BulletsSkeleton, ScoreRingSkeleton, Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { ResumeEditor } from "../components/ResumeEditor";
import { ResumePreview } from "../components/ResumePreview";
import { ProgressSteps, type ProgressStep } from "../components/ProgressSteps";
import { ScoreRing } from "../components/ScoreRing";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { TemplatePicker } from "../components/TemplatePicker";
import { parseOriginal } from "../lib/originalResume";
import { useSteppedProgress } from "../lib/useSteppedProgress";
import { AlertCircleIcon, ArrowRightIcon, DownloadIcon, SpinnerIcon } from "../components/icons";

type DownloadKind = "docx" | "pdf";

const DOWNLOAD_KINDS: DownloadKind[] = ["docx", "pdf"];

const VIEW_OPTIONS: { value: "preview" | "edit"; label: string }[] = [
	{ value: "preview", label: "Prévia" },
	{ value: "edit", label: "Editar" },
];

const REWRITE_STEPS: ProgressStep[] = [
	{ key: "READING", label: "Lendo o currículo" },
	{ key: "REWRITING", label: "Reescrevendo com IA" },
	{ key: "CHECKING", label: "Conferindo que nada foi inventado" },
	{ key: "EXPORTING", label: "Gerando PDF e DOCX" },
	{ key: "SCORING", label: "Calculando a nova nota" },
];
const REWRITE_POLL_INTERVAL_MS = 500;
const MIN_STEP_DISPLAY_MS = 900;

export function RewritePage() {
	const { id } = useParams<{ id: string }>();
	const [template, setTemplate] = useState<ResumeTemplate>("CLASSIC");
	const [hasJobContext, setHasJobContext] = useState(false);
	const [highlightJob, setHighlightJob] = useState(true);
	const [result, setResult] = useState<RewriteResultView | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [downloading, setDownloading] = useState<DownloadKind | null>(null);
	const [content, setContent] = useState<StructuredResume | null>(null);
	const [contact, setContact] = useState<ResumeContact>({});
	const [documents, setDocuments] = useState<{ resumeId?: string; docxVersionId?: string }>({});
	const [edited, setEdited] = useState(false);
	const [view, setView] = useState<"preview" | "edit">("preview");
	const [showChanges, setShowChanges] = useState(true);
	const [phase, setPhase] = useState<string | null>(null);
	const [pendingResponse, setPendingResponse] = useState<RewriteResultView | null>(null);
	const requested = useRef(false);
	function showResponse(response: RewriteResultView) {
		setResult(response);
		setContent(response.content ?? null);
		setContact(response.contact ?? {});
		setDocuments({ resumeId: response.resumeId, ...response.documents });
		setEdited(false);
		setPendingResponse(null);
		setLoading(false);
	}

	const phaseIndex = REWRITE_STEPS.findIndex((step) => step.key === phase);
	const shownStep = useSteppedProgress(
		pendingResponse ? REWRITE_STEPS.length : Math.max(phaseIndex, 0),
		MIN_STEP_DISPLAY_MS,
		(reached) => {
			if (pendingResponse && reached >= REWRITE_STEPS.length) {
				showResponse(pendingResponse);
			}
		},
	);
	const original = useMemo(() => parseOriginal(result?.originalSections ?? []), [result]);

	useEffect(() => {
		if (!id) {
			return;
		}
		apiGet<AnalysisReportView>(`/api/v1/analyses/${id}`)
			.then((analysis) => setHasJobContext(analysis.header?.hasJobContext ?? false))
			.catch(() => setHasJobContext(false));
	}, [id]);

	useEffect(() => {
		if (!id || !loading || pendingResponse) {
			return;
		}
		const timer = setInterval(() => {
			apiGet<{ phase?: string | null }>(`/api/v1/analyses/${id}/rewrite/progress`)
				.then((progress) => setPhase(progress.phase ?? null))
				.catch(() => undefined);
		}, REWRITE_POLL_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [id, loading, pendingResponse]);

	async function rewrite() {
		if (!id || requested.current) {
			return;
		}
		requested.current = true;
		setLoading(true);
		setPhase(null);
		try {
			const body = hasJobContext ? { template, highlightJob } : { template };
			const response = await apiPostJson<RewriteResultView>(`/api/v1/analyses/${id}/rewrite`, body);
			setPendingResponse(response);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra adaptar o currículo agora."));
			requested.current = false;
			setLoading(false);
		}
	}

	function editContent(updated: StructuredResume) {
		setContent(updated);
		setEdited(true);
	}

	function editContact(updated: ResumeContact) {
		setContact(updated);
		setEdited(true);
	}

	async function currentDocuments() {
		if (!edited || !content) {
			return documents;
		}
		const saved = await apiPostJson<EditedDocumentsView>(`/api/v1/analyses/${id}/rewrite/documents`, {
			template,
			content,
			contact,
		});
		const fresh = { resumeId: saved.resumeId, ...saved.documents };
		setDocuments(fresh);
		setEdited(false);
		return fresh;
	}

	async function download(kind: DownloadKind) {
		if (!result) {
			return;
		}
		setDownloading(kind);
		try {
			const current = await currentDocuments();
			if (!current.resumeId || !current.docxVersionId) {
				return;
			}
			const { blob, fileName } = await apiDownload(
				`/api/v1/resumes/${current.resumeId}/versions/${current.docxVersionId}/export?format=${kind.toUpperCase()}`,
			);
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			link.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra baixar o arquivo."));
		} finally {
			setDownloading(null);
		}
	}

	if (error) {
		return (
			<div className="page">
				<StateMessage
					variant="error"
					layout="page"
					message={error}
					action={{ label: "Voltar pro resultado", to: `/analyses/${id}` }}
				/>
			</div>
		);
	}

	if (loading) {
		return <RewritePageSkeleton currentIndex={shownStep} />;
	}

	if (!result) {
		return (
			<div className="page">
				<header className="page-header">
					<div>
						<span className="eyebrow">Reescrita</span>
						<h1>Escolha o template</h1>
					</div>
					<Link to={`/analyses/${id}`} className="link">
						Voltar pro resultado
					</Link>
				</header>

				<div className="form">
					<TemplatePicker value={template} onChange={setTemplate} />
					{hasJobContext && (
						<label className="toggle-option">
							<input
								type="checkbox"
								role="switch"
								checked={highlightJob}
								onChange={(event) => setHighlightJob(event.target.checked)}
							/>
							<span className="toggle-switch" aria-hidden="true" />
							<span className="toggle-option-text">
								<span className="toggle-option-title">Destacar pontos da vaga no currículo</span>
								<span className="toggle-option-desc">
									Reorganiza e dá destaque ao que você já tem e combina com a vaga. Nada é inventado.
								</span>
							</span>
						</label>
					)}
					<button type="button" className="btn-block" onClick={rewrite}>
						Adaptar currículo <ArrowRightIcon />
					</button>
				</div>
			</div>
		);
	}

	const before = result.scoreComparison?.before;
	const after = result.scoreComparison?.after;
	const hasDelta = before !== undefined && after !== undefined;
	const deltaUp = hasDelta && after >= before;

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Reescrita</span>
					<h1>Currículo adaptado</h1>
					{result.jobHighlighted && <Badge tone="info">Destacado para a vaga</Badge>}
					{result.aiModel && (
						<p className="page-subtitle">
							Gerado por {result.aiProvider ? `${result.aiProvider} · ` : ""}
							{result.aiModel}
						</p>
					)}
					<p className="page-subtitle">
						Salvo em{" "}
						<Link to="/resumes" className="link">
							Currículos › Gerados por análise
						</Link>
						. Seu currículo base continua igual.
					</p>
				</div>
				<Link to={`/analyses/${id}`} className="link">
					Voltar pro resultado
				</Link>
			</header>

			<div className="downloads">
				{DOWNLOAD_KINDS.map((kind) => (
					<button
						key={kind}
						type="button"
						className="btn-secondary"
						onClick={() => download(kind)}
						disabled={downloading !== null}
						aria-busy={downloading === kind}
					>
						{downloading === kind ? <SpinnerIcon /> : <DownloadIcon />}
						{downloading === kind ? (edited ? "Gerando..." : "Baixando...") : `Baixar ${kind.toUpperCase()}`}
					</button>
				))}
			</div>

			{edited && (
				<p className="edit-notice" role="status">
					Você editou o currículo: o arquivo é gerado de novo com suas alterações ao baixar. A nota abaixo é da versão
					adaptada pela IA.
				</p>
			)}

			{before !== undefined && after !== undefined && (
				<div className="score-compare">
					<ScoreRing value={before} label="antes" size="sm" />
					<div className="score-compare-delta">
						<ArrowRightIcon />
						{hasDelta && (
							<>
								<span
									className={`score-compare-delta-value ${deltaUp ? "score-compare-delta-up" : "score-compare-delta-down"}`}
								>
									{deltaUp ? "+" : ""}
									{after - before}
								</span>
								<span className="score-compare-delta-label">pontos</span>
							</>
						)}
					</div>
					<ScoreRing value={after} label="depois" size="sm" />
				</div>
			)}

			{(result.removedSkills ?? []).length > 0 && (
				<section>
					<h2>Removemos por não ter relação com a vaga</h2>
					<ul className="removed-skills">
						{(result.removedSkills ?? []).map((removed) => (
							<li key={removed.skill} className="removed-skill">
								<span className="removed-skill-name">{removed.skill}</span>
								<span className="removed-skill-reason">{removed.reason}</span>
							</li>
						))}
					</ul>
				</section>
			)}

			{(result.bullets?.items ?? []).some((bullet) => bullet.needsConfirmation) && (
				<section>
					<h2>Confira esses números</h2>
					<ul className="bullets">
						{(result.bullets?.items ?? [])
							.filter((bullet) => bullet.needsConfirmation)
							.map((bullet, index) => (
								<li key={index} className="bullet-card bullet-card-needs-confirmation">
									<div className="bullet-warning">
										<AlertCircleIcon />
										<span>{bullet.rewritten} — a IA pode ter generalizado o original.</span>
									</div>
								</li>
							))}
					</ul>
				</section>
			)}

			{content && (
				<section>
					<div className="preview-toolbar">
						<SegmentedTabs label="Modo" options={VIEW_OPTIONS} value={view} onChange={setView} />
						{view === "preview" && (
							<label className="preview-toggle">
								<input
									type="checkbox"
									checked={showChanges}
									onChange={(event) => setShowChanges(event.target.checked)}
								/>
								Mostrar o que mudou
							</label>
						)}
					</div>
					{view === "preview" ? (
						<>
							{showChanges && (
								<p className="diff-legend">
									<ins className="diff-added">verde</ins> é texto novo ou alterado,{" "}
									<del className="diff-removed">riscado</del> é o que saiu do original.
								</p>
							)}
							<ResumePreview
								content={content}
								contact={contact}
								original={original}
								template={template}
								showChanges={showChanges}
							/>
						</>
					) : (
						<ResumeEditor
							content={content}
							contact={contact}
							onContentChange={editContent}
							onContactChange={editContact}
						/>
					)}
				</section>
			)}
		</div>
	);
}

function RewritePageSkeleton({ currentIndex }: { currentIndex: number }) {
	return (
		<div className="page" aria-busy="true">
			<header className="page-header">
				<div>
					<span className="eyebrow">Reescrita</span>
					<h1>Currículo adaptado</h1>
				</div>
			</header>

			<ProgressSteps
				title="Adaptando seu currículo"
				hint="A IA reescreve, conferimos que nada foi inventado e geramos PDF e DOCX. Pode levar até um minuto."
				steps={REWRITE_STEPS}
				currentIndex={currentIndex}
			/>

			<div className="downloads" aria-hidden="true">
				<Skeleton width="100%" height={44} />
				<Skeleton width="100%" height={44} />
			</div>

			<div className="score-compare" aria-hidden="true">
				<ScoreRingSkeleton size={96} />
				<Skeleton width={60} height={24} />
				<ScoreRingSkeleton size={96} />
			</div>

			<section>
				<h2>Prévia</h2>
				<BulletsSkeleton />
			</section>
		</div>
	);
}
