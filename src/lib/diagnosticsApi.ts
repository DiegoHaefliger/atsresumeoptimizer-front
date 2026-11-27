import { apiDownload, apiPostJson } from "../api/client";

export const DIAGNOSTICS_PATH = "/api/v1/diagnostics";

export type DiagnosticEntry = { label: string; value: string; personal: boolean };

export type DiagnosticSection = { title: string; entries: DiagnosticEntry[] };

export type ReadinessStatus = "OK" | "WARNING" | "FAILURE";

export type ReadinessCheck = { name: string; status: ReadinessStatus; detail: string; hint: string | null };

export type DiagnosticReport = {
	generatedAt: string;
	checks: ReadinessCheck[];
	verdict: string;
	sections: DiagnosticSection[];
	text: string;
	logFileAvailable: boolean;
	logsFolderOpenable: boolean;
};

export type ClientErrorReport = {
	message: string;
	stack: string | null;
	componentStack: string | null;
	page: string;
};

export function sendClientError(report: ClientErrorReport): Promise<{ errorId: string }> {
	return apiPostJson(`${DIAGNOSTICS_PATH}/client-errors`, report);
}

export async function openLogsFolder(): Promise<void> {
	await apiPostJson<void>(`${DIAGNOSTICS_PATH}/logs-folder`, {});
}

export async function downloadDiagnosticBundle(): Promise<void> {
	const { blob, fileName } = await apiDownload(`${DIAGNOSTICS_PATH}/bundle`);
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(url);
}
