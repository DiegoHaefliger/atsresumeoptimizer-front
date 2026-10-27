import type { LinkedInItemReviewResponse, LinkedInSectionReviewResponse } from "../../api/linkedinTypes";
import { PRIORITY_LABELS, PRIORITY_TONES, SECTION_LABELS } from "../../lib/linkedinLabels";
import { sortedByPriority } from "../../lib/linkedinSections";
import { scoreTone } from "../../lib/score";
import { Badge } from "../Badge";
import { CopyButton } from "./CopyButton";

const TONE_BADGE = { high: "success", mid: "warning", low: "error" } as const;

type ReviewBody = Pick<LinkedInItemReviewResponse, "diagnosis" | "suggestions" | "rewrite">;

function ReviewContent({ review }: { review: ReviewBody }) {
	const suggestions = sortedByPriority(review);
	return (
		<>
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
		</>
	);
}

function ItemReview({ item }: { item: LinkedInItemReviewResponse }) {
	return (
		<section className="linkedin-item">
			<div className="linkedin-item-head">
				<h4>{item.title}</h4>
				<Badge tone={TONE_BADGE[scoreTone(item.score)]}>{item.score}/100</Badge>
			</div>
			<ReviewContent review={item} />
		</section>
	);
}

export function SectionReviewCard({ review }: { review: LinkedInSectionReviewResponse }) {
	const items = review.items ?? [];
	return (
		<article className="panel linkedin-section">
			<div className="panel-header">
				<h3>{SECTION_LABELS[review.section]}</h3>
				<Badge tone={TONE_BADGE[scoreTone(review.score)]}>{review.score}/100</Badge>
			</div>
			<div className="panel-body">
				<ReviewContent review={review} />
				{items.map((item) => (
					<ItemReview key={item.title} item={item} />
				))}
			</div>
		</article>
	);
}
