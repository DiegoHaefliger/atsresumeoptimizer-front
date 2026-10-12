import { Link } from "react-router-dom";
import { setOnboardingDismissed, useOnboardingDismissed } from "../lib/onboardingDismissed";
import { useOnboarding } from "../lib/useOnboarding";
import { CheckCircleIcon } from "./icons";

export function OnboardingPanel() {
	const dismissed = useOnboardingDismissed();
	const steps = useOnboarding(!dismissed);

	if (!steps) {
		return null;
	}
	const required = steps.filter((step) => !step.optional);
	const doneCount = required.filter((step) => step.done).length;
	if (doneCount === required.length) {
		return null;
	}
	const next = steps.find((step) => !step.done && !step.optional);

	return (
		<section className="onboarding" aria-labelledby="onboarding-title">
			<header className="onboarding-header">
				<div>
					<h2 id="onboarding-title">Primeiros passos</h2>
					<p>
						{doneCount} de {required.length} feitos. Siga a ordem: cada passo prepara o seguinte.
					</p>
				</div>
				<button type="button" className="btn-secondary btn-small" onClick={() => setOnboardingDismissed(true)}>
					Ocultar guia
				</button>
			</header>
			<div
				className="onboarding-progress"
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={required.length}
				aria-valuenow={doneCount}
				aria-label="Progresso dos primeiros passos"
			>
				<span style={{ width: `${(doneCount / required.length) * 100}%` }} />
			</div>
			<ol className="onboarding-steps">
				{steps.map((step, index) => {
					const current = step.id === next?.id;
					return (
						<li
							key={step.id}
							className={`onboarding-step${step.done ? " onboarding-step-done" : ""}${current ? " onboarding-step-current" : ""}`}
						>
							<span className="onboarding-step-marker" aria-hidden="true">
								{step.done ? <CheckCircleIcon /> : index + 1}
							</span>
							<div className="onboarding-step-body">
								<strong>
									{step.title}
									{step.optional && <span className="onboarding-step-optional"> (opcional)</span>}
								</strong>
								<span>{step.done ? "Feito." : step.description}</span>
							</div>
							{!step.done && (
								<Link to={step.action.to} className={`button-link onboarding-step-action${current ? "" : " button-link-secondary"}`}>
									{step.action.label}
								</Link>
							)}
							<span className="sr-only">{step.done ? "Concluído" : "Pendente"}</span>
						</li>
					);
				})}
			</ol>
		</section>
	);
}
