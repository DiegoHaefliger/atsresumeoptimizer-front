import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useFromHere } from "../lib/backTarget";
import type { SummaryStep } from "../lib/jobSummary";
import { ArrowRightIcon, CheckCircleIcon } from "./icons";

type JobSummaryStepProps = {
	step: SummaryStep;
	actions?: ReactNode;
};

export function JobSummaryStep({ step, actions }: JobSummaryStepProps) {
	const from = useFromHere();
	return (
		<li className={`job-summary-step${step.done ? " job-summary-step-done" : ""}`}>
			<span className="job-summary-mark" aria-hidden="true">
				{step.done ? <CheckCircleIcon /> : <span className="job-summary-dot" />}
			</span>
			<div className="job-summary-body">
				<strong>{step.title}</strong>
				<span className="job-summary-detail">{step.detail}</span>
				<div className="job-summary-links">
					{actions}
					{step.links.map((link) => (
						<Link
							key={link.to + link.label}
							to={link.to}
							className={`job-summary-chip${step.done ? "" : " job-summary-chip-primary"}`}
							state={from}
						>
							{link.label} <ArrowRightIcon />
						</Link>
					))}
				</div>
			</div>
		</li>
	);
}
