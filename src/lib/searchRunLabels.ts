import type { SearchRun } from "../api/types";
import { formatDateTime } from "./processLabels";

export function describeLastRun(run: SearchRun | undefined): string {
	if (!run?.finishedAt) {
		return "Nenhuma busca feita ainda.";
	}
	const origin = run.trigger === "MANUAL" ? "manual" : "agendada";
	const result = `${run.read ?? 0} lidas · ${run.added ?? 0} novas · ${run.duplicates ?? 0} repetidas · ${run.belowAdherence ?? 0} abaixo da aderência`;
	return `Última busca ${origin} em ${formatDateTime(run.finishedAt)}: ${result}.`;
}
