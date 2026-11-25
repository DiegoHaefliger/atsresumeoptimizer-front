import type { BadgeTone } from "../components/Badge";
import type { ReleaseChange, ReleaseChangeKind } from "./releaseNotes";

export const RELEASE_CHANGE_LABELS: Record<ReleaseChangeKind, string> = {
	feat: "Novo",
	fix: "Correção",
	improvement: "Melhoria",
};

export const RELEASE_CHANGE_TONES: Record<ReleaseChangeKind, BadgeTone> = {
	feat: "success",
	fix: "warning",
	improvement: "info",
};

const RELEASE_CHANGE_ORDER: ReleaseChangeKind[] = ["feat", "improvement", "fix"];

export function sortByKind(changes: ReleaseChange[]): ReleaseChange[] {
	return [...changes].sort((a, b) => RELEASE_CHANGE_ORDER.indexOf(a.kind) - RELEASE_CHANGE_ORDER.indexOf(b.kind));
}
