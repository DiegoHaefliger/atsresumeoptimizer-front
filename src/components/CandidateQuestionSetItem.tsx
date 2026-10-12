import type { CandidateQuestionSet } from "../api/types";
import { formatDateTime } from "../lib/processLabels";
import { Badge } from "./Badge";

type CandidateQuestionSetItemProps = {
	set: CandidateQuestionSet;
	open: boolean;
};

export function CandidateQuestionSetItem({ set, open }: CandidateQuestionSetItemProps) {
	return (
		<details className="assistant-history-item" open={open}>
			<summary>
				<strong>{formatDateTime(set.createdAt)}</strong>
				<span className="assistant-history-meta">{set.questions.length} perguntas</span>
			</summary>
			<ol className="interview-questions candidate-questions">
				{set.questions.map((item, index) => (
					<li key={index} className="interview-question">
						<p className="interview-question-text">
							{item.topic && <Badge tone="info">{item.topic}</Badge>}
							{item.question}
						</p>
						{item.reason && <p className="interview-question-reason">{item.reason}</p>}
					</li>
				))}
			</ol>
		</details>
	);
}
