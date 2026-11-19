const ORIGIN_PLACEHOLDER = "__APP_ORIGIN__";
const READER_FILE = "linkedin-reader.js";

export function bookmarkletCode(source: string, origin: string): string {
	return source.replace(ORIGIN_PLACEHOLDER, () => origin);
}

export function bookmarkletHref(source: string, origin: string): string {
	return `javascript:${encodeURIComponent(bookmarkletCode(source, origin))}`;
}

export async function fetchReaderSource(): Promise<string> {
	const response = await fetch(`${import.meta.env.BASE_URL}${READER_FILE}`);
	if (!response.ok) {
		throw new Error("Não consegui carregar o leitor do favorito.");
	}
	return response.text();
}
