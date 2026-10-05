import type { CSSProperties } from "react";
import { scoreTone } from "../lib/score";

interface ScoreRingProps {
	value: number;
	label?: string;
	size?: "md" | "sm";
}

export function ScoreRing({ value, label, size = "md" }: ScoreRingProps) {
	const tone = scoreTone(value);
	return (
		<div
			className={`score-ring score-ring-${tone}${size === "sm" ? " score-ring-sm" : ""}`}
			style={{ "--score-pct": value } as CSSProperties}
			role="img"
			aria-label={`${label ?? "Score"}: ${value} de 100`}
		>
			<div className="score-ring-inner">
				<span className="score-ring-value">{value}</span>
				{label && <span className="score-ring-label">{label}</span>}
			</div>
		</div>
	);
}
