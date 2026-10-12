import { useState } from "react";
import { dismissedUpdate, dismissUpdate } from "../lib/dismissedUpdate";
import { useAppVersion } from "../lib/useAppVersion";
import { DownloadIcon } from "./icons";

export function UpdateBanner() {
	const version = useAppVersion();
	const [dismissed, setDismissed] = useState(dismissedUpdate);

	if (!version?.updateAvailable || !version.latest || !version.releaseUrl || version.latest === dismissed) {
		return null;
	}

	function dismiss(latest: string) {
		dismissUpdate(latest);
		setDismissed(latest);
	}

	return (
		<div className="update-banner" role="status">
			<DownloadIcon className="update-banner-icon" />
			<p className="update-banner-text">
				<strong>Versão {version.latest} disponível.</strong> Você está usando a {version.current}.
			</p>
			<div className="update-banner-actions">
				<a className="update-banner-download" href={version.releaseUrl} target="_blank" rel="noreferrer">
					Baixar
				</a>
				<button type="button" className="btn-secondary btn-small" onClick={() => dismiss(version.latest!)}>
					Agora não
				</button>
			</div>
		</div>
	);
}
