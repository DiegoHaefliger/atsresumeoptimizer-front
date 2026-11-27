export type HelpTab = "support" | "diagnostics" | "feedback";

export const HELP_PATH = "/help";
export const HELP_TAB_PARAM = "tab";

const HELP_TABS: readonly HelpTab[] = ["support", "diagnostics", "feedback"];

export function isHelpTab(value: string | null): value is HelpTab {
	return HELP_TABS.includes(value as HelpTab);
}

export function helpPath(tab: HelpTab): string {
	return `${HELP_PATH}?${HELP_TAB_PARAM}=${tab}`;
}
