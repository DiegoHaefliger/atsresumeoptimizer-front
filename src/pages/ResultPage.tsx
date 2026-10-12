import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, errorMessage } from "../api/client";
import type { AnalysisReportView } from "../api/types";
import { FindingsPanel } from "../components/FindingsPanel";
import { KeywordsEditor } from "../components/KeywordsEditor";
import { ProgressSteps, type ProgressStep } from "../components/ProgressSteps";
import { ResultSummary } from "../components/ResultSummary";
import { FindingsSkeleton, KeywordsSkeleton, ScoreRingSkeleton, Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { AlertCircleIcon } from "../components/icons";
import { dimensionLabel } from "../lib/analysisLabels";
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
	const currentStatus = result?.header?.status;
	const shownStep = useSteppedProgress(STATUS_STEP_INDEX[currentStatus ?? "PENDING"] ?? 0, MIN_STEP_DISPLAY_MS);

	async function reloadResult() {
		if (id) {
			setResult(await apiGet<AnalysisReportView>(`/api/v1/analyses/${id}`));
		}
	}

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
				<StateMessage variant="error" layout="page" message={error} action={{ label: "Voltar pra vagas", to: "/jobs" }} />
			</div>
		);
	}

	if (!result) {
		return <ResultPageSkeleton />;
	}

	const status = result.header?.status;
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
		<div className="page result-page">
			<ResultPageHeader />

			{status === "FAILED" && (
				<p className="alert alert-error" role="alert">
					<AlertCircleIcon />
					<span>{result.error ?? "A análise falhou."}</span>
				</p>
			)}

			{id && <ResultSummary analysisId={id} result={result} canAdapt={REWRITABLE_STATUSES.has(status ?? "")} />}

			<div className="result-grid">
				{dimensions.length > 0 && (
					<section className="panel result-panel" aria-labelledby="result-dimensions">
						<div className="panel-header">
							<h2 id="result-dimensions">Dimensões</h2>
							<p>Como o currículo foi avaliado em cada critério, de 0 a 100.</p>
						</div>
						<div className="panel-body">
							<div className="dimensions">
								{dimensions.map((dimension) => {
									const tone = scoreTone(dimension.score ?? 0);
									return (
										<div className="dimension-row" key={dimension.code}>
											<div className="dimension-row-top">
												<span className="dimension-name">{dimensionLabel(dimension.code ?? "")}</span>
												<span className={`dimension-score dimension-score-${tone}`}>{dimension.score}</span>
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
						</div>
					</section>
				)}

				{keywords && (
					<section className="panel result-panel" aria-labelledby="result-keywords">
						<div className="panel-header">
							<h2 id="result-keywords">Palavras-chave</h2>
							<p>Termos da vaga procurados no currículo.</p>
						</div>
						<div className="panel-body">
							{keywords.editable && id ? (
								<KeywordsEditor
									key={JSON.stringify([keywords.terms, keywords.selected, keywords.found, keywords.missing])}
									analysisId={id}
									keywords={keywords}
									onSaved={reloadResult}
								/>
							) : (
								<div className="keyword-groups">
									<KeywordGroup label="Encontradas" tone="found" words={keywords.found} emptyText="Nenhuma ainda" />
									<KeywordGroup label="Faltando" tone="missing" words={keywords.missing} emptyText="Nenhuma" />
									{keywords.semanticOnly && keywords.semanticOnly.length > 0 && (
										<KeywordGroup label="Só por semântica" tone="semantic" words={keywords.semanticOnly} />
									)}
								</div>
							)}
						</div>
					</section>
				)}
			</div>

			{id && result.findings?.items && TERMINAL_STATUSES.has(status ?? "") && (
				<FindingsPanel analysisId={id} findings={result.findings.items} />
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
			<div className="panel result-summary">
				<ScoreRingSkeleton />
				<div className="result-summary-main">
					<Skeleton width={90} height={22} radius="var(--radius-full)" />
					<Skeleton width="60%" height={22} />
					<Skeleton width="80%" height={14} />
				</div>
			</div>
			<div className="result-grid">
				<section className="panel result-panel">
					<div className="panel-body">
						<div className="dimensions">
							{Array.from({ length: 5 }).map((_, index) => (
								<div className="dimension-row" key={index}>
									<Skeleton width="100%" height={8} radius="var(--radius-full)" />
								</div>
							))}
						</div>
					</div>
				</section>
				<section className="panel result-panel">
					<div className="panel-body">
						<KeywordsSkeleton />
					</div>
				</section>
			</div>
			<section className="panel result-panel">
				<div className="panel-body">
					<FindingsSkeleton />
				</div>
			</section>
		</div>
	);
}
