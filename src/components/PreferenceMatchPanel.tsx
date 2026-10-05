import { Link } from "react-router-dom";
import type { AnalysisJobView, PreferenceMatch } from "../api/types";
import { criterionLabel, matchStatusLabel, matchStatusTone, workModelLabel } from "../lib/jobLabels";
import { Badge } from "./Badge";
import { ScoreRing } from "./ScoreRing";

type PreferenceMatchPanelProps = {
	job: AnalysisJobView | undefined;
	match: PreferenceMatch | undefined;
};

export function PreferenceMatchPanel({ job, match }: PreferenceMatchPanelProps) {
	const criteria = match?.criteria ?? [];

	return (
		<section>
			<h2>Aderência às suas preferências</h2>
			<div className="card preference-panel">
				{job && (job.company || job.workModel || job.sourceUrl || job.interviewUrl) && (
					<dl className="job-meta">
						{job.company && (
							<div>
								<dt>Empresa</dt>
								<dd>{job.company}</dd>
							</div>
						)}
						{job.workModel && (
							<div>
								<dt>Modelo</dt>
								<dd>{workModelLabel(job.workModel)}</dd>
							</div>
						)}
						{job.sourceUrl && (
							<div>
								<dt>Link</dt>
								<dd>
									<a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="link">
										Abrir vaga
									</a>
								</dd>
							</div>
						)}
						{job.interviewUrl && (
							<div>
								<dt>Entrevista</dt>
								<dd>
									<a href={job.interviewUrl} target="_blank" rel="noopener noreferrer" className="link">
										Abrir link da entrevista
									</a>
								</dd>
							</div>
						)}
					</dl>
				)}

				{match ? (
					<div className="preference-match">
						{match.score != null ? (
							<ScoreRing value={match.score} label="aderência" size="sm" />
						) : (
							<p className="preference-empty">A vaga não informa nada do que você definiu nas preferências.</p>
						)}
						<ul className="criteria-list">
							{criteria.map((criterion) => (
								<li key={criterion.criterion} className="criteria-item">
									<div className="criteria-item-top">
										<span className="criteria-name">
											{criterion.criterion && criterionLabel(criterion.criterion)}
										</span>
										{criterion.status && (
											<Badge tone={matchStatusTone(criterion.status)}>{matchStatusLabel(criterion.status)}</Badge>
										)}
									</div>
									{criterion.detail && <p className="criteria-detail">{criterion.detail}</p>}
								</li>
							))}
						</ul>
					</div>
				) : (
					<p className="preference-empty">
						Cadastre o que você espera de uma vaga pra ver a nota de aderência.{" "}
						<Link to="/preferences" className="link">
							Definir preferências
						</Link>
					</p>
				)}
			</div>
			{match && (
				<p className="field-hint">Critério sem informação na vaga conta metade. Critério que você deixou em branco não entra na nota.</p>
			)}
		</section>
	);
}
