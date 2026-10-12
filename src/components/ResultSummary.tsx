import { Link } from "react-router-dom";
import type { AnalysisReportView } from "../api/types";
import { modeLabel, statusLabel, statusTone } from "../lib/analysisLabels";
import { URGENT_SEVERITIES } from "../lib/findingLabels";
import { rewritePath } from "../lib/rewriteRoutes";
import { scoreTone, type ScoreTone } from "../lib/score";
import { Badge } from "./Badge";
import { ArrowRightIcon } from "./icons";
import { ScoreRing } from "./ScoreRing";

type ResultSummaryProps = {
	analysisId: string;
	result: AnalysisReportView;
	canAdapt: boolean;
};

const VERDICTS: Record<ScoreTone, { title: string; text: string }> = {
	high: { title: "Bem preparado para ATS", text: "O currículo passa bem pelos robôs de triagem. Dá pra lapidar os detalhes abaixo." },
	mid: { title: "Bom, mas dá pra melhorar", text: "Alguns ajustes devem subir a nota. Comece pelos pontos críticos." },
	low: { title: "Precisa de ajustes antes de enviar", text: "Há pontos que podem barrar o currículo na triagem. Veja o que melhorar." },
};

const HEALTHY_DIMENSION_SCORE = 80;

function Stat({ value, label }: { value: string; label: string }) {
	return (
		<div className="result-stat">
			<span className="result-stat-value">{value}</span>
			<span className="result-stat-label">{label}</span>
		</div>
	);
}

export function ResultSummary({ analysisId, result, canAdapt }: ResultSummaryProps) {
	const overall = result.score?.overall;
	const status = result.header?.status;
	const mode = result.header?.mode;
	const dimensions = result.score?.dimensions ?? [];
	const keywords = result.keywords;
	const keywordTotal = (keywords?.found?.length ?? 0) + (keywords?.missing?.length ?? 0) + (keywords?.semanticOnly?.length ?? 0);
	const urgent = (result.findings?.items ?? []).filter((finding) => URGENT_SEVERITIES.has(finding.severity ?? "")).length;
	const healthy = dimensions.filter((dimension) => (dimension.score ?? 0) >= HEALTHY_DIMENSION_SCORE).length;
	const verdict = overall != null ? VERDICTS[scoreTone(overall)] : null;
	const hasAdapted = result.header?.hasAdaptedResume;

	return (
		<section className="panel result-summary" aria-label="Resumo da análise">
			{overall != null && <ScoreRing value={overall} label="score geral" />}
			<div className="result-summary-main">
				<div className="result-summary-tags">
					{status && <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>}
					{mode && <span className="result-summary-mode">{modeLabel(mode)}</span>}
				</div>
				{verdict && (
					<>
						<h2 className="result-summary-title">{verdict.title}</h2>
						<p className="result-summary-text">{verdict.text}</p>
					</>
				)}
				<div className="result-stats">
					{keywordTotal > 0 && <Stat value={`${keywords?.found?.length ?? 0}/${keywordTotal}`} label="palavras-chave encontradas" />}
					<Stat value={String(urgent)} label={urgent === 1 ? "ponto crítico" : "pontos críticos"} />
					{dimensions.length > 0 && <Stat value={`${healthy}/${dimensions.length}`} label="dimensões no verde" />}
				</div>
			</div>
			{canAdapt && (
				<div className="result-summary-actions">
					{hasAdapted && (
						<Link to={rewritePath(analysisId, true)} className="button-link">
							Ver currículo adaptado{result.header?.hasJobContext ? " e apresentação" : ""} <ArrowRightIcon />
						</Link>
					)}
					<Link to={rewritePath(analysisId)} className={hasAdapted ? "button-link button-link-secondary" : "button-link"}>
						{hasAdapted ? "Adaptar de novo" : "Adaptar currículo"} <ArrowRightIcon />
					</Link>
					<span className="result-summary-hint">Gera uma versão ajustada, sem mexer no currículo base.</span>
				</div>
			)}
		</section>
	);
}
