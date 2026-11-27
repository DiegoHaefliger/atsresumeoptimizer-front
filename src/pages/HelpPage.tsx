import { useSearchParams } from "react-router-dom";
import { HelpDiagnosticsTab } from "../components/help/HelpDiagnosticsTab";
import { HelpFeedbackTab } from "../components/help/HelpFeedbackTab";
import { HelpSupportTab } from "../components/help/HelpSupportTab";
import { PageTabs } from "../components/PageTabs";
import { HELP_TAB_PARAM, isHelpTab, type HelpTab } from "../lib/helpTabs";

const TAB_OPTIONS: { value: HelpTab; label: string }[] = [
	{ value: "support", label: "Suporte" },
	{ value: "diagnostics", label: "Diagnóstico" },
	{ value: "feedback", label: "Avaliar o app" },
];

export function HelpPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const requested = searchParams.get(HELP_TAB_PARAM);
	const tab: HelpTab = isHelpTab(requested) ? requested : "support";
	const setTab = (next: HelpTab) => setSearchParams({ [HELP_TAB_PARAM]: next }, { replace: true });

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Ajuda</span>
					<h1>Ajuda e suporte</h1>
					<p className="page-subtitle">Tire dúvidas, confira se o app está funcionando, relate problemas e dê sua opinião.</p>
				</div>
			</header>
			<PageTabs label="Seções da Ajuda" options={TAB_OPTIONS} value={tab} onChange={setTab} />
			{tab === "support" && <HelpSupportTab onOpenDiagnostics={() => setTab("diagnostics")} />}
			{tab === "diagnostics" && <HelpDiagnosticsTab />}
			{tab === "feedback" && <HelpFeedbackTab />}
		</div>
	);
}
