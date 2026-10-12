import { useAppVersion } from "../../lib/useAppVersion";

export function AppVersionInfo() {
	const version = useAppVersion();

	if (!version) {
		return null;
	}

	return (
		<p className="app-version-info">
			ATS Resume Optimizer {version.current}
			{version.updateAvailable && version.releaseUrl && (
				<>
					{" · "}
					<a className="link" href={version.releaseUrl} target="_blank" rel="noreferrer">
						versão {version.latest} disponível
					</a>
				</>
			)}
		</p>
	);
}
