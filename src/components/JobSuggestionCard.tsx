import { useState } from "react";
import type { JobSuggestion } from "../api/types";
import { formatDate } from "../lib/processLabels";
import { scoreTone } from "../lib/score";
import { openLinkLabel, sourceLabel } from "../lib/suggestionLabels";
import type { SuggestionView } from "../lib/useJobSuggestions";
import { BusyLabel } from "./BusyLabel";

type JobSuggestionCardProps = {
	suggestion: JobSuggestion & { id: string };
	view: SuggestionView;
	busy: boolean;
	onPromote: (id: string) => void;
	onDiscard: (id: string) => void;
	onRestore: (id: string) => void;
};

export function JobSuggestionCard({ suggestion, view, busy, onPromote, onDiscard, onRestore }: JobSuggestionCardProps) {
	const [promoting, setPromoting] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const details = [suggestion.company, suggestion.location, suggestion.postedOn ? `publicada em ${formatDate(suggestion.postedOn)}` : null]
		.filter(Boolean)
		.join(" · ");

	function promote() {
		setPromoting(true);
		onPromote(suggestion.id);
	}

	return (
		<article className="job-card suggestion-card">
			<header className="job-card-top">
				<span className="suggestion-source">{sourceLabel(suggestion.source)}</span>
				{suggestion.score != null ? (
					<span className={`preference-score preference-score-${scoreTone(suggestion.score)}`} title="Aderência às suas preferências">
						{suggestion.score}% de aderência
					</span>
				) : (
					<span className="suggestion-no-score" title="A vaga não informa o bastante para calcular a aderência">
						Sem nota
					</span>
				)}
			</header>
			<div className="job-card-heading">
				<h3 className="job-card-title">{suggestion.title}</h3>
				{details && <p className="job-card-details">{details}</p>}
			</div>
			{suggestion.description && (
				<div className="suggestion-description">
					<p className={expanded ? "suggestion-text suggestion-text-open" : "suggestion-text"}>{suggestion.description}</p>
					<button type="button" className="suggestion-toggle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
						{expanded ? "Ver menos" : "Ver descrição completa"}
					</button>
				</div>
			)}
			<footer className="job-card-footer suggestion-actions">
				{suggestion.url && (
					<a href={suggestion.url} target="_blank" rel="noopener noreferrer" className="suggestion-link">
						{openLinkLabel(suggestion.source)}
					</a>
				)}
				<div className="suggestion-buttons">
					{view === "discarded" ? (
						<button type="button" className="btn-small btn-secondary" disabled={busy} onClick={() => onRestore(suggestion.id)}>
							Restaurar
						</button>
					) : (
						<button type="button" className="btn-small btn-secondary" disabled={busy} onClick={() => onDiscard(suggestion.id)}>
							Descartar
						</button>
					)}
					<button type="button" className="btn-small" disabled={busy} aria-busy={promoting} onClick={promote}>
						<BusyLabel busy={promoting} busyText="Promovendo...">
							{view === "below" ? "Promover mesmo assim" : "Promover a vaga"}
						</BusyLabel>
					</button>
				</div>
			</footer>
		</article>
	);
}
