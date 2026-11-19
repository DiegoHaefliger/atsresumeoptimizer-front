import { useEffect, useState } from "react";
import { apiGet } from "../../api/client";
import type { LinkedInSnapshotResponse, SnapshotSource } from "../../api/linkedinTypes";
import { formatCapturedAt, SECTION_LABELS } from "../../lib/linkedinLabels";
import { StateMessage } from "../StateMessage";

const SOURCE_NAMES: Record<SnapshotSource, string> = {
	EXTENSION: "pela extensão",
	PDF: "pelo PDF do perfil",
	TEXT: "por texto colado",
};

const SOURCE_LIMITS: Partial<Record<SnapshotSource, string>> = {
	PDF: "O PDF do LinkedIn não traz foto, banner, recomendações, destaques nem atividade recente, e limita as competências. Para uma análise completa, leia o perfil pela extensão.",
};

export function AnalysisBasis({ snapshotId }: { snapshotId: string }) {
	const [snapshot, setSnapshot] = useState<LinkedInSnapshotResponse | null>(null);

	useEffect(() => {
		let active = true;
		setSnapshot(null);
		apiGet<LinkedInSnapshotResponse>(`/api/v1/linkedin/snapshots/${snapshotId}`)
			.then((loaded) => active && setSnapshot(loaded))
			.catch(() => undefined);
		return () => {
			active = false;
		};
	}, [snapshotId]);

	if (!snapshot || !snapshot.source) {
		return null;
	}
	const missing = snapshot.missingSections.map((section) => SECTION_LABELS[section]);
	return (
		<StateMessage
			variant="empty"
			message={
				<>
					Esta análise usa a leitura de {formatCapturedAt(snapshot.capturedAt)}, feita {SOURCE_NAMES[snapshot.source]}.
					{missing.length > 0 && <> Sem leitura, e por isso fora da análise: {missing.join(", ")}.</>}
					{SOURCE_LIMITS[snapshot.source] && <> {SOURCE_LIMITS[snapshot.source]}</>}
				</>
			}
		/>
	);
}
