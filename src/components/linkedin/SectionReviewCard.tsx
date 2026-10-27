import type { LinkedInSectionReviewResponse } from "../../api/linkedinTypes";
import { PRIORITY_LABELS, PRIORITY_TONES, SECTION_LABELS } from "../../lib/linkedinLabels";
import { sortedByPriority } from "../../lib/linkedinSections";
import { scoreTone } from "../../lib/score";
import { Badge } from "../Badge";
import { CopyButton } from "./CopyButton";

const TONE_BADGE = { high: "success", mid: "warning", low: "error" } as const;

export function SectionReviewCard({ review }: { review: LinkedInSectionReviewResponse }) {
	const suggestions = sortedByPriority(review);
	return (
		<article className="panel linkedin-section">
			<div className="panel-header">
				<h3>{SECTION_LABELS[review.section]}</h3>
				<Badge tone={TONE_BADGE[scoreTone(review.score)]}>{review.score}/100</Badge>
			</div>
			<div className="panel-body">
				<p>{review.diagnosis}</p>
				{suggestions.length > 0 && (
					<ul className="linkedin-suggestions">
						{suggestions.map((suggestion) => (
							<li key={suggestion.text}>
								<Badge tone={PRIORITY_TONES[suggestion.priority]}>{PRIORITY_LABELS[suggestion.priority]}</Badge>
								<span>{suggestion.text}</span>
							</li>
						))}
					</ul>
				)}
				{review.rewrite && (
					<div className="linkedin-rewrite">
						<div className="linkedin-rewrite-head">
							<span className="form-field-label">Sugestão de texto</span>
							<CopyButton text={review.rewrite} />
						</div>
						<p className="linkedin-rewrite-text">{review.rewrite}</p>
					</div>
				)}
			</div>
		</article>
	);
}
