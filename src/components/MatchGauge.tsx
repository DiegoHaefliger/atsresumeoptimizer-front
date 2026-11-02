import { scoreTone } from "../lib/score";

const ARC = "M 8 50 A 42 42 0 0 1 92 50";

export function MatchGauge({ score, className = "" }: { score: number | null; className?: string }) {
	const tone = score == null ? "empty" : scoreTone(score);
	return (
		<svg className={`match-gauge match-gauge-${tone} ${className}`} viewBox="0 0 100 56" aria-hidden="true">
			<path className="match-gauge-track" d={ARC} pathLength={100} />
			{score != null && (
				<>
					<path className="match-gauge-fill" d={ARC} pathLength={100} strokeDasharray={`${score} 100`} />
					<line
						className="match-gauge-needle"
						x1="50"
						y1="50"
						x2="50"
						y2="18"
						transform={`rotate(${score * 1.8 - 90} 50 50)`}
					/>
					<circle className="match-gauge-hub" cx="50" cy="50" r="4" />
				</>
			)}
		</svg>
	);
}
