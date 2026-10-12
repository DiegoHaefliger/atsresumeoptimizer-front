import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "ats-theme";

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function storedTheme(): Theme | null {
	try {
		const value = localStorage.getItem(THEME_STORAGE_KEY);
		return value === "light" || value === "dark" ? value : null;
	} catch {
		return null;
	}
}

function systemTheme(): Theme {
	return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
}

function persistTheme(theme: Theme) {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		return;
	}
}

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(() => storedTheme() ?? systemTheme());

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);

	useEffect(() => {
		const media = window.matchMedia(DARK_SCHEME_QUERY);
		const followSystem = () => {
			if (storedTheme() === null) {
				setTheme(systemTheme());
			}
		};
		media.addEventListener("change", followSystem);
		return () => media.removeEventListener("change", followSystem);
	}, []);

	function toggle() {
		const next: Theme = theme === "dark" ? "light" : "dark";
		persistTheme(next);
		setTheme(next);
	}

	return { theme, toggle };
}
