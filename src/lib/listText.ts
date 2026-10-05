const SEPARATOR = /[,;\n]/;

export function parseList(text: string): string[] {
	return text
		.split(SEPARATOR)
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

export function formatList(items: string[] | undefined): string {
	return (items ?? []).join(", ");
}
