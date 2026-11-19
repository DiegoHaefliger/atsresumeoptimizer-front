import { isOlderVersion, MIN_EXTENSION_VERSION } from "../../lib/linkedinExtension";
import type { ExtensionState } from "./useExtensionStatus";

function label({ status, version, availableVersion }: NonNullable<ExtensionState>): string {
	if (status === "missing") {
		return "não detectada";
	}
	const shown = version ? `versão ${version}` : "versão antiga";
	if (status === "outdated") {
		return `${shown} (desatualizada, precisa da ${MIN_EXTENSION_VERSION})`;
	}
	if (availableVersion && version && isOlderVersion(version, availableVersion)) {
		return `${shown} (há uma versão mais nova, ${availableVersion}; atualize quando puder)`;
	}
	return `${shown} (em dia)`;
}

export function ExtensionVersion({ probe }: { probe: ExtensionState }) {
	if (!probe) {
		return null;
	}
	return (
		<p className="field-hint" data-testid="extension-version">
			Extensão do Chrome: {label(probe)}
		</p>
	);
}
