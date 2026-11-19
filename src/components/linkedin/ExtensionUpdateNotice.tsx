import { MIN_EXTENSION_VERSION } from "../../lib/linkedinExtension";
import { ExtensionUpdateSteps } from "./ExtensionInstallSteps";

export function ExtensionUpdateNotice() {
	return (
		<section className="panel" role="alert">
			<div className="panel-header">
				<h2>Atualize a extensão do Chrome</h2>
				<p>
					A versão instalada lê o perfil incompleto (faltam Competências, Formação e outras seções). Atualize para a {MIN_EXTENSION_VERSION} para
					a análise usar tudo.
				</p>
			</div>
			<div className="panel-body">
				<ExtensionUpdateSteps />
				<p className="field-hint">Este aviso some sozinho quando a extensão atualizada for detectada.</p>
			</div>
		</section>
	);
}
