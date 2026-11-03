export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 3 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export type AddedFiles = { files: File[]; error: string | null };

export function addFiles(current: File[], incoming: File[]): AddedFiles {
	const files = [...current];
	let error: string | null = null;
	for (const file of incoming) {
		if (!ACCEPTED_TYPES.includes(file.type)) {
			error = "Use imagens PNG, JPG ou WebP.";
		} else if (file.size > MAX_FILE_BYTES) {
			error = "Cada imagem deve ter até 3 MB.";
		} else if (files.length >= MAX_FILES) {
			error = `Dá para anexar no máximo ${MAX_FILES} imagens.`;
		} else {
			files.push(file);
		}
	}
	return { files, error };
}

export function formatSize(bytes: number): string {
	return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
