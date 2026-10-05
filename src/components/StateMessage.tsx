import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircleIcon, InboxIcon } from "./icons";

type StateMessageProps = {
	variant?: "error" | "empty";
	layout?: "inline" | "page";
	message: ReactNode;
	action?: { label: string; to: string };
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
					<Link to={action.to} className="link">
						{action.label}
					</Link>
				</p>
			)}
		</div>
	);
}
