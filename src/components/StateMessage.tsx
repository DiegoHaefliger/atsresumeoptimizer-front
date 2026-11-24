import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircleIcon, InboxIcon } from "./icons";

type StateMessageProps = {
	variant?: "error" | "empty";
	layout?: "inline" | "page";
	message: ReactNode;
	action?: { label: string; to: string } | { label: string; onClick: () => void };
};

export function StateMessage({ variant = "error", layout = "inline", message, action }: StateMessageProps) {
	const isError = variant === "error";
	const alert = (
		<p
			className={`alert ${isError ? "alert-error" : "alert-neutral"}`}
			role={isError ? "alert" : "status"}
			style={layout === "page" ? { display: "inline-flex" } : undefined}
		>
			{isError ? <AlertCircleIcon /> : <InboxIcon />}
			<span>{message}</span>
		</p>
	);

	if (layout === "inline") {
		return alert;
	}

	return (
		<div className="empty-state">
			{alert}
			{action && (
				<p>
					{"to" in action ? (
						<Link to={action.to} className="link">
							{action.label}
						</Link>
					) : (
						<button type="button" className="btn-secondary btn-small" onClick={action.onClick}>
							{action.label}
						</button>
					)}
				</p>
			)}
		</div>
	);
}
