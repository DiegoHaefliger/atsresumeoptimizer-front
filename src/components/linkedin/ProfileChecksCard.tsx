import type { LinkedInProfileCheckResponse } from "../../api/linkedinTypes";

export function ProfileChecksCard({ checks }: { checks: LinkedInProfileCheckResponse[] }) {
	if (checks.length === 0) {
		return null;
	}
	const passed = checks.filter((check) => check.passed).length;
	const failedFirst = [...checks].sort((a, b) => Number(a.passed) - Number(b.passed));
	return (
		<section className="panel">
			<div className="panel-header">
				<h2>Checklist do perfil</h2>
				<p>
					{passed} de {checks.length} verificações ok. São conferências automáticas, iguais a cada análise.
				</p>
			</div>
			<ul className="panel-body profile-checks">
				{failedFirst.map((check) => (
					<li key={check.label} className={check.passed ? "profile-check profile-check-ok" : "profile-check profile-check-fail"}>
						<span className="profile-check-icon" aria-hidden="true">
							{check.passed ? "✓" : "✕"}
						</span>
						<span className="profile-check-body">
							<span className="profile-check-label">{check.label}</span>
							<span className="sr-only">{check.passed ? ": ok" : ": ajustar"}</span>
							{!check.passed && (
								<dl className="profile-check-detail">
									{check.section && <CheckLine term="Onde" value={check.section} />}
									{check.current && <CheckLine term="Hoje" value={check.current} />}
									{check.action && <CheckLine term="Mudar" value={check.action} emphasis />}
								</dl>
							)}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}

function CheckLine({ term, value, emphasis = false }: { term: string; value: string; emphasis?: boolean }) {
	return (
		<div className={emphasis ? "profile-check-line profile-check-line-action" : "profile-check-line"}>
			<dt>{term}</dt>
			<dd>{value}</dd>
		</div>
	);
}
