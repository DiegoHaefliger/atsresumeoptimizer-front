import { DIAGNOSTICS_PATH, type DiagnosticReport } from "../../lib/diagnosticsApi";
import { useApiResource } from "../../lib/useApiResource";
import { StateMessage } from "../StateMessage";
import { BugReportCallout } from "./BugReportCallout";
import { RecentErrorsPanel } from "./RecentErrorsPanel";
import { SystemInfoPanel } from "./SystemInfoPanel";

export function AboutDiagnosticsTab() {
	const { data: report, failed, reload } = useApiResource<DiagnosticReport>(DIAGNOSTICS_PATH);

	return (
		<div className="diagnostics-page">
			<BugReportCallout />

			<RecentErrorsPanel />

			{report ? (
				<SystemInfoPanel report={report} />
			) : failed ? (
				<StateMessage
					message="Não deu pra consultar o servidor. Se o app não abre, o log fica na pasta .ats-resume-optimizer/logs dentro da sua pasta de usuário."
					action={{ label: "Tentar de novo", onClick: reload }}
					layout="page"
				/>
			) : (
				<p className="diagnostics-empty">Carregando informações do sistema...</p>
			)}
		</div>
	);
}
