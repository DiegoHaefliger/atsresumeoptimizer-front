import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPostJson, ApiError, errorMessage } from "../../api/client";
import type { LinkedInAnalysisResponse, LinkedInAnalysisSummaryResponse } from "../../api/linkedinTypes";
import { formatCapturedAt } from "../../lib/linkedinLabels";
import { BusyLabel } from "../BusyLabel";
import { SparklesIcon } from "../icons";
import { StateMessage } from "../StateMessage";
import { AnalysisResult } from "./AnalysisResult";

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
	const [running, setRunning] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadHistory = useCallback(async () => {
		const [latest, list] = await Promise.all([
			optionalOnNotFound(apiGet<LinkedInAnalysisResponse>(`${ANALYSES_PATH}/latest`)),
			apiGet<LinkedInAnalysisSummaryResponse[]>(ANALYSES_PATH),
		]);
		setAnalysis((current) => current ?? latest);
		setHistory(list);
	}, []);

	useEffect(() => {
		loadHistory()
			.catch((err) => setError(errorMessage(err, "Não deu pra carregar as análises.")))
			.finally(() => setLoading(false));
	}, [loadHistory]);

	async function run() {
		setRunning(true);
		setError(null);
		try {
			setAnalysis(await apiPostJson<LinkedInAnalysisResponse>(ANALYSES_PATH, {}));
			await loadHistory();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra analisar o perfil. Tenta de novo."));
		} finally {
			setRunning(false);
		}
	}

	async function open(id: string) {
		try {
			setAnalysis(await apiGet<LinkedInAnalysisResponse>(`${ANALYSES_PATH}/${id}`));
		} catch (err) {
			setError(errorMessage(err, "Não deu pra abrir essa análise."));
		}
	}

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
			{!hasSnapshot && (
				<StateMessage
					variant="empty"
					message={
						<>
							Falta trazer o seu perfil do LinkedIn.{" "}
							<button type="button" className="link" onClick={() => onGoTo("data")}>
								Ver como
							</button>
						</>
					}
				/>
			)}
			<div className="linkedin-actions">
				<button type="button" onClick={run} disabled={running || !hasProfile || !hasSnapshot} aria-busy={running}>
					<BusyLabel busy={running} busyText="Analisando... pode levar um minuto">
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
			{error && <StateMessage variant="error" message={error} />}
			{loading && <p className="field-hint">Carregando...</p>}
			{analysis && <AnalysisResult analysis={analysis} previousScore={previous?.overallScore} />}
		</div>
	);
}
