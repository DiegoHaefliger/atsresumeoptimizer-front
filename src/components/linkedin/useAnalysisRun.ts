import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPostJson, ApiError, errorMessage } from "../../api/client";
import type { LinkedInAnalysisResponse, LinkedInSnapshotResponse, ProfileSection } from "../../api/linkedinTypes";
import { formatCapturedAt, SECTION_LABELS } from "../../lib/linkedinLabels";
import { uploadLinkedInPdf } from "../../lib/linkedinPdf";
import { captureWithExtension, CaptureFailedError, checkExtension, type CaptureProgress } from "../../lib/linkedinExtension";

const SNAPSHOT_LATEST_PATH = "/api/v1/linkedin/snapshots/latest";
const ANALYSES_PATH = "/api/v1/linkedin/analyses";
const ARMED_KEY = "linkedin-analysis-armed-at";
const ARMED_MAX_AGE_MS = 30 * 60 * 1000;
const POLL_MS = 3000;
const CLOCK_TOLERANCE_MS = 2000;
export const NO_EXTENSION_CODE = "no-extension";
export const OUTDATED_EXTENSION_CODE = "extension-outdated";
const EXTENSION_PROBE_MS = 2500;

export type ChosenReading = { id: string; source: string; capturedAt: string };

export type RunPhase =
	| { kind: "idle" }
	| { kind: "capturing"; progress: CaptureProgress | null }
	| { kind: "importing" }
	| { kind: "analyzing" }
	| { kind: "waiting"; reason: string; code: string };

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

export function isMissingExtension(code: string | null): boolean {
	return code === NO_EXTENSION_CODE || code === OUTDATED_EXTENSION_CODE;
}

const EXTENSION_REASONS = {
	missing: { code: NO_EXTENSION_CODE, reason: "a extensão não respondeu; se for a versão antiga, atualize-a na aba Dados do LinkedIn" },
} as const;

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

const SOURCE_NAMES: Record<string, string> = { EXTENSION: "da extensão", PDF: "do PDF", TEXT: "do texto colado" };

function fallbackNote(reading: ChosenReading, reason: string): string {
	return `Não consegui ler o seu perfil agora (${reason}), então usei a leitura ${SOURCE_NAMES[reading.source] ?? ""} de ${formatCapturedAt(reading.capturedAt)}.`;
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
	const [phase, setPhase] = useState<RunPhase>(() => (readArmedAt() ? { kind: "waiting", reason: "", code: NO_EXTENSION_CODE } : { kind: "idle" }));
	const [notice, setNotice] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const armedAt = useRef<number>(readArmedAt() ?? 0);
	const pollBusy = useRef(false);

	const analyze = useCallback(
		async (snapshotId: string, changed: ProfileSection[], note?: string) => {
			setPhase({ kind: "analyzing" });
			const analysis = await apiPostJson<LinkedInAnalysisResponse>(ANALYSES_PATH, { snapshotId });
			writeArmedAt(null);
			setNotice([note, noticeFor(analysis, changed)].filter(Boolean).join(" ") || null);
			onAnalysis(analysis);
			setPhase({ kind: "idle" });
		},
		[onAnalysis],
	);

	const analyzeFallback = useCallback(
		async (reading: ChosenReading, reason: string) => {
			try {
				await analyze(reading.id, [], fallbackNote(reading, reason));
			} catch (err) {
				writeArmedAt(null);
				setError(errorMessage(err, "Não deu pra analisar o perfil. Tenta de novo."));
				setPhase({ kind: "idle" });
			}
		},
		[analyze],
	);

	const run = useCallback(async (reading?: ChosenReading | null) => {
		if (reading?.source === "PDF") {
			setError(null);
			setNotice(null);
			try {
				await analyze(reading.id, []);
			} catch (err) {
				setError(errorMessage(err, "Não deu pra analisar o perfil. Tenta de novo."));
				setPhase({ kind: "idle" });
			}
			return;
		}
		armedAt.current = Date.now();
		writeArmedAt(armedAt.current);
		setError(null);
		setNotice(null);
		setPhase({ kind: "capturing", progress: null });
		let fallback: ChosenReading | null = reading ?? null;
		try {
			const latest = await latestSnapshot();
			fallback = fallback ?? (latest ? { id: latest.id, source: latest.source, capturedAt: latest.capturedAt } : null);
			const status = await checkExtension();
			if (status === "outdated") {
				writeArmedAt(null);
				setPhase({ kind: "waiting", reason: "", code: OUTDATED_EXTENSION_CODE });
				return;
			}
			if (status !== "current") {
				const problem = EXTENSION_REASONS[status];
				if (fallback) {
					await analyze(fallback.id, [], fallbackNote(fallback, problem.reason));
					return;
				}
				setPhase({ kind: "waiting", reason: "", code: problem.code });
				return;
			}
			const capture = await captureWithExtension({
				profileUrl: latest?.profile.profileUrl,
				onProgress: (progress) => setPhase({ kind: "capturing", progress }),
			});
			await analyze(capture.id, capture.changedSections);
		} catch (err) {
			if (err instanceof CaptureFailedError) {
				if (fallback) {
					await analyzeFallback(fallback, err.message);
					return;
				}
				setPhase({ kind: "waiting", reason: err.message, code: err.code });
				return;
			}
			writeArmedAt(null);
			setError(errorMessage(err, "Não deu pra analisar o perfil. Tenta de novo."));
			setPhase({ kind: "idle" });
		}
	}, [analyze, analyzeFallback]);

	const importPdf = useCallback(
		async (file: File) => {
			setError(null);
			setNotice(null);
			setPhase({ kind: "importing" });
			try {
				const capture = await uploadLinkedInPdf(file);
				await analyze(capture.id, capture.changedSections);
			} catch (err) {
				setError(errorMessage(err, "Não deu pra ler o PDF. Tenta de novo."));
				setPhase({ kind: "waiting", reason: "", code: NO_EXTENSION_CODE });
			}
		},
		[analyze],
	);

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

	const waitingCode = phase.kind === "waiting" ? phase.code : null;

	useEffect(() => {
		if (!isMissingExtension(waitingCode)) {
			return;
		}
		const timer = window.setInterval(async () => {
			if ((await checkExtension(EXTENSION_PROBE_MS / 2)) === "current") {
				void run();
			}
		}, EXTENSION_PROBE_MS);
		return () => window.clearInterval(timer);
	}, [waitingCode, run]);

	useEffect(() => {
		if (waitingCode === null || isMissingExtension(waitingCode)) {
			return;
		}
		function retryWhenBack() {
			if (document.visibilityState === "visible") {
				void run();
			}
		}
		document.addEventListener("visibilitychange", retryWhenBack);
		return () => document.removeEventListener("visibilitychange", retryWhenBack);
	}, [waitingCode, run]);

	return { phase, notice, error, run, importPdf, cancel };
}
