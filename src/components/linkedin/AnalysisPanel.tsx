import { useCallback, useEffect, useState } from "react";
import { apiGet, ApiError, errorMessage } from "../../api/client";
import type { LinkedInAnalysisResponse, LinkedInAnalysisSummaryResponse } from "../../api/linkedinTypes";
import { formatCapturedAt } from "../../lib/linkedinLabels";
import { BusyLabel } from "../BusyLabel";
import { SparklesIcon } from "../icons";
import { StateMessage } from "../StateMessage";
import { AnalysisBasis } from "./AnalysisBasis";
import { AnalysisResult } from "./AnalysisResult";
import { busyText, WaitingForCapture } from "./WaitingForCapture";
import { recordValueEvent } from "../../lib/feedbackPrompt";
import { ExtensionUpdateNotice } from "./ExtensionUpdateNotice";
import { ReadingSelector } from "./ReadingSelector";
import { OUTDATED_EXTENSION_CODE, useAnalysisRun } from "./useAnalysisRun";
import { useExtensionStatus } from "./useExtensionStatus";
import { useReadings } from "./useReadings";

const ANALYSES_PATH = "/api/v1/linkedin/analyses";

type AnalysisPanelProps = {
	hasProfile: boolean;
	hasSnapshot: boolean;
	onGoTo: (tab: "career" | "data") => void;
};

function optionalOnNotFound<T>(request: Promise<T>): Promise<T | null> {
	return request.catch((err) => {
		if (err instanceof ApiError && err.status === 404) {
			return null;
		}
		throw err;
	});
}

export function AnalysisPanel({ hasProfile, hasSnapshot, onGoTo }: AnalysisPanelProps) {
	const [analysis, setAnalysis] = useState<LinkedInAnalysisResponse | null>(null);
	const [history, setHistory] = useState<LinkedInAnalysisSummaryResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadHistory = useCallback(async () => {
		const [latest, list] = await Promise.all([
			optionalOnNotFound(apiGet<LinkedInAnalysisResponse>(`${ANALYSES_PATH}/latest`)),
			apiGet<LinkedInAnalysisSummaryResponse[]>(ANALYSES_PATH),
		]);
		setAnalysis((current) => current ?? latest);
		setHistory(list);
	}, []);

	const extensionProbe = useExtensionStatus();
	const extensionStatus = extensionProbe?.status;
	const { readings, selected, failed: readingsFailed, select, reload: reloadReadings } = useReadings();

	const handleAnalysis = useCallback(
		(created: LinkedInAnalysisResponse) => {
			setAnalysis(created);
			if (!created.unchanged) {
				recordValueEvent();
			}
			void reloadReadings();
			loadHistory().catch((err) => setError(errorMessage(err, "Não deu pra carregar as análises.")));
		},
		[loadHistory, reloadReadings],
	);
	const { phase, notice, error: runError, run, importPdf, cancel } = useAnalysisRun(handleAnalysis);

	useEffect(() => {
		loadHistory()
			.catch((err) => setError(errorMessage(err, "Não deu pra carregar as análises.")))
			.finally(() => setLoading(false));
	}, [loadHistory]);

	async function open(id: string) {
		try {
			setAnalysis(await apiGet<LinkedInAnalysisResponse>(`${ANALYSES_PATH}/${id}`));
		} catch (err) {
			setError(errorMessage(err, "Não deu pra abrir essa análise."));
		}
	}

	const busy = phase.kind === "capturing" || phase.kind === "importing" || phase.kind === "analyzing";
	const waiting = phase.kind === "waiting";
	const blockedByOutdatedExtension = extensionStatus === "outdated" && selected?.source !== "PDF";
	const previous = analysis ? history.find((item) => new Date(item.createdAt) < new Date(analysis.createdAt)) : undefined;

	return (
		<div className="settings-main">
			{!hasProfile && (
				<StateMessage
					variant="empty"
					message={
						<>
							Configure sua área de atuação e o cargo que quer alcançar.{" "}
							<button type="button" className="link" onClick={() => onGoTo("career")}>
								Abrir perfil de carreira
							</button>
						</>
					}
				/>
			)}
			{!hasSnapshot && phase.kind === "idle" && (
				<StateMessage variant="empty" message="O app lê o seu perfil no LinkedIn sozinho, pela extensão, quando você pede a análise." />
			)}
			{extensionStatus === "outdated" && !(waiting && phase.code === OUTDATED_EXTENSION_CODE) && <ExtensionUpdateNotice requiredVersion={extensionProbe?.requiredVersion ?? ""} />}
			{readingsFailed && <StateMessage variant="error" message="Não consegui carregar as leituras do LinkedIn para você escolher qual usar." />}
			<ReadingSelector
				readings={readings}
				selectedId={selected?.id ?? null}
				onSelect={select}
				onImportPdf={() => onGoTo("data")}
				disabled={busy || waiting}
			/>
			<div className="linkedin-actions">
				<button type="button" onClick={() => void run(selected)} disabled={busy || waiting || !hasProfile || blockedByOutdatedExtension} aria-busy={busy}>
					<BusyLabel busy={busy} busyText={busyText(phase)}>
						<SparklesIcon /> {analysis ? "Analisar de novo" : "Analisar meu LinkedIn"}
					</BusyLabel>
				</button>
				{history.length > 1 && (
					<label className="linkedin-history">
						Análises anteriores
						<select value={analysis?.id ?? ""} onChange={(event) => void open(event.target.value)}>
							{history.map((item) => (
								<option key={item.id} value={item.id}>
									{formatCapturedAt(item.createdAt)} · nota {item.overallScore}
								</option>
							))}
						</select>
					</label>
				)}
			</div>
			{blockedByOutdatedExtension && <p className="field-hint">Atualize a extensão para analisar pela leitura do LinkedIn, ou escolha a leitura do PDF.</p>}
			{waiting && <WaitingForCapture reason={phase.reason} code={phase.code} onRetry={() => void run(selected)} onImportPdf={importPdf} onPaste={() => onGoTo("data")} onCancel={cancel} />}
			{notice && <StateMessage variant="empty" message={notice} />}
			{(error || runError) && <StateMessage variant="error" message={error ?? runError ?? ""} />}
			{loading && <p className="field-hint">Carregando...</p>}
			{analysis && <AnalysisBasis snapshotId={analysis.snapshotId} />}
			{analysis && <AnalysisResult analysis={analysis} previousScore={previous?.overallScore} />}
		</div>
	);
}
