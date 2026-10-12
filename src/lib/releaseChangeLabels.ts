import type { BadgeTone } from "../components/Badge";
import type { ReleaseChangeKind } from "./releaseNotes";

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
