import { useLocation, useNavigate } from "react-router-dom";
import { AiSettingsPanel } from "../components/settings/AiSettingsPanel";
import { AppVersionInfo } from "../components/settings/AppVersionInfo";
import { DatabaseSettingsPanel } from "../components/settings/DatabaseSettingsPanel";
import { NotificationSettingsPanel } from "../components/settings/NotificationSettingsPanel";
import { OnboardingToggle } from "../components/settings/OnboardingToggle";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { useDesktopDatabase } from "../lib/useDesktopDatabase";

type SettingsTab = "ai" | "notifications" | "database";

const TAB_PATHS: Record<SettingsTab, string> = {
	ai: "/settings",
	notifications: "/settings/notifications",
	database: "/settings/database",
};

const TAB_TITLES: Record<SettingsTab, string> = {
	ai: "Inteligência artificial",
	notifications: "Notificações",
	database: "Banco de dados",
};

function tabOf(pathname: string): SettingsTab {
	const match = (Object.keys(TAB_PATHS) as SettingsTab[]).find((tab) => TAB_PATHS[tab] === pathname);
	return match ?? "ai";
}

export function SettingsPage() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { data: database } = useDesktopDatabase();
	const tabs = (Object.keys(TAB_TITLES) as SettingsTab[]).filter((tab) => tab !== "database" || database !== null);
	const tab = tabOf(pathname);

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Configurações</span>
					<h1>{TAB_TITLES[tab]}</h1>
				</div>
			</header>
			<SegmentedTabs
				label="Seções de configuração"
				options={tabs.map((value) => ({ value, label: TAB_TITLES[value] }))}
				value={tab}
				onChange={(next) => navigate(TAB_PATHS[next])}
			/>
			{tab === "ai" && <AiSettingsPanel />}
			{tab === "notifications" && <NotificationSettingsPanel />}
			{tab === "database" && database && <DatabaseSettingsPanel settings={database} />}
			<AppVersionInfo />
			<OnboardingToggle />
		</div>
	);
}
