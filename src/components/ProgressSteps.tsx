import { CheckCircleIcon, SpinnerIcon } from "./icons";

export type ProgressStep = { key: string; label: string };

type ProgressStepsProps = {
	title: string;
	hint?: string;
	steps?: ProgressStep[];
	currentKey?: string;
	currentIndex?: number;
};

export function ProgressSteps({ title, hint, steps = [], currentKey, currentIndex: forcedIndex }: ProgressStepsProps) {
	const currentIndex = forcedIndex ?? Math.max(0, steps.findIndex((step) => step.key === currentKey));
	return (
		<div className="progress-card" role="status" aria-live="polite">
			<div className="progress-card-header">
				<SpinnerIcon />
				<div>
					<span className="progress-card-title">{title}</span>
					{hint && <span className="progress-card-hint">{hint}</span>}
				</div>
			</div>
			<div className="progress-bar" aria-hidden="true">
				<span className="progress-bar-fill" />
			</div>
			{steps.length > 0 && (
				<ol className="progress-steps">
					{steps.map((step, index) => {
						const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "pending";
						return (
							<li key={step.key} className={`progress-step progress-step-${state}`}>
								{state === "done" ? <CheckCircleIcon /> : <span className="progress-step-dot" aria-hidden="true" />}
								<span>{step.label}</span>
								{state === "current" && <span className="sr-only">(em andamento)</span>}
							</li>
						);
					})}
				</ol>
			)}
		</div>
	);
}
