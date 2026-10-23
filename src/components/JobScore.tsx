import { scoreTone } from "../lib/score";

export function JobScore({ label, score }: { label: string; score: number | null | undefined }) {
	return (
		<div className="job-card-score">
			<dt>{label}</dt>
			<dd>
				{score != null ? (
					<>
						<span className={`job-card-score-value job-card-score-${scoreTone(score)}`}>{score}</span>
						<span className="job-card-score-track" aria-hidden="true">
							<span className={`job-card-score-fill job-card-score-${scoreTone(score)}`} style={{ width: `${score}%` }} />
						</span>
					</>
				) : (
					<span className="job-card-score-empty">Sem nota</span>
				)}
			</dd>
		</div>
	);
}
