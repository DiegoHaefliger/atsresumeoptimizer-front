export type MatchPart = { key: "preference" | "ats"; label: string; score: number | null };

export type Match = { score: number | null; parts: MatchPart[] };

type Scored = { preferenceScore?: number | null; atsScore?: number | null };

export function matchScore(job: Scored): Match {
	const parts: MatchPart[] = [
		{ key: "preference", label: "Aderência", score: job.preferenceScore ?? null },
		{ key: "ats", label: "Nota ATS", score: job.atsScore ?? null },
	];
	const scores = parts.flatMap((part) => (part.score == null ? [] : [part.score]));
	const score = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;
	return { score, parts };
}

export function matchDescription({ score, parts }: Match): string {
	const detail = parts.map((part) => `${part.label} ${part.score ?? "sem nota"}`).join(" · ");
	return score == null ? `Compatibilidade sem nota · ${detail}` : `Compatibilidade ${score}% · ${detail}`;
}
