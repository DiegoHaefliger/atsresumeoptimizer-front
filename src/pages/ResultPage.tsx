import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet, errorMessage } from "../api/client";
import type { AnalysisReportView } from "../api/types";
import { Badge } from "../components/Badge";
import { PreferenceMatchPanel } from "../components/PreferenceMatchPanel";
import { ProgressSteps, type ProgressStep } from "../components/ProgressSteps";
import { ScoreRing } from "../components/ScoreRing";
import { FindingsSkeleton, KeywordsSkeleton, ScoreRingSkeleton, Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { AlertCircleIcon, ArrowRightIcon } from "../components/icons";
import { modeLabel, statusLabel, statusTone } from "../lib/analysisLabels";
import { scoreTone } from "../lib/score";
import { useSteppedProgress } from "../lib/useSteppedProgress";

const TERMINAL_STATUSES = new Set(["COMPLETED", "PARTIAL", "FAILED", "REJECTED"]);
const ANALYSIS_STEPS: ProgressStep[] = [
	{ key: "PENDING", label: "Na fila" },
	{ key: "PARSING", label: "Lendo o currículo" },
	{ key: "ANALYZING", label: "Analisando com IA e regras de ATS" },
];
const ANALYSIS_POLL_INTERVAL_MS = 500;
const MIN_STEP_DISPLAY_MS = 900;
const STATUS_STEP_INDEX: Record<string, number> = {
	PENDING: 0,
	PARSING: 1,
	ANALYZING: 2,
	COMPLETED: ANALYSIS_STEPS.length,
	PARTIAL: ANALYSIS_STEPS.length,
};
const REWRITABLE_STATUSES = new Set(["COMPLETED", "PARTIAL"]);

export function ResultPage() {
	const { id } = useParams<{ id: string }>();
	const [result, setResult] = useState<AnalysisReportView | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [sawProcessing, setSawProcessing] = useState(false);
	const navigate = useNavigate();
	const currentStatus = result?.header?.status;
	const shownStep = useSteppedProgress(STATUS_STEP_INDEX[currentStatus ?? "PENDING"] ?? 0, MIN_STEP_DISPLAY_MS);

	useEffect(() => {
		if (!id) {
			return;
		}
		let cancelled = false;
		let timer: ReturnType<typeof setTimeout>;

		async function poll() {
			try {
				const data = await apiGet<AnalysisReportView>(`/api/v1/analyses/${id}`);
				if (cancelled) {
					return;
				}
				setResult(data);
				if (data.header?.status && !TERMINAL_STATUSES.has(data.header.status)) {
					setSawProcessing(true);
				}
				if (data.header?.status && !TERMINAL_STATUSES.has(data.header.status)) {
					timer = setTimeout(poll, ANALYSIS_POLL_INTERVAL_MS);
				}
			} catch (err) {
				if (!cancelled) {
					setError(errorMessage(err, "Não deu pra consultar a análise."));
				}
			}
		}

		poll();
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [id]);

	if (error) {
		return (
			<div className="page">
				<StateMessage variant="error" layout="page" message={error} action={{ label: "Voltar", to: "/upload" }} />
			</div>
		);
	}

	if (!result) {
		return <ResultPageSkeleton />;
	}

	const status = result.header?.status;
	const mode = result.header?.mode;
	const dimensions = result.score?.dimensions ?? [];
	const keywords = result.keywords;
	const processing = status !== undefined && !TERMINAL_STATUSES.has(status);
	const catchingUp = sawProcessing && shownStep < (STATUS_STEP_INDEX[status ?? ""] ?? 0);

	if (processing || catchingUp) {
		return (
			<div className="page">
				<ResultPageHeader />
				<ProgressSteps
					title="Analisando seu currículo"
					hint="Costuma levar menos de um minuto. Essa tela atualiza sozinha."
					steps={ANALYSIS_STEPS}
					currentIndex={shownStep}
				/>
				<ResultBodySkeleton />
			</div>
		);
	}

	return (
		<div className="page">
			<ResultPageHeader />

			{status === "FAILED" && (
				<p className="alert alert-error" role="alert">
					<AlertCircleIcon />
					<span>{result.error ?? "A análise falhou."}</span>
				</p>
			)}

			<div className="result-hero">
				{result.score && <ScoreRing value={result.score.overall ?? 0} label="score geral" />}
				<div className="result-hero-meta">
					<div className="result-hero-status">
						{status && <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>}
					</div>
					{mode && <span className="result-hero-mode">{modeLabel(mode)}</span>}
				</div>
			</div>

			{mode === "JOB_MATCH" && TERMINAL_STATUSES.has(status ?? "") && (
				<PreferenceMatchPanel job={result.job} match={result.preferenceMatch} />
			)}

			<div className="result-grid">
				{dimensions.length > 0 && (
					<section>
						<h2>Dimensões</h2>
						<div className="dimensions">
							{dimensions.map((dimension) => {
								const tone = scoreTone(dimension.score ?? 0);
								return (
									<div className="dimension-row" key={dimension.code}>
										<div className="dimension-row-top">
											<span className="dimension-name">{dimension.code}</span>
											<span className="dimension-score">{dimension.score}</span>
										</div>
										<div className="dimension-track">
											<div
												className={`dimension-fill dimension-fill-${tone}`}
												style={{ width: `${dimension.score ?? 0}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</section>
				)}

				{keywords && (
					<section>
						<h2>Palavras-chave</h2>
						<div className="keyword-groups">
							<KeywordGroup label="Encontradas" tone="found" words={keywords.found} emptyText="Nenhuma ainda" />
							<KeywordGroup label="Faltando" tone="missing" words={keywords.missing} emptyText="Nenhuma" />
							{keywords.semanticOnly && keywords.semanticOnly.length > 0 && (
								<KeywordGroup label="Só por semântica" tone="semantic" words={keywords.semanticOnly} />
							)}
						</div>
					</section>
				)}
			</div>

			{status && REWRITABLE_STATUSES.has(status) && (
				<button
					type="button"
					className="btn-block result-cta"
					onClick={() => navigate(`/analyses/${id}/rewrite`)}
				>
					Adaptar currículo <ArrowRightIcon />
				</button>
			)}
		</div>
	);
}

type KeywordGroupProps = {
	label: string;
	tone: "found" | "missing" | "semantic";
	words: string[] | undefined;
	emptyText?: string;
};

function KeywordGroup({ label, tone, words = [], emptyText }: KeywordGroupProps) {
	return (
		<div>
			<span className="keyword-group-label">{label}</span>
			<div className="keyword-pills">
				{words.length > 0
					? words.map((word) => (
							<span className={`keyword-pill keyword-pill-${tone}`} key={word}>
								{word}
							</span>
						))
					: emptyText && <span className="keyword-empty">{emptyText}</span>}
			</div>
		</div>
	);
}

function ResultPageHeader() {
	return (
		<header className="page-header">
			<div>
				<span className="eyebrow">Análise</span>
				<h1>Resultado da análise</h1>
			</div>
			<Link to="/upload" className="link">
				Nova análise
			</Link>
		</header>
	);
}

function ResultPageSkeleton() {
	return (
		<div className="page" role="status" aria-live="polite" aria-busy="true">
			<span className="sr-only">Carregando análise...</span>
			<ResultPageHeader />
			<ResultBodySkeleton />
		</div>
	);
}

function ResultBodySkeleton() {
	return (
		<div aria-hidden="true">
			<div className="result-hero">
				<ScoreRingSkeleton />
				<div className="result-hero-meta">
					<Skeleton width={90} height={24} radius="var(--radius-full)" />
					<Skeleton width={140} height={16} />
				</div>
			</div>

			<section>
				<h2>Dimensões</h2>
				<div className="dimensions">
					{Array.from({ length: 4 }).map((_, index) => (
						<div className="dimension-row" key={index}>
							<Skeleton width="100%" height={8} radius="var(--radius-full)" />
						</div>
					))}
				</div>
			</section>

			<section>
				<h2>Palavras-chave</h2>
				<KeywordsSkeleton />
			</section>

			<section>
				<h2>Achados</h2>
				<FindingsSkeleton />
			</section>
		</div>
	);
}
