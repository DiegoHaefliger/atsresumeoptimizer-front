import { useState } from "react";
import { apiGet } from "../api/client";
import type { AnalysisAtsView, FindingView } from "../api/types";
import { dimensionLabel } from "../lib/analysisLabels";
import { MINOR_SEVERITY, severityLabel, severityRank, severityTone } from "../lib/findingLabels";
import { Badge } from "./Badge";
import { CheckCircleIcon } from "./icons";

type FindingsPanelProps = {
	analysisId: string;
	findings: FindingView[];
};

const MAX_SUGGESTIONS = 3;

function shortSuggestion(suggestion: string | undefined): string | undefined {
	if (!suggestion?.trim()) {
		return undefined;
	}
	const options = suggestion.split(",").map((option) => option.trim());
	return options.length > MAX_SUGGESTIONS ? `${options.slice(0, MAX_SUGGESTIONS).join(", ")}…` : suggestion;
}

function excerpt(finding: FindingView, rawText: string | null): string | null {
	const { start, end } = finding.range ?? {};
	return rawText && start != null && end != null ? rawText.slice(start, end) : null;
}

type FindingItemProps = { finding: FindingView; rawText: string | null; compact?: boolean };

function FindingItem({ finding, rawText, compact = false }: FindingItemProps) {
	const tone = severityTone(finding.severity);
	const marked = excerpt(finding, rawText);
	const suggestion = compact ? shortSuggestion(finding.suggestion) : finding.suggestion?.trim();
	return (
		<li className={`finding-card finding-card-${tone}${compact ? " finding-card-compact" : ""}`}>
			{!compact && (
				<div className="finding-card-top">
					<Badge tone={tone}>{severityLabel(finding.severity)}</Badge>
					{finding.dimension && <span className="finding-dimension">{dimensionLabel(finding.dimension)}</span>}
				</div>
			)}
			<p className="finding-message">
				{marked && <mark className="finding-excerpt">{marked}</mark>} {finding.message}
			</p>
			{suggestion && <p className="finding-suggestion">Sugestão: {suggestion}</p>}
		</li>
	);
}

export function FindingsPanel({ analysisId, findings }: FindingsPanelProps) {
	const [rawText, setRawText] = useState<string | null>(null);
	const ordered = [...findings].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
	const main = ordered.filter((finding) => finding.severity !== MINOR_SEVERITY);
	const minor = ordered.filter((finding) => finding.severity === MINOR_SEVERITY);

	function loadText(open: boolean) {
		if (open && rawText === null) {
			apiGet<AnalysisAtsView>(`/api/v1/analyses/${analysisId}/ats-view`)
				.then((view) => setRawText(view.rawText ?? ""))
				.catch(() => setRawText(""));
		}
	}

	return (
		<section className="panel result-panel" aria-labelledby="result-findings">
			<div className="panel-header">
				<h2 id="result-findings">O que melhorar</h2>
				<p>
					{findings.length > 0
						? "Do mais importante pro menos. Corrigir os críticos é o que mais sobe a nota."
						: "Nada pra ajustar nesta análise."}
				</p>
			</div>
			<div className="panel-body">
				{main.length > 0 ? (
					<ul className="findings">
						{main.map((finding, index) => (
							<FindingItem key={`${finding.code}-${index}`} finding={finding} rawText={rawText} />
						))}
					</ul>
				) : (
					<p className="findings-clear">
						<CheckCircleIcon /> Nenhum ponto importante a corrigir.
					</p>
				)}
				{minor.length > 0 && (
					<details className="findings-minor" onToggle={(event) => loadText(event.currentTarget.open)}>
						<summary>Ajustes menores ({minor.length})</summary>
						<p className="field-hint">Possíveis erros de escrita. Confira antes de mudar: nomes e termos técnicos às vezes aparecem aqui.</p>
						<ul className="findings">
							{minor.map((finding, index) => (
								<FindingItem key={`${finding.code}-${index}`} finding={finding} rawText={rawText} compact />
							))}
						</ul>
					</details>
				)}
			</div>
		</section>
	);
}
