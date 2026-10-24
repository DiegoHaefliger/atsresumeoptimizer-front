const SOURCE_LABELS: Record<string, string> = {
	LINKEDIN: "LinkedIn",
	LINKEDIN_POST: "Postagem do LinkedIn",
};

export function sourceLabel(source: string | undefined): string {
	return (source && SOURCE_LABELS[source]) || "LinkedIn";
}

export function openLinkLabel(source: string | undefined): string {
	return source === "LINKEDIN_POST" ? "Abrir postagem" : "Abrir no LinkedIn";
}
