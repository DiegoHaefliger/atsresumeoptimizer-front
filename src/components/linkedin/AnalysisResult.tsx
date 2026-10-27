import type { LinkedInAnalysisResponse } from "../../api/linkedinTypes";
import { formatCapturedAt } from "../../lib/linkedinLabels";
import { scoreDelta, weakestFirst } from "../../lib/linkedinSections";
import { ScoreRing } from "../ScoreRing";
import { SectionReviewCard } from "./SectionReviewCard";

export function AnalysisResult({ analysis, previousScore }: { analysis: LinkedInAnalysisResponse; previousScore?: number }) {
	const delta = scoreDelta(analysis.overallScore, previousScore);
	return (
		<div className="settings-main">
			<section className="panel">
				<div className="panel-body linkedin-overview">
					<ScoreRing value={analysis.overallScore} label="Perfil" />
					<div>
						<p className="field-hint">
							Análise de {formatCapturedAt(analysis.createdAt)}
							{delta !== null && delta !== 0 && ` · ${delta > 0 ? "+" : ""}${delta} pontos desde a anterior`}
							{!analysis.imagesAnalyzed && " · foto e banner não foram avaliados"}
						</p>
						<p>{analysis.summary}</p>
						{analysis.targetFit && <p>{analysis.targetFit}</p>}
					</div>
				</div>
			</section>
			{analysis.topActions.length > 0 && (
				<section className="panel">
					<div className="panel-header">
						<h2>Faça primeiro</h2>
						<p>Os ajustes de maior impacto, em ordem.</p>
					</div>
					<ol className="panel-body linkedin-steps">
						{analysis.topActions.map((action) => (
							<li key={action}>{action}</li>
						))}
					</ol>
				</section>
			)}
			<section className="panel">
				<div className="panel-header">
					<h2>Palavras-chave de recrutador</h2>
				</div>
				<div className="panel-body">
					<p className="field-hint">Já aparecem no seu perfil:</p>
					<Pills values={analysis.recruiterKeywords} className="keyword-pill-found" />
					<p className="field-hint">Faltam (inclua só se for verdade):</p>
					<Pills values={analysis.missingKeywords} className="keyword-pill-missing" />
				</div>
			</section>
			<h2 className="linkedin-sections-title">Seção por seção</h2>
			{weakestFirst(analysis.sections).map((review) => (
				<SectionReviewCard key={review.section} review={review} />
			))}
		</div>
	);
}

function Pills({ values, className }: { values: string[]; className: string }) {
	if (values.length === 0) {
		return <p className="keyword-empty">Nenhuma.</p>;
	}
	return (
		<div className="keyword-pills">
			{values.map((value) => (
				<span key={value} className={`keyword-pill ${className}`}>
					{value}
				</span>
			))}
		</div>
	);
}
