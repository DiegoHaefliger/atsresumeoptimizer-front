export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const FILE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,.pdf,.docx,.odt,.txt,.md,.csv";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const DOCUMENT_EXTENSIONS = ["pdf", "docx", "odt", "txt", "md", "csv"];

export type FileCheck = { accepted: File[]; errors: string[] };

export function isImage(file: { type: string }): boolean {
	return IMAGE_TYPES.includes(file.type);
}

function extensionOf(name: string): string {
	const dot = name.lastIndexOf(".");
	return dot < 0 ? "" : name.slice(dot + 1).toLowerCase();
}

export function checkFiles(current: File[], incoming: File[]): FileCheck {
	const accepted: File[] = [];
	const errors: string[] = [];
	for (const file of incoming) {
		if (current.length + accepted.length >= MAX_FILES) {
			errors.push(`Só dá para anexar ${MAX_FILES} arquivos por mensagem.`);
			break;
		}
		if (!isImage(file) && !DOCUMENT_EXTENSIONS.includes(extensionOf(file.name))) {
			errors.push(`${file.name}: tipo não suportado. Use imagem (PNG, JPEG, WebP, GIF) ou PDF, DOCX, ODT, TXT, MD.`);
		} else if (file.size === 0) {
			errors.push(`${file.name}: o arquivo está vazio.`);
		} else if (file.size > MAX_FILE_BYTES) {
			errors.push(`${file.name}: passa de 5 MB.`);
		} else {
			accepted.push(file);
		}
	}
	return { accepted, errors };
}

export function formatSize(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${Math.round(bytes / 1024)} KB`;
	}
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
