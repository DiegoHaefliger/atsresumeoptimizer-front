import type { InterviewQuestionSet } from "../api/types";
import { formatDateTime } from "../lib/processLabels";
import { Badge } from "./Badge";

type InterviewQuestionSetItemProps = {
	set: InterviewQuestionSet;
	resumeLabel: string | null;
	open: boolean;
};

export function InterviewQuestionSetItem({ set, resumeLabel, open }: InterviewQuestionSetItemProps) {
	return (
		<details className="assistant-history-item" open={open}>
			<summary>
				<strong>{formatDateTime(set.createdAt)}</strong>
				<span className="assistant-history-meta">{set.questions.length} perguntas</span>
				{resumeLabel && <span className="assistant-history-meta">{resumeLabel}</span>}
			</summary>
			<ol className="interview-questions">
				{set.questions.map((item, index) => (
					<li key={index} className="interview-question">
						<p className="interview-question-text">
							{item.question}
							{item.requirement && <Badge tone="info">{item.requirement}</Badge>}
						</p>
						{item.reason && <p className="interview-question-reason">{item.reason}</p>}
						{item.answerTip && (
							<p className="interview-question-tip">
								<strong>Como responder:</strong> {item.answerTip}
							</p>
						)}
					</li>
				))}
			</ol>
		</details>
	);
}
