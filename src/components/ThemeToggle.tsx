import { useTheme } from "../lib/useTheme";
import { MoonIcon, SunIcon } from "./icons";

export function ThemeToggle() {
	const { theme, toggle } = useTheme();
	const label = theme === "dark" ? "Usar tema claro" : "Usar tema escuro";
	const Icon = theme === "dark" ? SunIcon : MoonIcon;
	return (
		<button type="button" className="app-icon-button" onClick={toggle} aria-label={label} title={label}>
			<Icon className="app-icon-button-icon" />
		</button>
	);
}
