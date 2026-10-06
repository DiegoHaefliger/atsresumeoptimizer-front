import type { SelectionStage } from "../api/types";
import { STAGE_LABELS } from "../lib/processLabels";

export function StageBadge({ stage }: { stage: SelectionStage }) {
	return <span className={`badge stage-badge stage-${stage}`}>{STAGE_LABELS[stage]}</span>;
}
