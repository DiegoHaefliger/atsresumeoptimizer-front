import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPostJson, ApiError, errorMessage } from "../../api/client";
import type { LinkedInAnalysisResponse, LinkedInSnapshotResponse, ProfileSection } from "../../api/linkedinTypes";
import { formatCapturedAt, SECTION_LABELS } from "../../lib/linkedinLabels";
import { captureWithExtension, CaptureFailedError, pingExtension, type CaptureProgress } from "../../lib/linkedinExtension";

const SNAPSHOT_LATEST_PATH = "/api/v1/linkedin/snapshots/latest";
const ANALYSES_PATH = "/api/v1/linkedin/analyses";
const ARMED_KEY = "linkedin-analysis-armed-at";
const ARMED_MAX_AGE_MS = 30 * 60 * 1000;
const POLL_MS = 3000;
const CLOCK_TOLERANCE_MS = 2000;
const NO_EXTENSION = "A extensão do Chrome não respondeu.";

export type RunPhase =
	| { kind: "idle" }
	| { kind: "capturing"; progress: CaptureProgress | null }
	| { kind: "analyzing" }
	| { kind: "waiting"; reason: string };

async function latestSnapshot(): Promise<LinkedInSnapshotResponse | null> {
	try {
		return await apiGet<LinkedInSnapshotResponse>(SNAPSHOT_LATEST_PATH);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			return null;
		}
		throw err;
	}
}

function readArmedAt(): number | null {
	try {
		const stored = Number(window.sessionStorage.getItem(ARMED_KEY));
		return stored && Date.now() - stored < ARMED_MAX_AGE_MS ? stored : null;
	} catch {
		return null;
	}
}

function writeArmedAt(value: number | null) {
	try {
		if (value === null) {
			window.sessionStorage.removeItem(ARMED_KEY);
		} else {
			window.sessionStorage.setItem(ARMED_KEY, String(value));
		}
	} catch {
		return;
	}
}

function noticeFor(analysis: LinkedInAnalysisResponse, changed: ProfileSection[]): string | null {
	if (analysis.unchanged) {
		return `Seu perfil não mudou desde a última leitura. Esta é a análise de ${formatCapturedAt(analysis.createdAt)}.`;
	}
	if (changed.length > 0) {
		return `Mudou desde a última leitura: ${changed.map((section) => SECTION_LABELS[section]).join(", ")}.`;
	}
	return null;
}

export function useAnalysisRun(onAnalysis: (analysis: LinkedInAnalysisResponse) => void) {
	const [phase, setPhase] = useState<RunPhase>(() => (readArmedAt() ? { kind: "waiting", reason: NO_EXTENSION } : { kind: "idle" }));
	const [notice, setNotice] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const armedAt = useRef<number>(readArmedAt() ?? 0);
	const pollBusy = useRef(false);

	const analyze = useCallback(
		async (snapshotId: string, changed: ProfileSection[]) => {
			setPhase({ kind: "analyzing" });
			const analysis = await apiPostJson<LinkedInAnalysisResponse>(ANALYSES_PATH, { snapshotId });
			writeArmedAt(null);
			setNotice(noticeFor(analysis, changed));
			onAnalysis(analysis);
			setPhase({ kind: "idle" });
		},
		[onAnalysis],
	);

	const run = useCallback(async () => {
		armedAt.current = Date.now();
		writeArmedAt(armedAt.current);
		setError(null);
		setNotice(null);
		setPhase({ kind: "capturing", progress: null });
		try {
			const latest = await latestSnapshot();
			if (!(await pingExtension())) {
				setPhase({ kind: "waiting", reason: NO_EXTENSION });
				return;
			}
			const capture = await captureWithExtension({
				profileUrl: latest?.profile.profileUrl,
				onProgress: (progress) => setPhase({ kind: "capturing", progress }),
			});
			await analyze(capture.id, capture.changedSections);
		} catch (err) {
			if (err instanceof CaptureFailedError) {
				setPhase({ kind: "waiting", reason: err.message });
				return;
			}
			writeArmedAt(null);
			setError(errorMessage(err, "Não deu pra analisar o perfil. Tenta de novo."));
			setPhase({ kind: "idle" });
		}
	}, [analyze]);

	const cancel = useCallback(() => {
		writeArmedAt(null);
		setPhase({ kind: "idle" });
	}, []);

	useEffect(() => {
		if (phase.kind !== "waiting") {
			return;
		}
		const timer = window.setInterval(async () => {
			if (pollBusy.current) {
				return;
			}
			pollBusy.current = true;
			try {
				const latest = await latestSnapshot();
				if (latest && new Date(latest.capturedAt).getTime() >= armedAt.current - CLOCK_TOLERANCE_MS) {
					await analyze(latest.id, []);
				}
			} catch (err) {
				writeArmedAt(null);
				setError(errorMessage(err, "Não deu pra analisar o perfil. Tenta de novo."));
				setPhase({ kind: "idle" });
			} finally {
				pollBusy.current = false;
			}
		}, POLL_MS);
		return () => window.clearInterval(timer);
	}, [phase.kind, analyze]);

	return { phase, notice, error, run, cancel };
}
