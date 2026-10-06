import { useState } from "react";

const CONSOLE_URL = "https://console.cloud.google.com";

export function GoogleSetupGuide({ redirectUri, open }: { redirectUri: string; open: boolean }) {
	const [copied, setCopied] = useState<string | null>(null);

	async function copy(label: string, text: string) {
		await navigator.clipboard.writeText(text);
		setCopied(label);
	}

	return (
		<details className="google-guide" open={open}>
			<summary>Como configurar a integração com o Google</summary>
			<p className="field-hint">
				O Google só abre a tela de login para aplicativos registrados. Este registro é feito uma única vez, por quem
				administra o servidor, e leva uns 5 minutos.
			</p>
			<ol className="google-guide-steps">
				<li>
					Acesse o{" "}
					<a href={CONSOLE_URL} target="_blank" rel="noopener noreferrer" className="link">
						Google Cloud Console
					</a>{" "}
					com a sua conta Google e crie um projeto (menu <strong>Selecionar projeto &gt; Novo projeto</strong>).
				</li>
				<li>
					Em <strong>APIs e serviços &gt; Biblioteca</strong>, procure <strong>Google Calendar API</strong> e clique em{" "}
					<strong>Ativar</strong>.
				</li>
				<li>
					Em <strong>APIs e serviços &gt; Tela de consentimento OAuth</strong> (ou <strong>Google Auth Platform</strong>),
					escolha o tipo <strong>Externo</strong>, informe o nome do app e um e-mail de suporte. Em{" "}
					<strong>Público-alvo</strong>, adicione como usuários de teste os e-mails que vão conectar a agenda.
				</li>
				<li>
					Em <strong>APIs e serviços &gt; Credenciais &gt; Criar credenciais &gt; ID do cliente OAuth</strong>, escolha{" "}
					<strong>Aplicativo da Web</strong> e cadastre em <strong>URIs de redirecionamento autorizados</strong>:
					<span className="google-guide-copy">
						<code>{redirectUri}</code>
						<button type="button" className="btn-secondary btn-small" onClick={() => copy("redirect", redirectUri)}>
							{copied === "redirect" ? "Copiado" : "Copiar"}
						</button>
					</span>
				</li>
				<li>
					Copie o <strong>ID do cliente</strong> e a <strong>chave secreta</strong> para o arquivo <code>.env</code> do
					backend e reinicie o servidor:
					<span className="google-guide-copy">
						<code>GOOGLE_CLIENT_ID=...{"\n"}GOOGLE_CLIENT_SECRET=...</code>
						<button
							type="button"
							className="btn-secondary btn-small"
							onClick={() => copy("env", "GOOGLE_CLIENT_ID=\nGOOGLE_CLIENT_SECRET=\n")}
						>
							{copied === "env" ? "Copiado" : "Copiar"}
						</button>
					</span>
				</li>
				<li>Volte a esta tela e clique em <strong>Conectar com o Google</strong>.</li>
			</ol>
			<p className="field-hint">
				Enquanto o app estiver em modo de teste no Google, aparece o aviso de app não verificado (é só continuar) e a
				conexão precisa ser refeita a cada 7 dias.
			</p>
		</details>
	);
}
