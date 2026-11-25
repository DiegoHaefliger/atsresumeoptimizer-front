import { Link } from "react-router-dom";
import { ArrowRightIcon, GitHubIcon } from "../icons";

export function BugReportShortcut() {
	return (
		<section className="bug-callout panel" aria-labelledby="bug-shortcut-title">
			<span className="bug-callout-icon">
				<GitHubIcon />
			</span>
			<div className="bug-callout-body">
				<span className="bug-callout-eyebrow">Canal oficial para bugs</span>
				<h2 id="bug-shortcut-title">Encontrou um problema? Relate pela aba Diagnóstico</h2>
				<p>
					Bugs são acompanhados pelas issues do GitHub. Na aba Diagnóstico você baixa o pacote de diagnóstico, abre a
					issue já preenchida e anexa o pacote nela.
				</p>
			</div>
			<div className="bug-callout-actions">
				<Link className="bug-callout-primary" to="/about?tab=diagnostics">
					Ir para Diagnóstico <ArrowRightIcon />
				</Link>
			</div>
		</section>
	);
}
