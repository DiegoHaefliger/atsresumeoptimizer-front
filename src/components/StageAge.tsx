import { useState } from "react";
import type { SelectionProcess } from "../api/types";
import { daysInStage, isActive, isStale } from "../lib/processAttention";

export function StageAge({ process }: { process: SelectionProcess }) {
	const [now] = useState(() => new Date());
	if (!isActive(process)) {
		return null;
	}
	const days = daysInStage(process, now);
	return (
		<span className={`stage-age${isStale(process, now) ? " stage-age-stale" : ""}`} title="Tempo na etapa atual">
			{days === 0 ? "desde hoje" : `há ${days} ${days === 1 ? "dia" : "dias"}`}
		</span>
	);
}
