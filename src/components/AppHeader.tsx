import type { ComponentType, SVGProps } from "react";
import { NavLink } from "react-router-dom";
import { BriefcaseIcon, ClipboardCheckIcon, FileTextIcon, MessageSquareIcon, SettingsIcon, SlidersIcon } from "./icons";

const NAV_ITEMS: { to: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
	{ to: "/upload", label: "Nova análise", Icon: ClipboardCheckIcon },
	{ to: "/resumes", label: "Currículos", Icon: FileTextIcon },
	{ to: "/jobs", label: "Vagas", Icon: BriefcaseIcon },
	{ to: "/preferences", label: "Preferências", Icon: SlidersIcon },
	{ to: "/prompts", label: "Instruções", Icon: MessageSquareIcon },
	{ to: "/settings", label: "Configurações", Icon: SettingsIcon },
];

export function AppHeader() {
	return (
		<header className="app-header">
			<div className="app-bar">
				<div className="brand">
					<span className="brand-mark">A</span>
					<span className="brand-name">ATS Resume Optimizer</span>
				</div>
				<nav className="app-nav" aria-label="Principal">
					{NAV_ITEMS.map(({ to, label, Icon }) => (
						<NavLink key={to} to={to} className="app-nav-link">
							<Icon className="app-nav-icon" />
							<span>{label}</span>
						</NavLink>
					))}
				</nav>
			</div>
		</header>
	);
}
