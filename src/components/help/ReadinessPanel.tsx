import type { ReadinessCheck, ReadinessStatus } from "../../lib/diagnosticsApi";
import { worstReadiness } from "../../lib/readiness";
import { AlertCircleIcon, CheckCircleIcon, RefreshIcon } from "../icons";

type ReadinessPanelProps = {
	checks: ReadinessCheck[];
	verdict: string;
	onRecheck: () => void;
};

const STATUS_LABELS: Record<ReadinessStatus, string> = { OK: "OK", WARNING: "Atenção", FAILURE: "Falha" };

export function ReadinessPanel({ checks, verdict, onRecheck }: ReadinessPanelProps) {
	return (
		<section className="diagnostics-block" aria-labelledby="readiness-title">
			<header className="diagnostics-block-header">
				<div>
					<h2 id="readiness-title">Verificação do sistema</h2>
					<p>Tudo que o app precisa pra funcionar. Essa verificação também vai no pacote de diagnóstico.</p>
				</div>
				<button type="button" className="btn-secondary btn-small" onClick={onRecheck}>
					<RefreshIcon /> Verificar de novo
				</button>
			</header>
			<p className={`readiness-verdict readiness-${worstReadiness(checks).toLowerCase()}`} aria-live="polite">
				{verdict}
			</p>
			<ul className="readiness-list panel">
				{checks.map((check) => (
					<li key={check.name} className={`readiness-item readiness-${check.status.toLowerCase()}`}>
						{check.status === "OK" ? <CheckCircleIcon aria-hidden /> : <AlertCircleIcon aria-hidden />}
						<div>
							<p className="readiness-name">
								{check.name} <span className="sr-only">— {STATUS_LABELS[check.status]}</span>
							</p>
							<p className="readiness-detail">{check.detail}</p>
							{check.hint && <p className="readiness-hint">{check.hint}</p>}
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}
