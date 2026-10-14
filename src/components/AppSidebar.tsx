import type { ComponentType, SVGProps } from "react";
import { NavLink } from "react-router-dom";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import {
	BriefcaseIcon,
	CalendarIcon,
	FileTextIcon,
	InfoIcon,
	MessageSquareIcon,
	NotebookIcon,
	SettingsIcon,
	SlidersIcon,
} from "./icons";

const NAV_ITEMS: { to: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
	{ to: "/jobs", label: "Vagas", Icon: BriefcaseIcon },
	{ to: "/resumes", label: "Currículos", Icon: FileTextIcon },
	{ to: "/calendar", label: "Agenda", Icon: CalendarIcon },
	{ to: "/notes", label: "Notas", Icon: NotebookIcon },
	{ to: "/preferences", label: "Preferências", Icon: SlidersIcon },
	{ to: "/prompts", label: "Instruções", Icon: MessageSquareIcon },
	{ to: "/settings", label: "Configurações", Icon: SettingsIcon },
	{ to: "/about", label: "Sobre", Icon: InfoIcon },
];

export function AppSidebar() {
	return (
		<aside className="app-sidebar">
			<div className="brand">
				<span className="brand-mark">A</span>
				<span className="brand-text">
					<span className="brand-name">ATS Resume</span>
					<span className="brand-tagline">Optimizer</span>
				</span>
			</div>
			<nav className="app-nav" aria-label="Principal">
				{NAV_ITEMS.map(({ to, label, Icon }) => (
					<NavLink key={to} to={to} className="app-nav-link">
						<Icon className="app-nav-icon" />
						<span>{label}</span>
					</NavLink>
				))}
			</nav>
			<div className="app-sidebar-actions">
				<NotificationBell />
				<ThemeToggle />
			</div>
		</aside>
	);
}
