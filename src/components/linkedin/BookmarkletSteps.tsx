import { useEffect, useRef, useState } from "react";
import { bookmarkletCode, bookmarkletHref, fetchReaderSource } from "../../lib/bookmarklet";

const COPIED_FEEDBACK_MS = 4000;

export function BookmarkletSteps() {
	const [source, setSource] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);
	const [copied, setCopied] = useState(false);
	const link = useRef<HTMLAnchorElement>(null);

	useEffect(() => {
		fetchReaderSource().then(setSource, () => setFailed(true));
	}, []);

	useEffect(() => {
		if (source && link.current) {
			link.current.setAttribute("href", bookmarkletHref(source, window.location.origin));
		}
	}, [source]);

	async function copy() {
		if (!source) {
			return;
		}
		await navigator.clipboard.writeText(bookmarkletCode(source, window.location.origin));
		setCopied(true);
		window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
	}

	return (
		<>
			{failed && <p className="alert alert-error">Não consegui preparar o favorito. Recarregue a página.</p>}
			<ol className="linkedin-steps">
				<li>
					Arraste este botão para a barra de favoritos (Ctrl+Shift+B mostra a barra):{" "}
					<a
						ref={link}
						className="btn-secondary btn-small"
						style={{ display: "inline-block", textDecoration: "none", cursor: source ? "grab" : "default" }}
						draggable={Boolean(source)}
						onClick={(event) => event.preventDefault()}
					>
						Ler meu LinkedIn
					</a>
					<br />
					<span className="field-hint">
						Não conseguiu arrastar?{" "}
						<button type="button" className="link" onClick={() => void copy()} disabled={!source}>
							Copiar o código
						</button>{" "}
						e cole no endereço de um favorito novo.{copied ? " Copiado." : ""}
					</span>
				</li>
				<li>Abra o seu perfil no LinkedIn, já logado, e clique no favorito. Uma janela do app vai abrir com o que foi lido.</li>
				<li>Para competências, certificações e experiências completas, abra cada página “Mostrar tudo” e clique no favorito de novo.</li>
				<li>Na janela do app, clique em “Enviar e analisar”.</li>
			</ol>
		</>
	);
}
