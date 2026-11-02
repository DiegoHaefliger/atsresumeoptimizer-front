import { apiUrl } from "../api/client";
import { useServerUnreachable } from "../lib/serverReachability";
import { AlertCircleIcon, RefreshIcon } from "./icons";

export function ConnectionBanner() {
	if (!useServerUnreachable()) {
		return null;
	}
	return (
		<div className="update-banner connection-banner" role="alert">
			<AlertCircleIcon className="update-banner-icon" />
			<p className="update-banner-text">
				<strong>Sem conexão com o servidor.</strong> O backend em {new URL(apiUrl("/")).host} não respondeu ou recusou a
				origem {window.location.host} (CORS). Os dados não vão carregar até isso voltar.
			</p>
			<div className="update-banner-actions">
				<button type="button" className="btn-small" onClick={() => window.location.reload()}>
					<RefreshIcon /> Tentar de novo
				</button>
			</div>
		</div>
	);
}
