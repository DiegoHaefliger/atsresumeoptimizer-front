import { matchScore, type MatchPart } from "../lib/matchScore";
import { scoreTone } from "../lib/score";
import type { Job } from "../lib/useJobs";
import { ClipboardCheckIcon } from "./icons";
import { JobScore } from "./JobScore";
import { MatchGauge } from "./MatchGauge";

const PART_HINTS: Record<MatchPart["key"], string> = {
	preference: "Quanto a vaga bate com suas Preferências: modelo de trabalho, salário, local, cargos e palavras-chave.",
	ats: "Quanto seu currículo bate com os requisitos da vaga, na leitura de um sistema ATS.",
};

export function JobSummaryMatch({ job, onAnalyze }: { job: Job; onAnalyze: () => void }) {
	const { score, parts } = matchScore(job);
	return (
		<section className="panel panel-body job-summary-match" aria-labelledby="job-summary-match-heading">
			<div className="job-summary-match-gauge">
				<MatchGauge score={score} />
				<strong className={score != null ? `job-card-score-${scoreTone(score)}` : "job-card-score-empty"}>
					{score != null ? `${score}%` : "—"}
				</strong>
				<h2 id="job-summary-match-heading">Compatibilidade</h2>
				<small>Média da aderência e da nota ATS</small>
			</div>
			<div className="job-summary-match-parts">
				{parts.map((part) => (
					<div key={part.key} className="job-summary-match-part">
						<dl>
							<JobScore label={part.label} score={part.score} />
						</dl>
						<p>{PART_HINTS[part.key]}</p>
						{part.key === "ats" && part.score == null && (
							<button type="button" className="job-summary-chip job-summary-chip-primary" onClick={onAnalyze}>
								<ClipboardCheckIcon /> Analisar esta vaga
							</button>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
