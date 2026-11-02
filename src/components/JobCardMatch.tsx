import { matchDescription, matchScore } from "../lib/matchScore";
import { scoreTone } from "../lib/score";
import type { Job } from "../lib/useJobs";
import { MatchGauge } from "./MatchGauge";

export function JobCardMatch({ job }: { job: Job }) {
	const match = matchScore(job);
	const description = matchDescription(match);
	return (
		<div className="job-card-match" title={description} role="img" aria-label={description}>
			<MatchGauge score={match.score} />
			{match.score != null ? (
				<span className={`job-card-match-value job-card-score-${scoreTone(match.score)}`}>{match.score}%</span>
			) : (
				<span className="job-card-score-empty">Sem nota</span>
			)}
			<span className="job-card-match-label">Compatibilidade</span>
		</div>
	);
}
