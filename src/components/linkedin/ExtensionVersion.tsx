import { MIN_EXTENSION_VERSION, type ExtensionProbe } from "../../lib/linkedinExtension";

function label({ status, version }: ExtensionProbe): string {
	if (status === "missing") {
		return "não detectada";
	}
	const shown = version ? `versão ${version}` : "versão antiga";
	return status === "outdated" ? `${shown} (desatualizada, precisa da ${MIN_EXTENSION_VERSION})` : `${shown} (atualizada)`;
}

export function ExtensionVersion({ probe }: { probe: ExtensionProbe | null }) {
	if (!probe) {
		return null;
	}
	return (
		<p className="field-hint" data-testid="extension-version">
			Extensão do Chrome: {label(probe)}
		</p>
	);
}
