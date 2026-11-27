import { useState } from "react";
import { errorMessage } from "../api/client";
import { downloadDiagnosticBundle } from "./diagnosticsApi";

export function useDiagnosticBundleDownload() {
	const [downloading, setDownloading] = useState(false);
	const [downloaded, setDownloaded] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function download() {
		setError(null);
		setDownloading(true);
		try {
			await downloadDiagnosticBundle();
			setDownloaded(true);
		} catch (caught) {
			setError(errorMessage(caught, "Não deu pra gerar o pacote de diagnóstico."));
		} finally {
			setDownloading(false);
		}
	}

	return { download, downloading, downloaded, error };
}
