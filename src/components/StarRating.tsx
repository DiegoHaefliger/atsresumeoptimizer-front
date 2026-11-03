import { useState } from "react";
import { RATING_LABELS } from "../lib/feedbackForm";
import { StarIcon } from "./icons";

type StarRatingProps = {
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
};

const STARS = [1, 2, 3, 4, 5];

export function StarRating({ value, onChange, disabled = false }: StarRatingProps) {
	const [hover, setHover] = useState(0);
	const shown = hover || value;

	return (
		<div className="star-rating">
			<div className="star-rating-stars" role="radiogroup" aria-label="Nota de 1 a 5 estrelas" onMouseLeave={() => setHover(0)}>
				{STARS.map((star) => (
					<button
						key={star}
						type="button"
						role="radio"
						aria-checked={value === star}
						aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}: ${RATING_LABELS[star - 1]}`}
						className={`star-button${star <= shown ? " star-button-on" : ""}`}
						disabled={disabled}
						onMouseEnter={() => setHover(star)}
						onClick={() => onChange(star)}
					>
						<StarIcon filled={star <= shown} className="star-button-icon" />
					</button>
				))}
			</div>
			<span className="star-rating-label" aria-live="polite">
				{shown > 0 ? RATING_LABELS[shown - 1] : "Toque numa estrela para avaliar"}
			</span>
		</div>
	);
}
