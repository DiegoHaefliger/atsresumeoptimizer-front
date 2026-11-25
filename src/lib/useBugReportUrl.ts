import { bugReportUrl, type BugReportDraft } from "./bugReport";
import { DIAGNOSTICS_PATH, type DiagnosticReport } from "./diagnosticsApi";
import { useRecentErrors } from "./recentErrors";
import { useApiResource } from "./useApiResource";

type BugReportContext = Pick<BugReportDraft, "errorId" | "message" | "page">;

export function useBugReportUrl(): (context?: BugReportContext) => string {
	const { data: report } = useApiResource<DiagnosticReport>(DIAGNOSTICS_PATH);
	const recentErrors = useRecentErrors();
	return (context = {}) => bugReportUrl({ ...context, report, recentErrors, userAgent: navigator.userAgent });
}
