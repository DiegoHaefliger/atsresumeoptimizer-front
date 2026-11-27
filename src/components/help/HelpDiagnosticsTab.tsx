import { DIAGNOSTICS_PATH, type DiagnosticReport } from "../../lib/diagnosticsApi";
import { useApiResource } from "../../lib/useApiResource";
import { StateMessage } from "../StateMessage";
import { ReadinessPanel } from "./ReadinessPanel";
import { RecentErrorsPanel } from "./RecentErrorsPanel";
import { SystemInfoPanel } from "./SystemInfoPanel";

export function HelpDiagnosticsTab() {
	const { data: report, failed, reload } = useApiResource<DiagnosticReport>(DIAGNOSTICS_PATH);

	if (failed) {
		return (
			<div className="diagnostics-page">
				<StateMessage
					message="Não deu pra consultar o servidor. Se o app não abre, o log fica na pasta .ats-resume-optimizer/logs dentro da sua pasta de usuário."
					action={{ label: "Tentar de novo", onClick: reload }}
					layout="page"
				/>
				<RecentErrorsPanel />
			</div>
		);
	}

	return (
		<div className="diagnostics-page">
			{report ? (
				<ReadinessPanel checks={report.checks} verdict={report.verdict} onRecheck={reload} />
			) : (
				<p className="diagnostics-empty">Verificando o sistema...</p>
			)}
			<RecentErrorsPanel />
			{report && <SystemInfoPanel report={report} />}
		</div>
	);
}
