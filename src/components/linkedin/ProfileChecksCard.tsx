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
						<span>
							<span className="profile-check-label">{check.label}</span>
							<span className="sr-only">{check.passed ? ": ok" : ": ajustar"}</span>
							{!check.passed && check.detail && <span className="field-hint profile-check-detail">{check.detail}</span>}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}
