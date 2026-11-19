import { ExtensionUpdateSteps } from "./ExtensionInstallSteps";

export function ExtensionUpdateNotice({ requiredVersion }: { requiredVersion: string }) {
	return (
		<section className="panel" role="alert">
			<div className="panel-header">
				<h2>Atualize a extensão do Chrome</h2>
				<p>
					Há uma versão mais nova da extensão. Atualize para a {requiredVersion} para poder analisar.
				</p>
			</div>
			<div className="panel-body">
				<ExtensionUpdateSteps />
				<p className="field-hint">Este aviso some sozinho quando a extensão atualizada for detectada.</p>
			</div>
		</section>
	);
}
