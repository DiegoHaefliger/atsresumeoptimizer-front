import { useLocation, useNavigate } from "react-router-dom";
import { AiSettingsPanel } from "../components/settings/AiSettingsPanel";
import { NotificationSettingsPanel } from "../components/settings/NotificationSettingsPanel";
import { SegmentedTabs } from "../components/SegmentedTabs";

type SettingsTab = "ai" | "notifications";

const TAB_PATHS: Record<SettingsTab, string> = {
	ai: "/settings",
	notifications: "/settings/notifications",
};

const TAB_OPTIONS: { value: SettingsTab; label: string }[] = [
	{ value: "ai", label: "Inteligência artificial" },
	{ value: "notifications", label: "Notificações" },
];

export function SettingsPage() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const tab: SettingsTab = pathname === TAB_PATHS.notifications ? "notifications" : "ai";

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Configurações</span>
					<h1>{tab === "ai" ? "Inteligência artificial" : "Notificações"}</h1>
				</div>
			</header>
			<SegmentedTabs label="Seções de configuração" options={TAB_OPTIONS} value={tab} onChange={(next) => navigate(TAB_PATHS[next])} />
			{tab === "ai" ? <AiSettingsPanel /> : <NotificationSettingsPanel />}
		</div>
	);
}
