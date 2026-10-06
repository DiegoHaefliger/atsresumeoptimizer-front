import { CheckCircleIcon } from "./icons";

export type StepInfo = { label: string; summary?: string };

type StepIndicatorProps = {
	steps: StepInfo[];
	current: number;
	onSelect: (step: number) => void;
};

export function StepIndicator({ steps, current, onSelect }: StepIndicatorProps) {
	return (
		<ol className="stepper" aria-label="Etapas da análise">
			{steps.map((step, index) => {
				const number = index + 1;
				const done = number < current;
				const active = number === current;
				return (
					<li key={step.label} className={`stepper-item${done ? " is-done" : ""}${active ? " is-active" : ""}`}>
						<button
							type="button"
							className="stepper-button"
							disabled={!done}
							onClick={() => onSelect(number)}
							aria-current={active ? "step" : undefined}
						>
							<span className="form-step-number">{done ? <CheckCircleIcon /> : number}</span>
							<span className="stepper-text">
								<span className="stepper-label">{step.label}</span>
								{done && step.summary && <span className="stepper-summary">{step.summary}</span>}
							</span>
						</button>
					</li>
				);
			})}
		</ol>
	);
}
