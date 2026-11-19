import { useState, type MouseEvent } from "react";
import { DownloadIcon } from "../icons";

const EXTENSION_FILE = "ats-linkedin-extension.zip";
const EXTENSIONS_PAGE = "chrome://extensions";

const COPIED_FEEDBACK_MS = 4000;

function ExtensionsLink() {
	const [copied, setCopied] = useState(false);

	async function copy(event: MouseEvent<HTMLAnchorElement>) {
		event.preventDefault();
		await navigator.clipboard.writeText(EXTENSIONS_PAGE);
		setCopied(true);
		window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
	}

	return (
		<>
			Abra uma nova aba do Chrome e vá em{" "}
			<a href={EXTENSIONS_PAGE} onClick={copy}>
				<code>{EXTENSIONS_PAGE}</code>
			</a>
			{copied ? " (copiado, é só colar na barra de endereço)" : " (clique para copiar)"}
		</>
	);
}

function downloadExtension() {
	const link = document.createElement("a");
	link.href = `${import.meta.env.BASE_URL}${EXTENSION_FILE}`;
	link.download = EXTENSION_FILE;
	link.click();
}

export function ExtensionUpdateSteps() {
	return (
		<>
			<div className="linkedin-actions">
				<button type="button" onClick={downloadExtension}>
					<DownloadIcon /> Baixar extensão atualizada
				</button>
			</div>
			<ol className="linkedin-steps">
				<li>Extraia o arquivo baixado por cima da mesma pasta que você já usa, substituindo os arquivos.</li>
				<li>
					<ExtensionsLink />
				</li>
				<li>Na extensão do app, clique no ícone de recarregar (↻). Se o Chrome pedir permissões novas, aceite.</li>
			</ol>
		</>
	);
}

export function ExtensionInstallSteps() {
	return (
		<>
			<div className="linkedin-actions">
				<button type="button" onClick={downloadExtension}>
					<DownloadIcon /> Baixar extensão
				</button>
			</div>
			<ol className="linkedin-steps">
				<li>Abra o arquivo baixado e extraia tudo numa pasta (clique direito, “Extrair tudo”). Guarde a pasta, ela não pode ser apagada.</li>
				<li>
					<ExtensionsLink />
				</li>
				<li>Ligue a chave “Modo do desenvolvedor”, no canto superior direito.</li>
				<li>Clique em “Carregar sem compactação” e escolha a pasta que você extraiu.</li>
			</ol>
			<p className="field-hint">
				Já tem a extensão? Extraia o arquivo novo por cima da pasta atual, abra <code>chrome://extensions</code> e clique no ícone de recarregar (↻)
				da extensão, aceitando as permissões novas se o Chrome pedir.
			</p>
		</>
	);
}
