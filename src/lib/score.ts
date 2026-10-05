export type ScoreTone = "low" | "mid" | "high";

export function scoreTone(score: number): ScoreTone {
	if (score >= 80) {
		return "high";
	}
	if (score >= 50) {
		return "mid";
	}
	return "low";
}
