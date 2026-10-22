import { mentionOptionId } from "../../lib/chatMention";
import { jobLabel } from "../../lib/jobCode";
import type { Job } from "../../lib/useJobs";

type JobMentionMenuProps = {
	id: string;
	jobs: Job[] | null;
	matches: Job[];
	activeIndex: number;
	query: string;
	onPick: (job: Job) => void;
	onHover: (index: number) => void;
};

export function JobMentionMenu({ id, jobs, matches, activeIndex, query, onPick, onHover }: JobMentionMenuProps) {
	if (jobs === null) {
		return (
			<div className="mention-menu" role="status">
				<p className="mention-empty">Carregando vagas...</p>
			</div>
		);
	}
	if (matches.length === 0) {
		return (
			<div className="mention-menu" role="status">
				<p className="mention-empty">
					{jobs.length === 0 ? "Você ainda não cadastrou vagas." : `Nenhuma vaga encontrada para "${query}".`}
				</p>
			</div>
		);
	}
	return (
		<ul className="mention-menu" id={id} role="listbox" aria-label="Vagas encontradas">
			{matches.map((job, index) => (
				<li
					key={job.id}
					id={mentionOptionId(id, index)}
					role="option"
					aria-selected={index === activeIndex}
					className="mention-option"
					onMouseDown={(event) => {
						event.preventDefault();
						onPick(job);
					}}
					onMouseEnter={() => onHover(index)}
				>
					{jobLabel(job.code, job.title, job.company)}
				</li>
			))}
		</ul>
	);
}
